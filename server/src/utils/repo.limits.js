// How much of a repository the worker fetches per job, before any LLM call.
// Gemini's 1M-token context window is what makes limits this large affordable.
export const REPOSITORY_LIMITS = {
  maxFilesFullScan: 50,
  maxLinesPerFile: 500,
  maxChangedFiles: 20,
  maxChangedFileLines: 300,
  maxPatchFiles: 15,
  maxPatchFileLines: 200,
  maxPatchSections: 10,
};
