// How much of a repository the worker fetches per job, before any LLM call.
// Gemini 3.6 Flash's 1M-token input window makes limits this large affordable;
// the model-facing context is still capped to ~180K tokens downstream to stay
// under the free-tier 250K tokens/minute ceiling with output headroom.
export const REPOSITORY_LIMITS = {
  maxFilesFullScan: 200,
  maxLinesPerFile: 1500,
  maxChangedFiles: 60,
  maxChangedFileLines: 800,
  maxPatchFiles: 40,
  maxPatchFileLines: 600,
  maxPatchSections: 20,
};
