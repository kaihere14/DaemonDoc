import { createHash } from "crypto";

/**
 * Parse README content into named sections.
 * Content before the first heading is stored under "__preamble__".
 * @param {string} readmeContent
 * @returns {{ sections: Object.<string, string>, orderedKeys: string[] }}
 */
export function parseReadmeSections(readmeContent) {
  const sections = {};
  const orderedKeys = [];

  if (!readmeContent) {
    return { sections, orderedKeys };
  }

  const lines = readmeContent.split("\n");
  let currentKey = "__preamble__";
  let currentLines = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,2} (.+)/);
    if (headingMatch) {
      sections[currentKey] = currentLines.join("\n");
      orderedKeys.push(currentKey);
      currentKey = headingMatch[1].trim();
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  // Save the final section
  sections[currentKey] = currentLines.join("\n");
  orderedKeys.push(currentKey);

  return { sections, orderedKeys };
}

/**
 * Hash each section's content with SHA-256.
 * @param {Object.<string, string>} sections
 * @returns {Object.<string, string>} Map of section name → hex digest
 */
export function hashSections(sections) {
  const hashes = {};
  for (const [name, content] of Object.entries(sections)) {
    hashes[name] = createHash("sha256").update(content ?? "").digest("hex");
  }
  return hashes;
}

/**
 * Reconstruct a README string from sections, applying patches for specific keys.
 * @param {Object.<string, string>} originalSections
 * @param {string[]} orderedKeys
 * @param {Object.<string, string>} patches - Only keys present here are replaced
 * @returns {string}
 */
export function mergePatchedSections(originalSections, orderedKeys, patches) {
  const parts = [];
  for (const key of orderedKeys) {
    const content =
      patches && key in patches ? patches[key] : originalSections[key];
    if (content != null) {
      parts.push(content);
    }
  }
  return parts.join("\n");
}
