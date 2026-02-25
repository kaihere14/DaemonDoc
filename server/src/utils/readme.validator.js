export const FORBIDDEN_SECTIONS = ["License", "Contributing", "__preamble__"];

const HALLUCINATION_PHRASES = [
  "as an AI language model",
  "as an AI",
  "[your",
  "TODO:",
  "PLACEHOLDER",
  "please note that",
  "I cannot",
  "I don't have",
  "I do not have",
  "note that I",
  "[insert",
  "[add your",
  "<your",
];

/**
 * Validate AI-generated patches before committing to a repository.
 *
 * @param {Object} params
 * @param {Object.<string, string>} params.originalSections - Parsed sections from the current README
 * @param {Object.<string, string>} params.originalHashes   - SHA-256 hashes of original sections
 * @param {Object.<string, string>} params.patches          - Section patches returned by the model
 * @param {string[]}               params.affectedKeys     - Keys the model was asked to patch
 * @returns {{ decision: "commit"|"retry"|"skip", reason: string, details: any }}
 */
export function validatePatches({
  originalSections,
  originalHashes,
  patches,
  affectedKeys,
}) {
  if (!patches || typeof patches !== "object" || Array.isArray(patches)) {
    return {
      decision: "retry",
      reason: "patches is not a valid object",
      details: null,
    };
  }

  const patchKeys = Object.keys(patches);
  const originalKeys = new Set(Object.keys(originalSections));

  // Forbidden section in patches
  for (const key of patchKeys) {
    if (FORBIDDEN_SECTIONS.includes(key)) {
      return {
        decision: "retry",
        reason: `Forbidden section modified: "${key}"`,
        details: { section: key },
      };
    }
  }

  // Model invented a section key that did not exist
  for (const key of patchKeys) {
    if (!originalKeys.has(key)) {
      return {
        decision: "retry",
        reason: `Model invented new section key: "${key}"`,
        details: { section: key },
      };
    }
  }

  // Hallucination phrases in patch content
  for (const key of patchKeys) {
    const content = patches[key];
    if (typeof content === "string") {
      const lower = content.toLowerCase();
      for (const phrase of HALLUCINATION_PHRASES) {
        if (lower.includes(phrase.toLowerCase())) {
          return {
            decision: "retry",
            reason: `Hallucination phrase detected in section "${key}": "${phrase}"`,
            details: { section: key, phrase },
          };
        }
      }
    }
  }

  return { decision: "commit", reason: "All validation checks passed", details: null };
}
