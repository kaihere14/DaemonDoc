import axios from "axios";
import { getLanguageFromExtension } from "../utils/langMap.js";
import { parseReadmeSections, hashSections, mergePatchedSections } from "../utils/readme.parser.js";
import { validatePatches, FORBIDDEN_SECTIONS } from "../utils/readme.validator.js";
import {
  buildImpactMappingPrompt,
  buildPatchSystemPrompt,
  buildPatchUserPrompt,
} from "../utils/prompt.builder.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_MODEL_MINI = "llama-3.3-70b-versatile"; // Lightweight model for file selection
const MAX_INPUT_TOKENS = 6000; // Keep buffer for safety

/**
 * Estimate token count for a string (rough approximation)
 * @param {string} text - Text to estimate
 * @returns {number} Estimated token count
 */
function estimateTokens(text) {
  if (!text) return 0;
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * First API call: Ask AI which files are most important for README generation
 * @param {Object} context - Repository context with file metadata
 * @param {string} apiKey - API key to use
 * @returns {Promise<Object>} AI's recommendation on which files to include
 */
async function getFileRecommendations(context, apiKey) {
  const {
    repoName,
    repoOwner,
    repoStructure,
    fullCodebase,
    changedFiles,
    existingReadme,
  } = context;

  // Build file metadata (names, paths, sizes - NOT content)
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
- Maximum allowed input tokens: ${MAX_INPUT_TOKENS}
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

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: GROQ_MODEL_MINI,
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 30000,
    },
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Invalid response from file analysis");
  }

  // Parse JSON response
  try {
    // Clean up response - remove markdown code blocks if present
    const cleanContent = content.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanContent);
  } catch (parseError) {
    console.error(
      "Failed to parse AI recommendation:",
      content,
      parseError.message,
    );
    // Fallback: include most important files by convention
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
      selectedFiles: sortedFiles.slice(0, 5).map((f) => f.path),
      includeExistingReadme: true,
      truncateReadme: existingReadmeTokens > 1000,
      reasoning: "Fallback selection based on file naming conventions",
    };
  }
}

/**
 * Generate README content using Groq API with two-step approach
 * @param {Object} context - Context object containing repository information
 * @returns {Promise<string>} Generated README content
 */
export async function generateReadme(context) {
  // Fallback API keys
  const apiKeys = [
    process.env.GROQ_API_KEY1,
    process.env.GROQ_API_KEY2,
    process.env.GROQ_API_KEY3,
  ].filter(Boolean);

  if (apiKeys.length === 0) {
    throw new Error("No GROQ API keys configured");
  }

  let lastError = null;

  // Try each API key in sequence
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];

    try {
      console.log(`Attempting request with API key ${i + 1}/${apiKeys.length}`);

      // STEP 1: Get AI recommendations on which files to include
      console.log(
        "Step 1: Analyzing files to determine optimal content selection...",
      );
      const recommendations = await getFileRecommendations(context, apiKey);
      console.log("AI Recommendations:", recommendations.reasoning);

      // STEP 2: Build optimized context based on recommendations
      const optimizedContext = buildOptimizedContext(context, recommendations);

      // STEP 3: Generate README with optimized context
      console.log("Step 2: Generating README with selected files...");
      const systemPrompt = buildSystemPrompt();
      const userPrompt = buildUserPrompt(optimizedContext, recommendations);

      const response = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.4,
          max_tokens: 4000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 60000,
        },
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error("Invalid response from Groq API");
      }

      console.log(`Successfully generated README with API key ${i + 1}`);
      return response.data.choices[0].message.content;
    } catch (error) {
      lastError = error;

      if (error.response) {
        console.error(`Groq API Error with key ${i + 1}:`, {
          status: error.response.status,
          data: error.response.data,
        });

        // Rate limit, auth error, or request too large - try next key
        if ([429, 401, 413].includes(error.response.status)) {
          console.log(
            `Key ${i + 1} failed (${error.response.status}), trying next key...`,
          );
          continue;
        }

        throw new Error(
          `Groq API error: ${error.response.status} - ${
            error.response.data?.error?.message || "Unknown error"
          }`,
        );
      } else if (error.request) {
        console.error(`Network error with key ${i + 1}:`, error.message);
        console.log("Trying next key...");
        continue;
      } else {
        console.error("Error generating README:", error.message);
        throw error;
      }
    }
  }

  // All keys failed
  console.error("All API keys exhausted");
  if (lastError?.response) {
    throw new Error(
      `All API keys failed. Last error: ${lastError.response.status} - ${
        lastError.response.data?.error?.message || "Unknown error"
      }`,
    );
  } else if (lastError?.request) {
    throw new Error("Network error: Unable to reach Groq API with any key");
  } else {
    throw new Error("Failed to generate README with all available API keys");
  }
}

/**
 * Build optimized context based on AI recommendations
 * @param {Object} context - Original context
 * @param {Object} recommendations - AI recommendations
 * @returns {Object} Optimized context
 */
function buildOptimizedContext(context, recommendations) {
  const { selectedFiles, includeExistingReadme, truncateReadme } =
    recommendations;
  const { fullCodebase, changedFiles, existingReadme, ...rest } = context;

  // Filter files based on AI selection — use Set for O(1) lookups
  const selectedSet = new Set(selectedFiles);
  const selectedCodebase = [];
  const selectedChangedFiles = [];

  if (fullCodebase) {
    fullCodebase.forEach((file) => {
      if (selectedSet.has(file.path)) {
        selectedCodebase.push(file);
      }
    });
  }

  // Build a set of paths already in selectedCodebase for dedup check
  const codebasePaths = new Set(selectedCodebase.map((f) => f.path));

  if (changedFiles) {
    changedFiles.forEach((file) => {
      if (selectedSet.has(file.path) && !codebasePaths.has(file.path)) {
        selectedChangedFiles.push(file);
      }
    });
  }

  // Handle existing README
  let processedReadme = null;
  if (includeExistingReadme && existingReadme) {
    if (truncateReadme) {
      // Keep first 500 and last 200 lines for context
      const lines = existingReadme.split("\n");
      if (lines.length > 700) {
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

/**
 * Build system prompt for Groq API
 * @returns {string} System prompt
 */
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

/**
 * Analyze README depth and determine update strategy
 * @param {string} existingReadme - Existing README content
 * @returns {Object} Analysis result with strategy ('full', 'enhance', 'incremental')
 */
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

/**
 * Build user prompt with repository context (optimized version)
 * @param {Object} context - Repository context (already optimized)
 * @param {Object} recommendations - AI recommendations from first step
 * @returns {string} User prompt
 */
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

  // Analyze existing README depth
  const analysis = analyzeReadmeDepth(existingReadme);

  let prompt = "";

  // Add AI selection context
  if (recommendations.reasoning) {
    prompt += `## FILE SELECTION\n`;
    prompt += `*AI analyzed ${
      recommendations.selectedFiles?.length || 0
    } key files: ${recommendations.reasoning}*\n\n`;
  }

  // Add analysis context for the AI
  prompt += `## ANALYSIS RESULT\n`;
  prompt += `**Strategy**: ${analysis.strategy.toUpperCase()}\n`;
  prompt += `**Reason**: ${analysis.reason}\n`;
  if (analysis.depthScore !== undefined) {
    prompt += `**Depth Score**: ${analysis.depthScore}/7\n`;
  }
  prompt += `\n---\n\n`;

  // Determine task based on strategy
  if (analysis.strategy === "full") {
    prompt += `## TASK: FULL README GENERATION\n\n`;
    prompt += `Create a comprehensive README.md using the key files selected below.\n\n`;
    prompt += `**Repository**: ${repoOwner}/${repoName}\n\n`;
  } else if (analysis.strategy === "enhance") {
    prompt += `## TASK: README ENHANCEMENT\n\n`;
    prompt += `Enhance the existing README using the selected codebase context.\n\n`;
    prompt += `**Repository**: ${repoOwner}/${repoName}\n\n`;
  } else {
    prompt += `## TASK: INCREMENTAL UPDATE\n\n`;
    prompt += `Update only sections affected by recent commits.\n\n`;
    prompt += `**Repository**: ${repoOwner}/${repoName}\n\n`;
  }

  // Repository structure (always include)
  if (repoStructure) {
    prompt += `## REPOSITORY STRUCTURE\n\`\`\`\n${repoStructure}\n\`\`\`\n\n`;
  }

  // Include selected codebase files
  if (fullCodebase && fullCodebase.length > 0) {
    prompt += `## KEY SOURCE FILES\n\n`;
    fullCodebase.forEach((file) => {
      const lang = getLanguageFromExtension(file.path);
      prompt += `### \`${file.path}\`\n`;
      prompt += `\`\`\`${lang}\n${file.content}\n\`\`\`\n\n`;
    });
  }

  // Include changed files
  if (changedFiles && changedFiles.length > 0) {
    prompt += `## CHANGED FILES\n\n`;
    changedFiles.forEach((file) => {
      const lang = file.language || getLanguageFromExtension(file.path);
      prompt += `### \`${file.path}\`\n`;
      prompt += `\`\`\`${lang}\n${file.content}\n\`\`\`\n\n`;
    });
  }

  // Commit diff for incremental updates
  if (analysis.strategy === "incremental" && commitDiff) {
    prompt += `## COMMIT DIFF\n`;
    prompt += `\`\`\`diff\n${commitDiff}\n\`\`\`\n\n`;
  }

  // Existing README
  if (existingReadme) {
    prompt += `## EXISTING README\n`;
    prompt += `\`\`\`markdown\n${existingReadme}\n\`\`\`\n\n`;
  }

  // Concise instructions
  prompt += `---\n\n## INSTRUCTIONS\n\n`;
  prompt += `Generate a complete, professional README.md. Include: Overview, Features, Tech Stack, Installation, Usage, API (if applicable), Contributing, License. Output ONLY the README markdown.`;

  return prompt;
}

/**
 * Estimate token count for context (rough approximation)
 * @param {Object} context - Context object
 * @returns {number} Estimated token count
 */
export function estimateTokenCount(context) {
  const text = JSON.stringify(context);
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

// ─── Patch-mode functions ─────────────────────────────────────────────────────

/**
 * Determine whether to run full generation or surgical patch mode.
 * "full" is used only when no README exists or it is too short to section-parse.
 * @param {string|null} existingReadme
 * @returns {{ mode: "full"|"patch", reason: string }}
 */
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

/**
 * Step 1 of patch mode — ask LLaMA 70B which README sections are affected.
 * Only file metadata (paths + statuses) is sent, not file contents.
 * @param {Object} params
 * @param {string}   params.repoName
 * @param {string}   params.repoOwner
 * @param {string}   params.commitDiff
 * @param {Array}    params.changedFiles  - Objects with { path, status }
 * @param {string[]} params.sectionNames  - All section keys from the existing README
 * @param {string} apiKey
 * @returns {Promise<{ affectedSections: string[], reasoning: string }>}
 */
async function mapSectionImpact(
  { repoName, repoOwner, commitDiff, changedFiles, sectionNames },
  apiKey,
) {
  const prompt = buildImpactMappingPrompt({
    repoName,
    repoOwner,
    commitDiff,
    changedFiles,
    sectionNames,
  });

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: GROQ_MODEL_MINI,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 400,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 30000,
    },
  );

  const content = response.data?.choices?.[0]?.message?.content;
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
    // Fallback: treat all non-forbidden sections as affected
    const nonForbidden = sectionNames.filter(
      (n) => !FORBIDDEN_SECTIONS.includes(n),
    );
    return {
      affectedSections: nonForbidden,
      reasoning: "Fallback: failed to parse impact-mapping response",
    };
  }
}

/**
 * Step 2 of patch mode — ask GPT-OSS to patch specific sections.
 * @param {Object} params
 * @param {string}   params.repoName
 * @param {string}   params.repoOwner
 * @param {string}   params.repoStructure
 * @param {string}   params.commitDiff
 * @param {Array}    params.changedFiles        - Objects with { path, content, language }
 * @param {Object}   params.editableSections    - { [name]: currentMarkdown }
 * @param {string[]} params.uneditableSectionNames
 * @param {boolean}  params.strictMode
 * @param {string} apiKey
 * @returns {Promise<Object.<string, string>>} Section patches
 */
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
) {
  const systemPrompt = buildPatchSystemPrompt(uneditableSectionNames, strictMode);
  const userPrompt = buildPatchUserPrompt({
    repoName,
    repoOwner,
    repoStructure,
    commitDiff,
    changedFiles,
    editableSections,
  });

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 60000,
    },
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Invalid response from patch generation");

  const clean = content.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(clean); // let parse error propagate — caller handles it
}

/**
 * Main entry point for patch mode. Orchestrates impact mapping → patch generation
 * → validation (with one strictMode retry) → merge → hash.
 *
 * Returns null if validation fails after retry or all API keys are exhausted.
 * Never throws — the worker should skip the commit on null.
 *
 * @param {Object} params
 * @param {string}   params.repoName
 * @param {string}   params.repoOwner
 * @param {string}   params.repoStructure
 * @param {string}   params.commitDiff
 * @param {Array}    params.changedFiles     - Full content objects from fetchChangedFiles
 * @param {Object}   params.originalSections - Parsed sections of the existing README
 * @param {string[]} params.orderedKeys      - Section order
 * @param {Object}   params.originalHashes  - SHA-256 hashes of original sections
 * @returns {Promise<{ finalReadme: string, newHashes: Object }|null>}
 */
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
  const apiKeys = [
    process.env.GROQ_API_KEY1,
    process.env.GROQ_API_KEY2,
    process.env.GROQ_API_KEY3,
  ].filter(Boolean);

  if (apiKeys.length === 0) {
    console.error("[Patch] No API keys configured");
    return null;
  }

  // Metadata-only list for impact mapping
  const changedFilesMeta = changedFiles.map((f) => ({
    path: f.path,
    status: f.status || "modified",
  }));

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    try {
      console.log(`[Patch] Attempting with API key ${i + 1}/${apiKeys.length}`);

      // Step 1: Identify affected sections (LLaMA 70B)
      const { affectedSections, reasoning } = await mapSectionImpact(
        {
          repoName,
          repoOwner,
          commitDiff,
          changedFiles: changedFilesMeta,
          sectionNames: orderedKeys,
        },
        apiKey,
      );
      console.log(`[Patch] Impact mapping: ${reasoning}`);
      console.log(`[Patch] Affected sections: ${affectedSections.join(", ")}`);

      // Filter to editable keys only
      const editableKeys = affectedSections.filter(
        (k) => !FORBIDDEN_SECTIONS.includes(k) && originalSections[k] !== undefined,
      );

      if (editableKeys.length === 0) {
        console.log("[Patch] No editable sections affected — skipping commit");
        return null;
      }

      const editableSections = {};
      for (const k of editableKeys) {
        editableSections[k] = originalSections[k];
      }
      const uneditableSectionNames = orderedKeys.filter(
        (k) => !editableKeys.includes(k),
      );

      // Step 2: Generate patches (GPT-OSS)
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
        apiKey,
      );

      // Validate
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
          apiKey,
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

      // Merge and hash
      const finalReadme = mergePatchedSections(originalSections, orderedKeys, patches);
      const mergedSections = { ...originalSections, ...patches };
      const newHashes = hashSections(mergedSections);

      console.log(
        `[Patch] Successfully generated patch for sections: ${editableKeys.join(", ")}`,
      );
      return { finalReadme, newHashes };
    } catch (error) {
      if (error.response) {
        console.error(`[Patch] API error with key ${i + 1}:`, {
          status: error.response.status,
          message: error.response.data?.error?.message,
        });
        if ([429, 401, 413].includes(error.response.status)) {
          console.log(`[Patch] Key ${i + 1} failed (${error.response.status}), trying next...`);
          continue;
        }
      } else if (error.request) {
        console.error(`[Patch] Network error with key ${i + 1}:`, error.message);
        continue;
      }
      // Non-retriable error
      console.error(`[Patch] Non-retriable error:`, error.message);
      return null;
    }
  }

  console.error("[Patch] All API keys exhausted");
  return null;
}
