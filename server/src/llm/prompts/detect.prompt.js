export function buildDetectPrompt(existingReadme) {
  return `
You are analyzing an existing README to determine how it should be handled.

Determine exactly one generation mode:

- "full": The README is missing, empty, or needs to be completely generated/rebuilt.
- "patch": The README exists and only specific sections need to be updated.

Return ONLY valid JSON in this exact format:

{
  "mode": "full | patch",
  "reason": "Brief explanation for why this mode was selected."
}

Existing README:
---
${existingReadme || "(No README exists)"}
---
`.trim();
}