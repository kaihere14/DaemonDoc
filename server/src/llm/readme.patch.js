import { liveUpdate } from "../services/convex.service.js";
import {
  parseReadmeSections,
  mergePatchedSections,
} from "../utils/readme.parser.js";
import {
  FORBIDDEN_SECTIONS,
  validatePatches,
} from "../utils/readme.validator.js";
import { formatCommitDiff, truncateText } from "./readme.generate.js";
import { buildPatchReadmePrompt } from "./prompts/patch.generate.prompt.js";
import { extractJson } from "./utils/response.js";

// Patch mode ships far less context than full mode: only the current README,
// the commit diff, and the files that commit touched.
const MAX_CONTEXT_TOKENS = 8000;
const MAX_PATCH_SECTIONS = 10;

function estimateContextSize(context) {
  return JSON.stringify(context).length;
}

// Sections are keyed by heading text, but the heading LEVEL is part of the
// section body. Keep it so a replacement can be re-anchored to the original.
function headingLineOf(sectionContent) {
  if (!sectionContent) return null;

  for (const line of sectionContent.split("\n")) {
    const match = line.match(/^(#{1,2}) (.+)/);
    if (match) return { line, level: match[1], text: match[2].trim() };
  }

  return null;
}

function buildPatchContext({
  repoName,
  repoOwner,
  repoStructure,
  existingReadme,
  commitData,
  changedFilesContent,
}) {
  const { sections, orderedKeys } = parseReadmeSections(existingReadme);

  // The model only ever sees sections it is allowed to rewrite.
  const editableKeys = orderedKeys.filter(
    (key) => !FORBIDDEN_SECTIONS.includes(key) && headingLineOf(sections[key]),
  );

  const context = {
    repoName,
    repoOwner,
    repoStructure: repoStructure || null,
    commitDiff: commitData ? formatCommitDiff(commitData) : null,
    changedFiles: changedFilesContent || [],
    sections: editableKeys.map((key) => ({
      name: key,
      heading: headingLineOf(sections[key]).line,
      content: sections[key],
    })),
    forbiddenSections: FORBIDDEN_SECTIONS,
    maxSections: MAX_PATCH_SECTIONS,
  };

  return { context, sections, orderedKeys, editableKeys };
}

export function validatePatchContext(context) {
  const errors = [];
  const warnings = [];

  if (!context.repoName) {
    errors.push("repoName is required");
  }

  if (!context.repoOwner) {
    errors.push("repoOwner is required");
  }

  if (context.sections.length === 0) {
    errors.push("Existing README has no patchable sections");
  }

  if (!context.commitDiff && context.changedFiles.length === 0) {
    warnings.push(
      "No commit diff or changed files - cannot determine what to patch",
    );
  }

  if (!context.repoStructure) {
    warnings.push("repoStructure is missing - patch may lack context");
  }

  const estimatedTokens = Math.ceil(estimateContextSize(context) / 4);

  if (estimatedTokens > MAX_CONTEXT_TOKENS) {
    warnings.push(
      `Context is large (${estimatedTokens} tokens) - will be optimized`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    estimatedTokens,
  };
}

// Trims the model-facing payload only. `sections`/`orderedKeys` used for the
// merge are untouched, so untouched README text is never truncated on disk.
export function optimizePatchContext(context, maxTokens = MAX_CONTEXT_TOKENS) {
  const maxChars = maxTokens * 4;

  if (estimateContextSize(context) <= maxChars) {
    return context;
  }

  const optimized = { ...context };
  const fits = () => estimateContextSize(optimized) <= maxChars;

  if (optimized.changedFiles.length > 0) {
    optimized.changedFiles = optimized.changedFiles.map((file) => ({
      ...file,
      content: truncateText(file.content, 120),
    }));
    if (fits()) return optimized;

    if (optimized.changedFiles.length > 10) {
      optimized.changedFiles = optimized.changedFiles.slice(0, 10);
      if (fits()) return optimized;
    }

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

  if (optimized.commitDiff) {
    optimized.commitDiff = truncateText(optimized.commitDiff, 50);
  }

  return optimized;
}

// Turns the model's `{ updates: [...] }` into a { sectionName: markdown } map.
// A malformed patch throws — it must never reach the repository. An entry with
// no content is not malformed, only empty, so it is dropped instead.
export function parsePatchResponse(response, { sections, editableKeys }) {
  let parsed;

  try {
    parsed = extractJson(response);
  } catch (error) {
    throw new Error(`AI returned malformed patch JSON: ${error.message}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI patch response is not a JSON object");
  }

  if (!Array.isArray(parsed.updates)) {
    throw new Error('AI patch response is missing an "updates" array');
  }

  if (parsed.updates.length > MAX_PATCH_SECTIONS) {
    throw new Error(
      `AI returned ${parsed.updates.length} section updates (max ${MAX_PATCH_SECTIONS})`,
    );
  }

  const editable = new Set(editableKeys);
  const patches = {};

  for (const update of parsed.updates) {
    if (!update || typeof update !== "object" || Array.isArray(update)) {
      throw new Error("AI patch response contains a non-object update entry");
    }

    const { section, content } = update;

    if (typeof section !== "string" || !section.trim()) {
      throw new Error('AI patch update is missing a "section" name');
    }

    // An entry with no content is the model saying "nothing to change here".
    // Treat it as a no-op section instead of failing the whole run.
    if (typeof content !== "string" || !content.trim()) {
      console.log(`[Patch] Skipping empty update for section "${section}"`);
      continue;
    }

    if (section in patches) {
      throw new Error(`AI returned duplicate updates for section "${section}"`);
    }

    if (!editable.has(section)) {
      throw new Error(
        `AI returned a section that cannot be patched: "${section}"`,
      );
    }

    patches[section] = reanchorSection(section, content, sections[section]);
  }

  return patches;
}

// The section name is already verified against the existing README, so pinning
// the replacement to the original heading line is a safe deterministic repair —
// it stops a model-chosen heading level from re-keying the section next run.
function reanchorSection(name, content, originalContent) {
  const replacement = headingLineOf(content);

  if (!replacement) {
    throw new Error(
      `Replacement for section "${name}" does not start with a heading`,
    );
  }

  if (replacement.text !== name) {
    throw new Error(
      `Replacement for section "${name}" is headed "${replacement.text}"`,
    );
  }

  const original = headingLineOf(originalContent);
  const trimmed = content.replace(/\s+$/, "");
  const body = trimmed.slice(trimmed.indexOf(replacement.line));

  if (original.level === replacement.level) {
    return body;
  }

  return original.line + body.slice(replacement.line.length);
}

function validatePatchedReadme(readme, orderedKeys) {
  if (typeof readme !== "string") {
    throw new Error("Patched README is not a string");
  }

  const content = readme.trim();

  if (!content) {
    throw new Error("Patched README is empty");
  }

  // Re-parsing must yield the same section keys in the same order, otherwise
  // the patch dropped, renamed, or introduced a section.
  const { orderedKeys: patchedKeys } = parseReadmeSections(readme);

  if (patchedKeys.length !== orderedKeys.length) {
    throw new Error(
      `Patched README has ${patchedKeys.length} sections, expected ${orderedKeys.length}`,
    );
  }

  for (let i = 0; i < orderedKeys.length; i++) {
    if (patchedKeys[i] !== orderedKeys[i]) {
      throw new Error(
        `Patched README section order changed at index ${i}: expected "${orderedKeys[i]}", got "${patchedKeys[i]}"`,
      );
    }
  }

  return readme;
}

export async function patchReadme({
  repoName,
  repoOwner,
  repoStructure,
  existingReadme,
  commitData,
  changedFilesContent,
  sharedLogId,
  provider,
}) {
  if (!existingReadme || !existingReadme.trim()) {
    throw new Error("PATCH mode requires an existing README");
  }

  console.log(`[Patch] Analyzing README changes`);
  liveUpdate(sharedLogId, `PATCH mode — analyzing README changes`);

  const { context, sections, orderedKeys, editableKeys } = buildPatchContext({
    repoName,
    repoOwner,
    repoStructure,
    existingReadme,
    commitData,
    changedFilesContent,
  });

  const validation = validatePatchContext(context);

  if (!validation.valid) {
    throw new Error(`Invalid patch context: ${validation.errors.join(", ")}`);
  }

  if (validation.warnings.length > 0) {
    console.warn("[Patch] Context warnings:", validation.warnings);
  }

  let patchContext = context;

  if (validation.estimatedTokens > MAX_CONTEXT_TOKENS) {
    patchContext = optimizePatchContext(context, MAX_CONTEXT_TOKENS);
  }

  console.log(`[Patch] ${editableKeys.length} patchable section(s)`);
  liveUpdate(sharedLogId, `Identifying affected README sections`);

  const prompt = buildPatchReadmePrompt(patchContext);
  const response = await provider.generate(prompt);

  liveUpdate(sharedLogId, `Generating section updates`);

  const patches = parsePatchResponse(response, { sections, editableKeys });
  const patchedKeys = Object.keys(patches);

  // An empty patch is a valid outcome: the commit did not change anything the
  // README documents. Skip the run instead of failing it.
  if (patchedKeys.length === 0) {
    console.log(`[Patch] No sections needed updating — skipping`);
    liveUpdate(sharedLogId, `No major section update — README already current`);

    return {
      skipped: true,
      reason: "AI returned no section updates",
    };
  }

  const patchValidation = validatePatches({
    originalSections: sections,
    patches,
  });

  if (patchValidation.decision !== "commit") {
    throw new Error(`Patch rejected: ${patchValidation.reason}`);
  }

  console.log(`[Patch] Applying sections: ${patchedKeys.join(", ")}`);
  liveUpdate(sharedLogId, `Applying README patch`);

  const finalReadme = mergePatchedSections(sections, orderedKeys, patches);
  const validatedReadme = validatePatchedReadme(finalReadme, orderedKeys);

  console.log(
    `[Patch] ✓ Patched [${patchedKeys.join(", ")}] (${validatedReadme.length} chars)`,
  );
  liveUpdate(sharedLogId, `README patch generated successfully`);

  return { skipped: false, readme: validatedReadme };
}
