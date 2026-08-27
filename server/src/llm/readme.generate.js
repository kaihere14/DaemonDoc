import { liveUpdate } from "../services/convex.service.js";
import { buildFUllReadmePrompt } from "./prompts/full.generate.prompt.js";

// Exported so the patch pipeline renders commit diffs identically to full mode.
export function formatCommitDiff(commitData) {
  let diff = "";

  if (commitData.message) {
    diff += `Commit Message: ${commitData.message}\n\n`;
  }

  if (commitData.files && commitData.files.length > 0) {
    diff += `Files Changed: ${commitData.files.length}\n\n`;

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

    if (commitData.stats) {
      diff += `Total Changes: +${commitData.stats.additions} -${commitData.stats.deletions}\n`;
    }
  }

  return diff.trim();
}

function estimateContextSize(context) {
  return JSON.stringify(context).length;
}

export function truncateText(text, maxLines) {
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

function buildReadmeContext({
  repoName,
  repoOwner,
  repoStructure,
  existingReadme,
  existingReadmeSha,
  commitData,
  changedFilesContent,
  fullCodebase,
}) {
  const context = {
    repoName,
    repoOwner,
    repoStructure,
    existingReadme: existingReadme || null,
    existingReadmeSha: existingReadmeSha || null,
    commitDiff: null,
    changedFiles: changedFilesContent || [],
    fullCodebase: fullCodebase || [],
  };

  if (commitData) {
    context.commitDiff = formatCommitDiff(commitData);
  }

  return context;
}

export function validateContext(context) {
  const errors = [];
  const warnings = [];

  if (!context.repoName) {
    errors.push("repoName is required");
  }

  if (!context.repoOwner) {
    errors.push("repoOwner is required");
  }

  if (!context.repoStructure) {
    warnings.push("repoStructure is missing - README may lack context");
  }

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

export function optimizeContext(context, maxTokens = 8000) {
  const maxChars = maxTokens * 4;

  if (estimateContextSize(context) <= maxChars) {
    return context;
  }

  const optimized = { ...context };
  const fits = () => estimateContextSize(optimized) <= maxChars;

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

  if (optimized.changedFiles && optimized.changedFiles.length > 0) {
    optimized.changedFiles = optimized.changedFiles.map((file) => ({
      ...file,
      content: truncateText(file.content, 50),
    }));
    if (fits()) return optimized;
  }

  if (optimized.repoStructure) {
    optimized.repoStructure = truncateText(optimized.repoStructure, 100);
    if (fits()) return optimized;
  }

  if (optimized.existingReadme) {
    optimized.existingReadme = truncateText(optimized.existingReadme, 100);
    if (fits()) return optimized;
  }

  if (optimized.commitDiff) {
    optimized.commitDiff = truncateText(optimized.commitDiff, 50);
  }

  return optimized;
}

function validateGeneratedReadme(readme) {
  if (typeof readme !== "string") {
    throw new Error("AI returned README in an invalid format");
  }

  const content = readme.trim();

  if (!content) {
    throw new Error("AI returned an empty README");
  }

  if (!content.startsWith("# ")) {
    throw new Error("Generated README is missing a top-level heading");
  }

  return content;
}

export async function generateReadme({
  repoName,
  repoOwner,
  repoStructure,
  existingReadme,
  existingReadmeSha,
  commitData,
  changedFilesContent,
  fullCodebase,
  sharedLogId,
  provider,
}) {
  console.log(`[LLM] Building full generation context`);
  liveUpdate(sharedLogId, `Building full generation context`);

  let context = buildReadmeContext({
    repoName,
    repoOwner,
    repoStructure,
    existingReadme,
    existingReadmeSha,
    commitData,
    changedFilesContent,
    fullCodebase,
  });

  const validation = validateContext(context);

  if (!validation.valid) {
    throw new Error(`Invalid context: ${validation.errors.join(", ")}`);
  }

  if (validation.warnings.length > 0) {
    console.warn("[LLM] Context warnings:", validation.warnings);
  }

  const fileCount = context.fullCodebase.length;
  console.log(
    `[LLM] Full context ready — ${fileCount} codebase file(s), ~${validation.estimatedTokens} tokens`,
  );
  liveUpdate(
    sharedLogId,
    `Context ready — ${fileCount} codebase file(s) (~${validation.estimatedTokens} tokens)`,
  );

  // Nothing but the repo name reached the model — the scan found no readable
  // files and the commit carried nothing. Generation still runs, but say so
  // loudly instead of silently shipping a guessed README.
  if (fileCount === 0 && context.changedFiles.length === 0 && !context.commitDiff) {
    console.warn(
      `[LLM] No code context available — README will be limited to repository metadata`,
    );
    liveUpdate(sharedLogId, `No code context available — README will be limited`);
  }

  if (validation.estimatedTokens > 8000) {
    console.log(`[LLM] Optimizing large context`);
    liveUpdate(sharedLogId, `Optimizing large context`);
    context = optimizeContext(context, 8000);
  }

  let prompt = buildFUllReadmePrompt(context);

  console.log(`[LLM] Generating README with AI`);
  liveUpdate(sharedLogId, `Generating README with AI`);
  const readme = await provider.generate(prompt);

  console.log(`[LLM] Validating generated README`);
  liveUpdate(sharedLogId, `Validating generated README`);
  const validatedReadme = validateGeneratedReadme(readme);

  console.log(
    `[LLM] ✓ Full README generated (${validatedReadme.length} chars)`,
  );
  liveUpdate(sharedLogId, `README generated successfully`);

  return validatedReadme;
}
