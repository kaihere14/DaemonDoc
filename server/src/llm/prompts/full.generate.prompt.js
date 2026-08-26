export function buildFUllReadmePrompt(context) {
  return `
You are an expert technical writer and software engineer.

Generate a complete, accurate, and professional README.md for the repository described by the context below.

Your job is to understand the project from the provided repository structure, existing README, commit information, changed files, and source code, then produce the best possible README for a developer who is discovering this repository for the first time.

## Requirements

- Return ONLY the README content.
- Return valid Markdown.
- Do not wrap the response in \`\`\`markdown or any other code fence.
- Do not explain your reasoning.
- Do not mention that you are an AI.
- Do not invent features, commands, APIs, dependencies, configuration, or behavior that are not supported by the provided context.
- Prefer information directly supported by the source code and repository data.
- If an existing README is provided, improve or replace it based on the actual repository rather than blindly copying it.
- Keep technically important information from the existing README when it is still accurate.
- Make the README clear, structured, concise, and useful.
- Include appropriate sections based on what the project actually contains. Do not force irrelevant sections.
- Use correct Markdown formatting.
- Ensure installation and usage instructions are consistent with the repository's actual dependencies and structure.

## Repository Context

${JSON.stringify(context, null, 2)}

## Output

Generate the complete README.md now.
`;
}
