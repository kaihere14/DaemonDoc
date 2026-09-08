import { liveUpdate } from "../services/convex.service.js";
import { GeminiProvider } from "./providers/gemini.provider.js";
import { SarvamProvider } from "./providers/sarvam.provider.js";
import { detectReadme, generateReadme } from "./readme.generate.js";
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

  sarvamProvider = new SarvamProvider();

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
    const { mode, reason } = await detectReadme({
      existingReadme,
      provider: this.geminiProvider,
      fallBackProvider: this.sarvamProvider,
      sharedLogId,
    });

    console.log(`[LLM] Generation mode: ${mode} — ${reason}`);
    liveUpdate(
      sharedLogId,
      `Update strategy: ${mode === "patch" ? "targeted update" : "full rewrite"} — ${reason}`,
    );

    //full generation pipeline setup
    if (mode === "full") {
      console.log(`[LLM] FULL mode — scanning entire repository`);
      liveUpdate(sharedLogId, "Reading the full repository");

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
        fallBackProvider: this.sarvamProvider,
      });

      return { skipped: false, readme };
    }

    //patch pipeline setup
    if (mode === "patch") {
      console.log(`[LLM] PATCH mode — scanning modified files only`);
      liveUpdate(sharedLogId, "Reading the changed files");

      return await patchReadme({
        repoName,
        repoOwner,
        repoStructure,
        existingReadme,
        changedFilesContent,
        commitData,
        sharedLogId,
        provider: this.geminiProvider,
        fallBackProvider: this.sarvamProvider,
      });
    }

    throw new Error(`Unknown generation mode: ${mode}`);
  }

  // Detection function uses the small LLM to determine
  // the mode of operation (full or patch).

  // Cleanup runs outside the generate() pipeline (its own queue), so it owns
  // the same primary/fallback handling instead of inheriting it from above.
  async cleanup(existingReadme, sharedLogId) {
    try {
      console.log(
        `[LLM] Cleaning README with ${this.geminiProvider.getName()}`,
      );
      return await this.geminiProvider.cleanup(existingReadme);
    } catch (error) {
      console.warn(
        `[LLM] ${this.geminiProvider.getName()} cleanup failed (${error.message}) — falling back to ${this.sarvamProvider.getName()}`,
      );
      liveUpdate(
        sharedLogId,
        "Primary model unavailable — switching to backup",
      );

      return this.sarvamProvider.cleanup(existingReadme);
    }
  }
}
