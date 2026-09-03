import { liveUpdate } from "../services/convex.service.js";
import { GeminiProvider } from "./providers/gemini.provider.js";
import { generateReadme } from "./readme.generate.js";
import { patchReadme } from "./readme.patch.js";

export class LlmService {
  // Main abstraction layer called at the start of the LLM workflow.
  // Detection and generation (full or patch) are handled internally,
  // and the final generated result is returned to the caller.

  // Model ids only — GeminiProvider binds them to whichever API key is live.
  detectionModel = "gemini-3.5-flash-lite";
  generationModel = "gemini-3.6-flash";
  cleanupModel = "gemini-3.6-flash";

  geminiProvider = new GeminiProvider({
    detectionModel: this.detectionModel,
    generationModel: this.generationModel,
    cleanupModel: this.cleanupModel,
  });

  async generate({
    repoName,
    repoOwner,
    repoStructure,
    existingReadme,
    existingReadmeSha,
    changedFilesContent,
    fullCodebase,
    commitData,
    sharedLogId,
  }) {
    // 1. Detection logic uses the small LLM to determine the mode of operation (full or patch).
    const { mode, reason } = await this.detect(existingReadme);

    console.log(`[LLM] Generation mode: ${mode} — ${reason}`);
    liveUpdate(sharedLogId, `Mode: ${mode} — ${reason}`);

    //full generation pipeline setup
    if (mode === "full") {
      console.log(`[LLM] FULL mode — scanning entire repository`);
      liveUpdate(sharedLogId, `FULL mode — scanning entire repository`);

      const readme = await generateReadme({
        repoName,
        repoOwner,
        repoStructure,
        existingReadme,
        existingReadmeSha,
        changedFilesContent,
        fullCodebase,
        commitData,
        sharedLogId,
        provider: this.geminiProvider,
      });

      return { skipped: false, readme };
    }

    //patch pipeline setup
    if (mode === "patch") {
      console.log(`[LLM] PATCH mode — scanning modified files only`);
      liveUpdate(sharedLogId, `PATCH mode — scanning modified files only`);

      return await patchReadme({
        repoName,
        repoOwner,
        repoStructure,
        existingReadme,
        changedFilesContent,
        commitData,
        sharedLogId,
        provider: this.geminiProvider,
      });
    }

    throw new Error(`Unknown generation mode: ${mode}`);
  }

  // Detection function uses the small LLM to determine
  // the mode of operation (full or patch).
  async detect(existingReadme) {
    // No README to analyze — full is the only possible outcome, so skip the
    // detection model call entirely instead of paying a round trip to learn it.
    if (!existingReadme || !existingReadme.trim()) {
      return {
        mode: "full",
        reason: "No existing README — generating from scratch",
      };
    }

    return this.geminiProvider.detect(existingReadme);
  }

  async cleanup(existingReadme) {
    return this.geminiProvider.cleanup(existingReadme);
  }
}
