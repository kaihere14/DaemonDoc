import { liveUpdate } from "../services/convex.service.js";
import { GeminiProvider } from "./providers/gemini.provider.js";
import { google } from "@ai-sdk/google";
import { generateReadme } from "./readme.generate.js";

export class LlmService {
  // Main abstraction layer called at the start of the LLM workflow.
  // Detection and generation (full or patch) are handled internally,
  // and the final generated result is returned to the caller.

  detectionModel = google("gemini-3.5-flash-lite");
  generationModel = google("gemini-3.5-flash");

  geminiProvider = new GeminiProvider({
    detectionModel: this.detectionModel,
    generationModel: this.generationModel,
  });

  async generate({
    repoName,
    repoOwner,
    repoStructure,
    existingReadme,
    existingReadmeSha,
    changedFilesContent,
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

      return await generateReadme({
        repoName,
        repoOwner,
        repoStructure,
        existingReadme,
        existingReadmeSha,
        changedFilesContent,
        commitData,
        sharedLogId,
        provider: this.geminiProvider,
      });
    }

    //patch pipeline setup
    if (mode === "patch") {
      console.log(`[LLM] PATCH mode — scanning modified files only`);
      liveUpdate(sharedLogId, `PATCH mode — scanning modified files only`);

      return reason;
    }

    throw new Error(`Unknown generation mode: ${mode}`);
  }

  // Detection function uses the small LLM to determine
  // the mode of operation (full or patch).
  async detect(existingReadme) {
    return this.geminiProvider.detect(existingReadme);
  }
}
