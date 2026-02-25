// Merged language map — union of groq.service.js and github.service.js maps.
// Keeps more specific values (e.g. "jsx" over "javascript" for .jsx files).
export const LANG_MAP = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  java: "java",
  kt: "kotlin",
  swift: "swift",
  php: "php",
  cs: "csharp",
  cpp: "cpp",
  c: "c",
  h: "c",
  hpp: "cpp",
  scala: "scala",
  md: "markdown",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  xml: "xml",
  html: "html",
  css: "css",
  scss: "scss",
  sql: "sql",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  dockerfile: "dockerfile",
  prisma: "prisma",
};

export function getLanguageFromExtension(filePath) {
  const ext = filePath.split(".").pop()?.toLowerCase();
  return LANG_MAP[ext] || ext || "";
}
