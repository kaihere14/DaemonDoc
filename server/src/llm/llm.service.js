import { liveUpdate } from "../services/convex.service.js";
import { aiLog as log, providerLog } from "../utils/logger.js";
import { detectReadme, generateReadme } from "./readme.generate.js";
import { GeminiProvider } from "./providers/gemini.provider.js";
import { SarvamProvider } from "./providers/sarvam.provider.js";
import { patchReadme } from "./readme.patch.js";
import { createProvidersInstances } from "./utils/object-creator.js";

export class LlmService {
  // Main abstraction layer called at the start of the LLM workflow.
  // Detection and generation (full or patch) are handled internally,
  // and the final generated result is returned to the caller.

  // Model ids only — GeminiProvider binds them to whichever API key is live.

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
    providersPriority,
  }) {
    let providers = await createProvidersInstances(
      providersPriority,
      GeminiProvider,
      SarvamProvider,
    );

    log.info("Resolved LLM provider priority", {
      priority: providersPriority ?? ["gemini", "sarvam"],
      primary: providers[0].getName(),
      fallback: providers[1]?.getName(),
    });

    // 1. Detection logic uses the small LLM to determine the mode of operation (full or patch).
    const { mode, reason } = await detectReadme({
      existingReadme,
      provider: providers[0],
      fallBackProvider: providers[1],
      sharedLogId,
    });

    log.info("Generation mode selected", { mode, reason });
    liveUpdate(
      sharedLogId,
      `Update strategy: ${mode === "patch" ? "targeted update" : "full rewrite"} — ${reason}`,
    );

    //full generation pipeline setup
    if (mode === "full") {
      log.info("Full mode — scanning entire repository");
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
        provider: providers[0],
        fallBackProvider: providers[1],
      });

      return { skipped: false, readme };
    }

    //patch pipeline setup
    if (mode === "patch") {
      log.info("Patch mode — scanning modified files only");
      liveUpdate(sharedLogId, "Reading the changed files");

      return await patchReadme({
        repoName,
        repoOwner,
        repoStructure,
        existingReadme,
        changedFilesContent,
        commitData,
        sharedLogId,
        provider: providers[0],
        fallBackProvider: providers[1],
      });
    }

    throw new Error(`Unknown generation mode: ${mode}`);
  }

  // Detection function uses the small LLM to determine
  // the mode of operation (full or patch).

  // Cleanup runs outside the generate() pipeline (its own queue), so it owns
  // the same primary/fallback handling instead of inheriting it from above.
  async cleanup(existingReadme, sharedLogId, providersPriority) {
    let providers;
    try {
      providers = await createProvidersInstances(
        providersPriority,
        GeminiProvider,
        SarvamProvider,
      );
      log.info("Resolved LLM provider priority", {
        priority: providersPriority ?? ["gemini", "sarvam"],
        primary: providers[0].getName(),
        fallback: providers[1]?.getName(),
      });

      providerLog(providers[0].getName()).info("Cleaning README");
      return await providers[0].cleanup(existingReadme);
    } catch (error) {
      // A failure inside createProvidersInstances leaves `providers` unset, so
      // guard before reaching for the fallback.
      if (!providers?.[1]) throw error;

      log.warn("Cleanup failed — falling back", {
        provider: providers[0].getName(),
        fallback: providers[1].getName(),
        detail: error.message,
      });
      liveUpdate(
        sharedLogId,
        "Primary model unavailable — switching to backup",
      );

      return await providers[1].cleanup(existingReadme);
    }
  }
}
