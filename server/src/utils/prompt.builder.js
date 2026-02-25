/**
 * Build context object for README generation
 * @param {Object} params - Parameters for building context
 * @param {string} params.repoName - Repository name
 * @param {string} params.repoOwner - Repository owner
 * @param {string} params.repoStructure - Formatted repository structure
 * @param {string} params.existingReadme - Existing README content (if any)
 * @param {Object} params.commitData - Commit data with files and changes
 * @param {Array} params.changedFilesContent - Array of changed files with content
 * @param {Array} params.fullCodebase - Array of all important source files for full analysis
 * @returns {Object} Context object for Grok API
 */
export function buildReadmeContext({
  repoName,
  repoOwner,
  repoStructure,
  existingReadme,
  commitData,
  changedFilesContent,
  fullCodebase,
}) {
  const context = {
    repoName,
    repoOwner,
    repoStructure,
    existingReadme: existingReadme || null,
    commitDiff: null,
    changedFiles: changedFilesContent || [],
    fullCodebase: fullCodebase || [],
  };

  // Build commit diff summary
  if (commitData) {
    context.commitDiff = formatCommitDiff(commitData);
  }

  return context;
}

/**
 * Format commit data into a readable diff summary
 * @param {Object} commitData - Commit data from GitHub
 * @returns {string} Formatted commit diff
 */
function formatCommitDiff(commitData) {
  let diff = "";

  if (commitData.message) {
    diff += `Commit Message: ${commitData.message}\n\n`;
  }

  if (commitData.files && commitData.files.length > 0) {
    diff += `Files Changed: ${commitData.files.length}\n\n`;

    // Group files by status
    const added = commitData.files.filter((f) => f.status === "added");
    const modified = commitData.files.filter((f) => f.status === "modified");
    const removed = commitData.files.filter((f) => f.status === "removed");
    const renamed = commitData.files.filter((f) => f.status === "renamed");

    if (added.length > 0) {
      diff += `Added (${added.length}):\n`;
      added.forEach((f) => {
        diff += `  + ${f.filename} (+${f.additions} lines)\n`;
      });
      diff += "\n";
    }

    if (modified.length > 0) {
      diff += `Modified (${modified.length}):\n`;
      modified.forEach((f) => {
        diff += `  ~ ${f.filename} (+${f.additions}/-${f.deletions} lines)\n`;
      });
      diff += "\n";
    }

    if (removed.length > 0) {
      diff += `Removed (${removed.length}):\n`;
      removed.forEach((f) => {
        diff += `  - ${f.filename}\n`;
      });
      diff += "\n";
    }

    if (renamed.length > 0) {
      diff += `Renamed (${renamed.length}):\n`;
      renamed.forEach((f) => {
        diff += `  → ${f.previous_filename} → ${f.filename}\n`;
      });
      diff += "\n";
    }

    // Add stats
    if (commitData.stats) {
      diff += `Total Changes: +${commitData.stats.additions} -${commitData.stats.deletions}\n`;
    }
  }

  return diff.trim();
}

/**
 * Optimize context to fit within token limits
 * @param {Object} context - Context object
 * @param {number} maxTokens - Maximum tokens allowed (default: 8000)
 * @returns {Object} Optimized context
 */
export function optimizeContext(context, maxTokens = 8000) {
  // Rough estimation: 4 characters per token
  const maxChars = maxTokens * 4;

  if (estimateContextSize(context) <= maxChars) {
    return context;
  }

  const optimized = { ...context };
  const fits = () => estimateContextSize(optimized) <= maxChars;

  // Priority order: fullCodebase → changedFiles → repoStructure → existingReadme → commitDiff

  // Step 1: Truncate full codebase
  if (optimized.fullCodebase && optimized.fullCodebase.length > 0) {
    optimized.fullCodebase = optimized.fullCodebase.map((file) => ({
      ...file,
      content: truncateText(file.content, 80),
    }));
    if (fits()) return optimized;

    if (optimized.fullCodebase.length > 15) {
      optimized.fullCodebase = optimized.fullCodebase.slice(0, 15);
      if (fits()) return optimized;
    }

    optimized.fullCodebase = optimized.fullCodebase.map((file) => ({
      ...file,
      content: truncateText(file.content, 50),
    }));
    if (fits()) return optimized;
  }

  // Step 2: Truncate changed files
  if (optimized.changedFiles && optimized.changedFiles.length > 0) {
    optimized.changedFiles = optimized.changedFiles.map((file) => ({
      ...file,
      content: truncateText(file.content, 50),
    }));
    if (fits()) return optimized;
  }

  // Step 3: Truncate repo structure
  if (optimized.repoStructure) {
    optimized.repoStructure = truncateText(optimized.repoStructure, 100);
    if (fits()) return optimized;
  }

  // Step 4: Truncate existing README
  if (optimized.existingReadme) {
    optimized.existingReadme = truncateText(optimized.existingReadme, 100);
    if (fits()) return optimized;
  }

  // Step 5: Truncate commit diff
  if (optimized.commitDiff) {
    optimized.commitDiff = truncateText(optimized.commitDiff, 50);
  }

  return optimized;
}

/**
 * Estimate context size in characters
 * @param {Object} context - Context object
 * @returns {number} Estimated size in characters
 */
function estimateContextSize(context) {
  return JSON.stringify(context).length;
}

/**
 * Truncate text to specified number of lines
 * @param {string} text - Text to truncate
 * @param {number} maxLines - Maximum number of lines
 * @returns {string} Truncated text
 */
function truncateText(text, maxLines) {
  if (!text) return text;

  const lines = text.split("\n");

  if (lines.length <= maxLines) {
    return text;
  }

  return (
    lines.slice(0, maxLines).join("\n") +
    `\n\n... (truncated ${lines.length - maxLines} lines)`
  );
}

/**
 * Validate context object
 * @param {Object} context - Context object to validate
 * @returns {Object} Validation result
 */
export function validateContext(context) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!context.repoName) {
    errors.push("repoName is required");
  }

  if (!context.repoOwner) {
    errors.push("repoOwner is required");
  }

  // Optional but recommended fields
  if (!context.repoStructure) {
    warnings.push("repoStructure is missing - README may lack context");
  }

  // Check if we have enough context
  const hasFullCodebase =
    context.fullCodebase && context.fullCodebase.length > 0;
  const hasChangedFiles =
    context.changedFiles && context.changedFiles.length > 0;
  const hasCommitDiff = context.commitDiff;

  if (!hasFullCodebase && !hasChangedFiles && !hasCommitDiff) {
    warnings.push(
      "No codebase context, commit diff, or changed files - README may lack detail",
    );
  }

  if (hasFullCodebase) {
    console.log(
      `[Validate] Full codebase mode: ${context.fullCodebase.length} files`,
    );
  }

  // Check context size
  const size = estimateContextSize(context);
  const estimatedTokens = Math.ceil(size / 4);

  if (estimatedTokens > 10000) {
    warnings.push(
      `Context is large (${estimatedTokens} tokens) - will be optimized`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    estimatedTokens,
    hasFullCodebase,
  };
}

/**
 * Create a minimal context for testing
 * @param {string} repoName - Repository name
 * @param {string} repoOwner - Repository owner
 * @returns {Object} Minimal context
 */
export function createMinimalContext(repoName, repoOwner) {
  return {
    repoName,
    repoOwner,
    repoStructure: "Repository structure not available",
    existingReadme: null,
    commitDiff: null,
    changedFiles: [],
  };
}

// ─── Patch-mode prompt builders ──────────────────────────────────────────────

/**
 * Build the user prompt for LLaMA 70B impact-mapping (Step 1 of patch mode).
 * Passes only file metadata and section names — no file content.
 * @param {Object} params
 * @param {string} params.repoName
 * @param {string} params.repoOwner
 * @param {string} params.commitDiff      - Formatted commit summary
 * @param {Array}  params.changedFiles    - Objects with { path, status }
 * @param {string[]} params.sectionNames  - All section keys from the existing README
 * @returns {string}
 */
export function buildImpactMappingPrompt({
  repoName,
  repoOwner,
  commitDiff,
  changedFiles,
  sectionNames,
}) {
  const fileList = changedFiles
    .map((f) => `  - ${f.path} (${f.status})`)
    .join("\n");

  const sectionList = sectionNames
    .filter((n) => n !== "__preamble__")
    .map((n) => `  - ${n}`)
    .join("\n");

  return `You are analyzing a GitHub commit to determine which README sections need updating.

## Repository: ${repoOwner}/${repoName}

## Commit Changes:
${commitDiff || "No diff available"}

## Changed Files (paths and status only):
${fileList || "  (none)"}

## Current README Sections:
${sectionList}

Based on the commit changes above, identify which README sections are genuinely affected and need to be updated. Only include sections that are directly relevant to the code changes.

Respond with ONLY a JSON object (no markdown fences, no explanation):
{
  "affectedSections": ["Section Name 1", "Section Name 2"],
  "reasoning": "brief explanation of why these sections are affected"
}`;
}

/**
 * Build the system prompt for GPT-OSS patch generation (Step 2 of patch mode).
 * @param {string[]} uneditableSectionNames - Section keys that must not be modified
 * @param {boolean}  strictMode             - If true, adds minimum-change instruction
 * @returns {string}
 */
export function buildPatchSystemPrompt(uneditableSectionNames, strictMode = false) {
  const uneditableList =
    uneditableSectionNames.length > 0
      ? uneditableSectionNames.join(", ")
      : "(none)";

  let rules = `You are a README patch generator. Your task is to update specific sections of a README based on recent code changes.

## RULES:
1. Only include the sections you are explicitly asked to patch — do not add or remove sections
2. Never modify these uneditable sections (do not include them in your output): ${uneditableList}
3. Do not speculate about features not present in the provided code
4. Output ONLY valid JSON — no markdown fences, no explanation outside the JSON object
5. Each value must start with the section's full heading line (e.g., "## Installation\\n\\ncontent...")`;

  if (strictMode) {
    rules +=
      "\n6. If uncertain about any change, copy the existing section content verbatim — make minimum changes only";
  }

  return rules;
}

/**
 * Build the user prompt for GPT-OSS patch generation (Step 2 of patch mode).
 * Includes repo structure, commit diff, changed file contents, and editable section text.
 * @param {Object} params
 * @param {string} params.repoName
 * @param {string} params.repoOwner
 * @param {string} params.repoStructure
 * @param {string} params.commitDiff
 * @param {Array}  params.changedFiles      - Objects with { path, content, language }
 * @param {Object.<string,string>} params.editableSections - Section name → current markdown
 * @returns {string}
 */
export function buildPatchUserPrompt({
  repoName,
  repoOwner,
  repoStructure,
  commitDiff,
  changedFiles,
  editableSections,
}) {
  let prompt = `## Repository: ${repoOwner}/${repoName}\n\n`;

  if (repoStructure) {
    prompt += `## Repository Structure\n\`\`\`\n${repoStructure}\n\`\`\`\n\n`;
  }

  if (commitDiff) {
    prompt += `## Recent Commit Changes\n\`\`\`\n${commitDiff}\n\`\`\`\n\n`;
  }

  if (changedFiles && changedFiles.length > 0) {
    prompt += `## Changed File Contents\n\n`;
    for (const file of changedFiles) {
      const lang = file.language || "";
      prompt += `### \`${file.path}\`\n\`\`\`${lang}\n${file.content}\n\`\`\`\n\n`;
    }
  }

  prompt += `## Sections to Update\n\nUpdate ONLY the following sections. Your JSON output must contain exactly these keys:\n\n`;
  for (const [name, content] of Object.entries(editableSections)) {
    prompt += `**${name}**\nCurrent content:\n\`\`\`markdown\n${content}\n\`\`\`\n\n`;
  }

  prompt += `---\n\nOutput JSON where each key is a section name and each value is the complete updated markdown for that section (starting with its heading line):\n{"SectionName": "## SectionName\\n\\nupdated content..."}`;

  return prompt;
}
