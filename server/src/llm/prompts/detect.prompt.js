export function buildDetectPrompt(existingReadme) {
  return `
You are triaging an existing project README to decide how it should be updated.
The README below is non-empty. Choose exactly one mode.

- "full": the README should be regenerated from scratch. Pick this when it is a
  stub or template, is mostly placeholder text, describes a different project,
  is broken structurally, or is too thin to be worth patching.
- "patch": the README is basically sound and only specific sections need to
  change. Pick this when the structure and most content are usable and a
  reasonable update would touch a few sections rather than the whole document.

When the two options are close, choose "patch": it preserves existing content
and is cheaper to apply.

Return ONLY a JSON object in exactly this shape. No code fences, no extra keys,
no commentary:

{
  "mode": "full" | "patch",
  "reason": "One sentence explaining the choice."
}

Existing README:
---
${(existingReadme || "").trim() || "(empty)"}
---
`.trim();
}
