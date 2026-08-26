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

  return `
You are an expert technical writer and software engineer maintaining an existing README.md.

A commit landed in the repository. Your job is to decide which README sections that commit made inaccurate or incomplete, and to rewrite ONLY those sections.

You are NOT regenerating the README. Every section you do not return is preserved untouched by the server.

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

- Return a section ONLY if the commit above genuinely made it inaccurate, incomplete, or outdated.
- If nothing in the README is affected by this commit, return an empty "updates" array.
- Use ONLY the exact section names listed above. Never invent, rename, split, merge, or delete a section.
- Never return these protected sections: ${context.forbiddenSections.join(", ")}.
- Return at most ${context.maxSections} sections. Prefer the most affected ones.
- Each "content" value must be the COMPLETE replacement markdown for that section, starting with its heading line reproduced exactly as given above.
- Do not speculate about features, commands, dependencies, or configuration that are not visible in the provided context.
- Preserve wording, tone, formatting, and details of the existing section that are still accurate. Change only what the commit invalidated.
- Do not mention the commit, this instruction, or that you are an AI.

## Output

Return ONLY valid JSON in this exact shape. No markdown fences, no commentary:

{
  "updates": [
    { "section": "Installation", "content": "## Installation\\n\\nUpdated content..." }
  ]
}
`;
}
