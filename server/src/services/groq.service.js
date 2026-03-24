import axios from "axios";
import { getLanguageFromExtension } from "../utils/langMap.js";
import {
  parseReadmeSections,
  hashSections,
  mergePatchedSections,
} from "../utils/readme.parser.js";
import {
  validatePatches,
  FORBIDDEN_SECTIONS,
} from "../utils/readme.validator.js";
import {
  buildImpactMappingPrompt,
  buildPatchSystemPrompt,
  buildPatchUserPrompt,
} from "../utils/prompt.builder.js";
import {
  callGeminiAPI,
  GEMINI_MODEL,
  GEMINI_MODEL_MINI,
  PROVIDER_LIMITS,
} from "./gemini.service.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_MODEL_MINI = "llama-3.3-70b-versatile";

// ~4 chars per token is a rough but fast enough estimate for budget checks
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// Routes to the right provider — Gemini and Groq have different request shapes
async function callLLMAPI({
  messages,
  model,
  maxTokens,
  temperature,
  apiKey,
  provider,
  responseMimeType,
  timeout = 60000,
}) {
  if (provider === "gemini") {
    return callGeminiAPI(
      messages,
      { model, maxTokens, temperature, responseMimeType },
      apiKey,
      timeout,
    );
  }

  const response = await axios.post(
    GROQ_API_URL,
    { model, messages, temperature, max_tokens: maxTokens },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout,
    },
  );
  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Invalid response from Groq API");
  return text;
}

// 429 rate limit, 401/403 bad key, 413 payload too large, 503 overloaded —
// all safe to retry with a different key. Anything else is a real error.
function isRetriableError(error) {
  if (error.response) {
    return [429, 401, 403, 413, 503].includes(error.response.status);
  }
  return !!error.request;
}

// Gemini keys come first so they're always tried before Groq.
// keyIndex/keyTotal let logs show "Gemini key 1/3" instead of "key 1/6".
function buildProviderList() {
  const geminiKeys = [
    process.env.GEMINI_API_KEY1,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_API_KEY3,
  ].filter(Boolean);

  const groqKeys = [
    process.env.GROQ_API_KEY1,
    process.env.GROQ_API_KEY2,
    process.env.GROQ_API_KEY3,
  ].filter(Boolean);

  return [
    ...geminiKeys.map((k, idx) => ({
      key: k,
      provider: "gemini",
      label: "Gemini",
      keyIndex: idx + 1,
      keyTotal: geminiKeys.length,
      modelMain: GEMINI_MODEL,
      modelMini: GEMINI_MODEL_MINI,
    })),
    ...groqKeys.map((k, idx) => ({
      key: k,
      provider: "groq",
      label: "Groq (fallback)",
      keyIndex: idx + 1,
      keyTotal: groqKeys.length,
      modelMain: GROQ_MODEL,
      modelMini: GROQ_MODEL_MINI,
    })),
  ];
}

// Step 1 of full generation — sends only file metadata (paths + token estimates),
// NOT content. The mini model picks which files are worth including so we don't
// blow the context budget on irrelevant files in step 2.
async function getFileRecommendations(context, apiKey, provider, modelMini) {
  const { maxInputTokens } = PROVIDER_LIMITS[provider];
  const {
    repoName,
    repoOwner,
    repoStructure,
    fullCodebase,
    changedFiles,
    existingReadme,
  } = context;

  const fileMetadata = [];

  if (fullCodebase && fullCodebase.length > 0) {
    fullCodebase.forEach((file) => {
      fileMetadata.push({
        path: file.path,
        estimatedTokens: estimateTokens(file.content),
        description: file.description || null,
      });
    });
  }

  if (changedFiles && changedFiles.length > 0) {
    changedFiles.forEach((file) => {
      if (!fileMetadata.some((f) => f.path === file.path)) {
        fileMetadata.push({
          path: file.path,
          estimatedTokens: estimateTokens(file.content),
          isChanged: true,
        });
      }
    });
  }

  const totalEstimatedTokens = fileMetadata.reduce(
    (sum, f) => sum + f.estimatedTokens,
    0,
  );
  const hasExistingReadme = !!existingReadme;
  const existingReadmeTokens = estimateTokens(existingReadme);

  const analysisPrompt = `You are helping decide which files to include for README generation.

## Repository: ${repoOwner}/${repoName}

## Repository Structure:
\`\`\`
${repoStructure}
\`\`\`

## Available Files with Token Estimates:
${JSON.stringify(fileMetadata, null, 2)}

## Context:
- Total estimated tokens if all files included: ${totalEstimatedTokens}
- Has existing README: ${hasExistingReadme} (${existingReadmeTokens} tokens)
- Maximum allowed input tokens: ${maxInputTokens}
- Reserve ~1500 tokens for system prompt and instructions

## Task:
Select the MOST IMPORTANT files for generating a comprehensive README. Prioritize:
1. Main entry points (index.js, main.py, app.js, etc.)
2. Package.json, requirements.txt, Cargo.toml (dependencies/project info)
3. Config files that show how to set up the project
4. Key API/route files that show functionality
5. Recently changed files (marked isChanged: true)

Respond with ONLY a JSON object (no markdown, no explanation):
{
  "selectedFiles": ["path/to/file1", "path/to/file2"],
  "includeExistingReadme": true/false,
  "truncateReadme": true/false,
  "reasoning": "brief explanation"
}`;

  const content = await callLLMAPI({
    messages: [{ role: "user", content: analysisPrompt }],
    model: modelMini,
    maxTokens: 1000,
    temperature: 0.1,
    apiKey,
    provider,
    timeout: 30000,
    responseMimeType: provider === "gemini" ? "application/json" : null,
  });

  if (!content) {
    throw new Error("Invalid response from file analysis");
  }

  try {
    const cleanContent = content.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanContent);
  } catch (parseError) {
    console.error(
      "Failed to parse AI recommendation:",
      content,
      parseError.message,
    );

    // AI returned garbage — fall back to heuristic file ordering
    const sortedFiles = [...fileMetadata].sort((a, b) => {
      const priority = (f) => {
        if (f.path.includes("package.json")) return 0;
        if (
          f.path.includes("index.") ||
          f.path.includes("main.") ||
          f.path.includes("app.")
        )
          return 1;
        if (f.isChanged) return 2;
        return 3;
      };
      return priority(a) - priority(b);
    });
    return {
      selectedFiles: sortedFiles
        .slice(0, PROVIDER_LIMITS[provider].maxFilesFullScan)
        .map((f) => f.path),
      includeExistingReadme: true,
      truncateReadme: existingReadmeTokens > 1000,
      reasoning: "Fallback selection based on file naming conventions",
    };
  }
}

export async function generateReadme(context) {
  const providers = buildProviderList();

  if (providers.length === 0) {
    throw new Error(
      "No API keys configured. Set GEMINI_API_KEY1-3 or GROQ_API_KEY1-3.",
    );
  }

  let lastError = null;

  for (let i = 0; i < providers.length; i++) {
    const { key, provider, label, keyIndex, keyTotal, modelMain, modelMini } =
      providers[i];

    try {
      console.log(`[README] Trying ${label} key ${keyIndex}/${keyTotal}`);

      console.log(
        `[README] Step 1: Selecting files via ${label} (${modelMini})...`,
      );
      const recommendations = await getFileRecommendations(
        context,
        key,
        provider,
        modelMini,
      );
      console.log(`[README] File selection: ${recommendations.reasoning}`);

      const optimizedContext = buildOptimizedContext(context, recommendations);

      console.log(
        `[README] Step 2: Generating README via ${label} (${modelMain})...`,
      );
      const systemPrompt = buildSystemPrompt();
      const userPrompt = buildUserPrompt(optimizedContext, recommendations);

      const content = await callLLMAPI({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: modelMain,
        maxTokens: PROVIDER_LIMITS[provider].maxOutputTokens,
        temperature: 0.4,
        apiKey: key,
        provider,
        timeout: 60000,
      });

      console.log(
        `[README] ✓ Generated via ${label} key ${keyIndex}/${keyTotal}`,
      );
      return content;
    } catch (error) {
      lastError = error;

      if (error.response) {
        console.error(`[README] ${label} key ${keyIndex} error:`, {
          status: error.response.status,
          message: error.response.data?.error?.message,
        });

        if (isRetriableError(error)) {
          console.log(
            `[README] ${label} key ${keyIndex} failed (${error.response.status}) — trying next...`,
          );
          continue;
        }

        throw new Error(
          `${label} API error: ${error.response.status} - ${error.response.data?.error?.message || "Unknown error"}`,
        );
      } else if (error.request) {
        console.error(
          `[README] ${label} key ${keyIndex} network error:`,
          error.message,
        );
        continue;
      } else {
        console.error("[README] Unexpected error:", error.message);
        throw error;
      }
    }
  }

  console.error("[README] All API keys exhausted (Gemini + Groq)");
  if (lastError?.response) {
    throw new Error(
      `All API keys failed. Last error: ${lastError.response.status} - ${lastError.response.data?.error?.message || "Unknown error"}`,
    );
  } else if (lastError?.request) {
    throw new Error("Network error: Unable to reach any API with any key");
  } else {
    throw new Error("Failed to generate README with all available API keys");
  }
}

// Filters context down to only the files the AI selected in step 1.
// Also handles README truncation to keep prompt size in check.
function buildOptimizedContext(context, recommendations) {
  const { selectedFiles, includeExistingReadme, truncateReadme } =
    recommendations;
  const { fullCodebase, changedFiles, existingReadme, ...rest } = context;

  const selectedSet = new Set(selectedFiles);
  const selectedCodebase = [];
  const selectedChangedFiles = [];

  if (fullCodebase) {
    fullCodebase.forEach((file) => {
      if (selectedSet.has(file.path)) selectedCodebase.push(file);
    });
  }

  // Dedupe — don't include a file twice if it appears in both lists
  const codebasePaths = new Set(selectedCodebase.map((f) => f.path));
  if (changedFiles) {
    changedFiles.forEach((file) => {
      if (selectedSet.has(file.path) && !codebasePaths.has(file.path)) {
        selectedChangedFiles.push(file);
      }
    });
  }

  let processedReadme = null;
  if (includeExistingReadme && existingReadme) {
    if (truncateReadme) {
      const lines = existingReadme.split("\n");
      if (lines.length > 700) {
        // Keep head + tail, drop the verbose middle sections
        processedReadme = [
          ...lines.slice(0, 500),
          "\n... (middle sections omitted for brevity) ...\n",
          ...lines.slice(-200),
        ].join("\n");
      } else {
        processedReadme = existingReadme;
      }
    } else {
      processedReadme = existingReadme;
    }
  }

  return {
    ...rest,
    fullCodebase: selectedCodebase,
    changedFiles: selectedChangedFiles,
    existingReadme: processedReadme,
  };
}

function buildSystemPrompt() {
  return `You are an elite technical documentation architect with deep expertise in creating world-class README files that serve as the definitive guide for software projects.

Your mission is to generate comprehensive, professional-grade README.md files that developers will love.

## ANALYSIS MODE DETERMINATION:

First, assess the situation:
1. **FULL CODEBASE ANALYSIS** (Required when):
   - No README exists
   - Existing README is minimal (< 500 words or missing key sections)
   - README lacks technical depth (no code examples, no architecture info)
   - Major structural changes detected in commits

2. **INCREMENTAL UPDATE** (Appropriate when):
   - Existing README is comprehensive (has all major sections with depth)
   - Changes are localized to specific features
   - README accurately reflects current architecture

## COMPREHENSIVE README STRUCTURE:

Generate READMEs with ALL of the following sections (adapt depth based on project complexity):

### 1. Header & Badges
- Project logo/banner (if applicable)
- Descriptive tagline
- Status badges (build, coverage, version, license)
- Quick links (demo, docs, issues)

### 2. Overview
- Clear 2-3 sentence description of what the project does
- Key value proposition - why use this?
- Target audience
- Current status/version

### 3. Features
- Comprehensive feature list with descriptions
- Highlight unique/standout capabilities
- Group related features logically
- Include feature status (stable, beta, experimental)

### 4. Tech Stack
- Languages and frameworks used
- Key dependencies with purposes
- Database/storage solutions
- External services/APIs

### 5. Architecture (for non-trivial projects)
- High-level system design
- Directory structure explanation
- Key components and their relationships
- Data flow overview

### 6. Getting Started
#### Prerequisites
- Required software with minimum versions
- System requirements
- Account/API key requirements

#### Installation
- Step-by-step installation guide
- Multiple installation methods if applicable (npm, Docker, source)
- Verification steps

#### Configuration
- Environment variables with descriptions
- Configuration file options
- Example .env file content

### 7. Usage
- Basic usage examples with code
- Common use cases
- API reference (if applicable)
- CLI commands (if applicable)
- Screenshots/GIFs for visual projects

### 8. Development
- Setting up development environment
- Running tests
- Code style guidelines
- Debugging tips

### 9. Deployment
- Production deployment steps
- Docker/container instructions
- Cloud platform guides (if relevant)
- Performance considerations

### 10. API Documentation (if applicable)
- Endpoints with request/response examples
- Authentication methods
- Rate limits
- Error codes

### 11. Contributing
- How to contribute
- Development workflow
- Pull request process
- Code review guidelines

### 12. Troubleshooting
- Common issues and solutions
- FAQ section
- Where to get help

### 13. Roadmap (if known)
- Planned features
- Known limitations

### 14. License & Credits
- License type with link
- Contributors
- Acknowledgments
- Third-party attributions

## QUALITY STANDARDS:

1. **Technical Accuracy**: Every code example must be correct and runnable
2. **Completeness**: Don't skip sections - adapt depth to project size
3. **Clarity**: A developer should be able to get started in under 5 minutes
4. **Maintainability**: Write in a way that's easy to update
5. **Professionalism**: Consistent formatting, proper grammar, no typos
6. **Code Examples**: Include real, working examples from the codebase
7. **Copy-Paste Ready**: All commands should work when copy-pasted

## PRESERVATION RULES (when updating):

- NEVER remove existing badges, acknowledgments, or license info
- Preserve custom sections unique to the project
- Maintain the project's voice and tone
- Keep contributor lists intact
- Update version numbers and dates appropriately

Output ONLY the complete README in Markdown format. No explanations, no preamble.`;
}

function analyzeReadmeDepth(existingReadme) {
  if (!existingReadme) {
    return {
      strategy: "full",
      reason: "No README exists",
      needsFullCodebase: true,
    };
  }

  const wordCount = existingReadme.split(/\s+/).length;
  const hasCodeBlocks = (existingReadme.match(/```/g) || []).length >= 2;
  const hasMultipleSections =
    (existingReadme.match(/^#{1,3}\s/gm) || []).length >= 5;
  const hasInstallation = /install|setup|getting started/i.test(existingReadme);
  const hasUsage = /usage|example|how to use/i.test(existingReadme);
  const hasArchitecture = /architecture|structure|design|component/i.test(
    existingReadme,
  );
  const hasAPI = /api|endpoint|route/i.test(existingReadme);

  const depthScore = [
    wordCount > 500,
    hasCodeBlocks,
    hasMultipleSections,
    hasInstallation,
    hasUsage,
    hasArchitecture,
    hasAPI,
  ].filter(Boolean).length;

  if (depthScore >= 5) {
    return {
      strategy: "incremental",
      reason: "README is comprehensive",
      depthScore,
      needsFullCodebase: false,
    };
  } else if (depthScore >= 3) {
    return {
      strategy: "enhance",
      reason: "README exists but needs more depth",
      depthScore,
      needsFullCodebase: true,
    };
  } else {
    return {
      strategy: "full",
      reason: "README is minimal and needs complete rewrite",
      depthScore,
      needsFullCodebase: true,
    };
  }
}

function buildUserPrompt(context, recommendations = {}) {
  const {
    repoName,
    repoOwner,
    repoStructure,
    existingReadme,
    commitDiff,
    changedFiles,
    fullCodebase,
  } = context;
  const analysis = analyzeReadmeDepth(existingReadme);

  let prompt = "";

  if (recommendations.reasoning) {
    prompt += `## FILE SELECTION\n`;
    prompt += `*AI analyzed ${recommendations.selectedFiles?.length || 0} key files: ${recommendations.reasoning}*\n\n`;
  }

  prompt += `## ANALYSIS RESULT\n`;
  prompt += `**Strategy**: ${analysis.strategy.toUpperCase()}\n`;
  prompt += `**Reason**: ${analysis.reason}\n`;
  if (analysis.depthScore !== undefined) {
    prompt += `**Depth Score**: ${analysis.depthScore}/7\n`;
  }
  prompt += `\n---\n\n`;

  if (analysis.strategy === "full") {
    prompt += `## TASK: FULL README GENERATION\n\nCreate a comprehensive README.md using the key files selected below.\n\n**Repository**: ${repoOwner}/${repoName}\n\n`;
  } else if (analysis.strategy === "enhance") {
    prompt += `## TASK: README ENHANCEMENT\n\nEnhance the existing README using the selected codebase context.\n\n**Repository**: ${repoOwner}/${repoName}\n\n`;
  } else {
    prompt += `## TASK: INCREMENTAL UPDATE\n\nUpdate only sections affected by recent commits.\n\n**Repository**: ${repoOwner}/${repoName}\n\n`;
  }

  if (repoStructure) {
    prompt += `## REPOSITORY STRUCTURE\n\`\`\`\n${repoStructure}\n\`\`\`\n\n`;
  }

  if (fullCodebase && fullCodebase.length > 0) {
    prompt += `## KEY SOURCE FILES\n\n`;
    fullCodebase.forEach((file) => {
      const lang = getLanguageFromExtension(file.path);
      prompt += `### \`${file.path}\`\n\`\`\`${lang}\n${file.content}\n\`\`\`\n\n`;
    });
  }

  if (changedFiles && changedFiles.length > 0) {
    prompt += `## CHANGED FILES\n\n`;
    changedFiles.forEach((file) => {
      const lang = file.language || getLanguageFromExtension(file.path);
      prompt += `### \`${file.path}\`\n\`\`\`${lang}\n${file.content}\n\`\`\`\n\n`;
    });
  }

  if (analysis.strategy === "incremental" && commitDiff) {
    prompt += `## COMMIT DIFF\n\`\`\`diff\n${commitDiff}\n\`\`\`\n\n`;
  }

  if (existingReadme) {
    prompt += `## EXISTING README\n\`\`\`markdown\n${existingReadme}\n\`\`\`\n\n`;
  }

  prompt += `---\n\n## INSTRUCTIONS\n\nGenerate a complete, professional README.md. Include: Overview, Features, Tech Stack, Installation, Usage, API (if applicable), Contributing, License. Output ONLY the README markdown.`;

  return prompt;
}

export function estimateTokenCount(context) {
  const text = JSON.stringify(context);
  return Math.ceil(text.length / 4);
}

// Threshold is 500 chars — anything shorter can't be meaningfully section-parsed
export function determineGenerationMode(existingReadme) {
  if (!existingReadme || existingReadme.trim().length < 500) {
    return {
      mode: "full",
      reason: existingReadme
        ? "README is too short for patch mode (< 500 chars)"
        : "No README exists",
    };
  }
  return {
    mode: "patch",
    reason: "README is substantial enough for surgical patching",
  };
}

// Patch step 1 — lightweight model identifies which sections need updating.
// Only sends file paths + statuses, not content, to keep this call cheap.
async function mapSectionImpact(
  { repoName, repoOwner, commitDiff, changedFiles, sectionNames },
  apiKey,
  provider,
  modelMini,
) {
  const prompt = buildImpactMappingPrompt({
    repoName,
    repoOwner,
    commitDiff,
    changedFiles,
    sectionNames,
  });

  const content = await callLLMAPI({
    messages: [{ role: "user", content: prompt }],
    model: modelMini,
    maxTokens: 400,
    temperature: 0.1,
    apiKey,
    provider,
    timeout: 30000,
  });

  if (!content) throw new Error("Invalid response from impact mapping");

  try {
    const clean = content.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(clean);
    return {
      affectedSections: Array.isArray(parsed.affectedSections)
        ? parsed.affectedSections
        : [],
      reasoning: parsed.reasoning || "",
    };
  } catch {
    // Parsing failed — safest fallback is to treat all non-protected sections as affected
    const nonForbidden = sectionNames.filter(
      (n) => !FORBIDDEN_SECTIONS.includes(n),
    );
    return {
      affectedSections: nonForbidden,
      reasoning: "Fallback: failed to parse impact-mapping response",
    };
  }
}

// Patch step 2 — main model rewrites only the affected sections.
// Returns a JSON map of { sectionName: newMarkdown }.
async function generateSectionPatches(
  {
    repoName,
    repoOwner,
    repoStructure,
    commitDiff,
    changedFiles,
    editableSections,
    uneditableSectionNames,
    strictMode,
  },
  apiKey,
  provider,
  modelMain,
) {
  const systemPrompt = buildPatchSystemPrompt(
    uneditableSectionNames,
    strictMode,
  );
  const userPrompt = buildPatchUserPrompt({
    repoName,
    repoOwner,
    repoStructure,
    commitDiff,
    changedFiles,
    editableSections,
  });

  const content = await callLLMAPI({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model: modelMain,
    maxTokens: PROVIDER_LIMITS[provider].maxOutputTokens,
    temperature: 0.3,
    apiKey,
    provider,
    timeout: 90000,
  });

  if (!content) throw new Error("Invalid response from patch generation");

  const clean = content.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(clean); // parse error intentionally propagates — caller handles it
}

// Returns null instead of throwing so the worker can cleanly skip the commit.
export async function generateReadmePatch({
  repoName,
  repoOwner,
  repoStructure,
  commitDiff,
  changedFiles,
  originalSections,
  orderedKeys,
  originalHashes,
}) {
  const providers = buildProviderList();

  if (providers.length === 0) {
    console.error(
      "[Patch] No API keys configured (GEMINI_API_KEY or GROQ_API_KEY)",
    );
    return null;
  }

  // Strip file content for step 1 — the mini model only needs paths and statuses
  const changedFilesMeta = changedFiles.map((f) => ({
    path: f.path,
    status: f.status || "modified",
  }));

  for (let i = 0; i < providers.length; i++) {
    const { key, provider, label, keyIndex, keyTotal, modelMain, modelMini } =
      providers[i];
    try {
      console.log(`[Patch] Trying ${label} key ${keyIndex}/${keyTotal}`);

      const { affectedSections, reasoning } = await mapSectionImpact(
        {
          repoName,
          repoOwner,
          commitDiff,
          changedFiles: changedFilesMeta,
          sectionNames: orderedKeys,
        },
        key,
        provider,
        modelMini,
      );
      console.log(`[Patch] Impact mapping: ${reasoning}`);
      console.log(`[Patch] Affected sections: ${affectedSections.join(", ")}`);

      const editableKeys = affectedSections
        .filter(
          (k) =>
            !FORBIDDEN_SECTIONS.includes(k) &&
            originalSections[k] !== undefined,
        )
        .slice(0, PROVIDER_LIMITS[provider].maxPatchSections);

      if (editableKeys.length === 0) {
        console.log("[Patch] No editable sections affected — skipping commit");
        return null;
      }

      const editableSections = {};
      for (const k of editableKeys) editableSections[k] = originalSections[k];
      const uneditableSectionNames = orderedKeys.filter(
        (k) => !editableKeys.includes(k),
      );

      let patches = await generateSectionPatches(
        {
          repoName,
          repoOwner,
          repoStructure,
          commitDiff,
          changedFiles,
          editableSections,
          uneditableSectionNames,
          strictMode: false,
        },
        key,
        provider,
        modelMain,
      );

      let validation = validatePatches({
        originalSections,
        originalHashes,
        patches,
        affectedKeys: editableKeys,
      });

      if (validation.decision === "retry") {
        console.log(
          `[Patch] Validation failed (${validation.reason}), retrying with strictMode`,
        );
        patches = await generateSectionPatches(
          {
            repoName,
            repoOwner,
            repoStructure,
            commitDiff,
            changedFiles,
            editableSections,
            uneditableSectionNames,
            strictMode: true,
          },
          key,
          provider,
          modelMain,
        );
        validation = validatePatches({
          originalSections,
          originalHashes,
          patches,
          affectedKeys: editableKeys,
        });
      }

      if (validation.decision !== "commit") {
        console.log(
          `[Patch] Validation failed after strictMode retry (${validation.reason}) — returning null`,
        );
        return null;
      }

      const finalReadme = mergePatchedSections(
        originalSections,
        orderedKeys,
        patches,
      );
      const mergedSections = { ...originalSections, ...patches };
      const newHashes = hashSections(mergedSections);

      console.log(
        `[Patch] ✓ Patched [${editableKeys.join(", ")}] via ${label} key ${keyIndex}/${keyTotal}`,
      );
      return { finalReadme, newHashes };
    } catch (error) {
      if (error.response) {
        console.error(`[Patch] ${label} key ${keyIndex} error:`, {
          status: error.response.status,
          message: error.response.data?.error?.message,
        });
        if (isRetriableError(error)) {
          console.log(
            `[Patch] ${label} key ${keyIndex} failed (${error.response.status}) — trying next...`,
          );
          continue;
        }
      } else if (error.request) {
        console.error(
          `[Patch] ${label} key ${keyIndex} network error:`,
          error.message,
        );
        continue;
      }
      console.error(`[Patch] Non-retriable error:`, error.message);
      return null;
    }
  }

  console.error("[Patch] All API keys exhausted (Gemini + Groq fallback)");
  return null;
}
