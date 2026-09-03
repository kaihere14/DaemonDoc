export function buildPatchReadmePrompt(context) {
  const sectionList = context.sections
    .map(
      (section) =>
        `### ${section.name}\nHeading line to reproduce verbatim: ${section.heading}\nCurrent content:\n\`\`\`markdown\n${section.content}\n\`\`\`\n`,
    )
    .join("\n");

  const changedFiles =
    context.changedFiles.length > 0
      ? context.changedFiles
          .map(
            (file) =>
              `### \`${file.path}\` (${file.status || "modified"})\n\`\`\`${file.language || ""}\n${file.content}\n\`\`\`\n`,
          )
          .join("\n")
      : "(none)";

  const forbidden =
    context.forbiddenSections.length > 0
      ? context.forbiddenSections.join(", ")
      : "(none)";

  return `
You are a technical writer maintaining an existing README.md. A commit just
landed in the repository. Decide which README sections that commit made
inaccurate, incomplete, or outdated, and rewrite ONLY those sections.

You are NOT regenerating the README. Any section you do not return is kept
exactly as it is. Returning fewer sections is better than returning more.

## Repository

${context.repoOwner}/${context.repoName}

## Repository Structure

\`\`\`
${context.repoStructure || "(not available)"}
\`\`\`

## Commit Changes

\`\`\`
${context.commitDiff || "(no diff available)"}
\`\`\`

## Changed File Contents

${changedFiles}

## Existing README Sections

${sectionList}

## Rules

- Return a section ONLY if the commit above genuinely made it wrong, incomplete,
  or outdated. If nothing is affected, return an empty "updates" array.
- Use ONLY the exact section names listed above. Never invent, rename, split,
  merge, or delete a section.
- Never return these protected sections: ${forbidden}.
- Return at most ${context.maxSections} sections. Prefer the most affected ones.
- Each "content" value is the COMPLETE replacement Markdown for that section. It
  MUST begin with that section's "Heading line to reproduce verbatim" exactly as
  given above — same text and same heading level (number of leading \`#\`).
- Change only what the commit invalidated. Preserve the wording, tone, structure,
  and detail of the rest of the section.
- Base every change on the provided commit, changed files, and repository
  structure. Do not add features, commands, dependencies, or configuration that
  are not visible in that context.
- Do not mention the commit, these instructions, or that you are an AI.

## Output

Return ONLY a valid JSON object in exactly this shape — no code fences, no
commentary. Escape every newline inside "content" as \\n:

{
  "updates": [
    { "section": "Installation", "content": "## Installation\\n\\nUpdated content..." }
  ]
}
`.trim();
}
