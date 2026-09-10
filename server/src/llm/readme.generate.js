import { liveUpdate } from "../services/convex.service.js";
import { buildFullReadmePrompt } from "./prompts/full.generate.prompt.js";
import { aiLog } from "../utils/logger.js";

const log = aiLog.child({ pipeline: "full" });

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
    aiLog.debug("Full codebase context", {
      files: context.fullCodebase.length,
    });
  }

  const size = estimateContextSize(context);
  const estimatedTokens = Math.ceil(size / 4);

  if (estimatedTokens > 200000) {
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

export function optimizeContext(context, maxTokens = 180000) {
  const maxChars = maxTokens * 4;

  if (estimateContextSize(context) <= maxChars) {
    return context;
  }

  const optimized = { ...context };
  const fits = () => estimateContextSize(optimized) <= maxChars;

  if (optimized.fullCodebase && optimized.fullCodebase.length > 0) {
    optimized.fullCodebase = optimized.fullCodebase.map((file) => ({
      ...file,
      content: truncateText(file.content, 400),
    }));
    if (fits()) return optimized;

    if (optimized.fullCodebase.length > 80) {
      optimized.fullCodebase = optimized.fullCodebase.slice(0, 80);
      if (fits()) return optimized;
    }

    optimized.fullCodebase = optimized.fullCodebase.map((file) => ({
      ...file,
      content: truncateText(file.content, 200),
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
    if (fits()) return optimized;
  }

  // Last-resort trims for a very tight budget (a low-context provider such as
  // Sarvam). The Gemini path never reaches here — its budget is far larger
  // than the steps above ever need. Shrink the source listing hard, keeping
  // some real code for small repos; only a genuinely huge repo ends up with
  // metadata alone.
  for (const [count, lines] of [
    [25, 150],
    [12, 80],
    [6, 40],
  ]) {
    if (optimized.fullCodebase.length > 0) {
      optimized.fullCodebase = optimized.fullCodebase
        .slice(0, count)
        .map((file) => ({ ...file, content: truncateText(file.content, lines) }));
      if (fits()) return optimized;
    }
  }

  optimized.fullCodebase = [];
  if (fits()) return optimized;

  optimized.changedFiles = [];
  if (fits()) return optimized;

  optimized.repoStructure = truncateText(optimized.repoStructure, 40);
  optimized.existingReadme = truncateText(optimized.existingReadme, 40);
  optimized.commitDiff = truncateText(optimized.commitDiff, 20);

  return optimized;
}

// Marker prefix on live-update messages that report a context trim. The client
// renders these with a "low context" badge instead of as plain log text.
export const LOW_CONTEXT_MARKER = "[low-context] ";

// Builds the prompt for one provider, trimming the shared context down to that
// provider's token budget first when it does not already fit. A high-context
// provider (Gemini) gets the context untouched; a low-context one (Sarvam)
// gets a trimmed copy. The other provider's prompt is unaffected — each call
// re-derives its own from the same source context.
export function buildProviderPrompt({
  provider,
  context,
  buildPrompt,
  optimize,
  sharedLogId,
  logger,
}) {
  const limit = provider.getContextTokenLimit?.() ?? Infinity;
  const fullPrompt = buildPrompt(context);
  const estimatedTokens = Math.ceil(fullPrompt.length / 4);

  if (estimatedTokens <= limit) {
    return { prompt: fullPrompt, trimmed: false };
  }

  // optimize() budgets the JSON context only; the prompt template adds a fixed
  // scaffold on top, so aim the context trim a little below the real limit.
  const SCAFFOLD_TOKENS = 2500;
  const contextTarget = Math.max(limit - SCAFFOLD_TOKENS, 1000);
  const trimmedContext = optimize(context, contextTarget);
  const prompt = buildPrompt(trimmedContext);

  logger?.info?.("Trimmed context for low-context provider", {
    provider: provider.getName(),
    fromTokens: estimatedTokens,
    limit,
    toTokens: Math.ceil(prompt.length / 4),
  });
  liveUpdate(
    sharedLogId,
    `${LOW_CONTEXT_MARKER}Trimmed the repository context to fit ${provider.getName()}'s smaller context window`,
  );

  return { prompt, trimmed: true };
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

export async function detectReadme({
  existingReadme,
  provider,
  fallBackProvider,
  sharedLogId,
}) {
  if (!existingReadme || !existingReadme.trim()) {
    return {
      mode: "full",
      reason: "No existing README — generating from scratch",
    };
  }

  let result;

  try {
    log.info("Detecting update mode", { provider: provider.getName() });
    liveUpdate(sharedLogId, "Analysing the existing README");
    result = await provider.detect(existingReadme);
  } catch (error) {
    log.warn("Detection failed — falling back", {
      provider: provider.getName(),
      fallback: fallBackProvider.getName(),
      detail: error.message,
    });
    liveUpdate(sharedLogId, "Primary model unavailable — switching to backup");
    result = await fallBackProvider.detect(existingReadme);
  }

  if (!result) {
    log.error("Detection returned no usable result from any provider");
    result = {
      mode: "failed",
      reason: "Unable to analyse the existing README",
    };
  }

  return result;
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
  fallBackProvider,
}) {
  log.info("Building generation context", { repo: `${repoOwner}/${repoName}` });
  liveUpdate(sharedLogId, "Preparing the repository context");

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
    log.warn("Context warnings", { warnings: validation.warnings });
  }

  const fileCount = context.fullCodebase.length;
  log.info("Context ready", {
    files: fileCount,
    estimatedTokens: validation.estimatedTokens,
  });
  liveUpdate(
    sharedLogId,
    `Context ready — ${fileCount} file(s), roughly ${validation.estimatedTokens.toLocaleString()} tokens`,
  );

  // Nothing but the repo name reached the model — the scan found no readable
  // files and the commit carried nothing. Generation still runs, but say so
  // loudly instead of silently shipping a guessed README.
  if (
    fileCount === 0 &&
    context.changedFiles.length === 0 &&
    !context.commitDiff
  ) {
    log.warn(
      "No code context available — README limited to repository metadata",
    );
    liveUpdate(
      sharedLogId,
      "No readable code found — the README will cover repository metadata only",
    );
  }

  if (validation.estimatedTokens > 180000) {
    log.info("Trimming oversized context", {
      estimatedTokens: validation.estimatedTokens,
      limit: 180000,
    });
    liveUpdate(sharedLogId, "Trimming the context to fit the model window");
    context = optimizeContext(context, 180000);
  }

  // Each provider gets its own prompt: a low-context provider (Sarvam) is
  // handed a context trimmed to its window, while the fallback keeps the full
  // context. buildProviderPrompt is a no-op for a provider that already fits.
  const primary = buildProviderPrompt({
    provider,
    context,
    buildPrompt: buildFullReadmePrompt,
    optimize: optimizeContext,
    sharedLogId,
    logger: log,
  });

  let readme;
  try {
    log.info("Generating README", { provider: provider.getName() });
    liveUpdate(sharedLogId, "Writing the README");
    readme = await provider.generate(primary.prompt);
  } catch (error) {
    if (!fallBackProvider) throw error;

    log.warn("Generation failed — falling back", {
      provider: provider.getName(),
      fallback: fallBackProvider.getName(),
      detail: error.message,
    });
    liveUpdate(sharedLogId, "Primary model unavailable — switching to backup");

    const fallback = buildProviderPrompt({
      provider: fallBackProvider,
      context,
      buildPrompt: buildFullReadmePrompt,
      optimize: optimizeContext,
      sharedLogId,
      logger: log,
    });
    readme = await fallBackProvider.generate(fallback.prompt);
  }

  if (!readme) throw new Error("No README returned by any provider");

  log.debug("Validating generated README");
  liveUpdate(sharedLogId, "Reviewing the generated README");
  const validatedReadme = validateGeneratedReadme(readme);

  log.info("README generated", { chars: validatedReadme.length });
  liveUpdate(sharedLogId, "README ready");

  return validatedReadme;
}
