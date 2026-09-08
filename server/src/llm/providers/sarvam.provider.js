// npm i sarvamai@1.1.8-alpha.5
import { SarvamAIClient } from "sarvamai";
import { buildDetectPrompt } from "../prompts/detect.prompt.js";
import { buildCleanupPrompt } from "../prompts/cleanup.prompt.js";
import { extractJson } from "../utils/response.js";

// Sarvam ships no AI SDK adapter, so this provider talks to the vendor client
// directly. It exposes the same surface as GeminiProvider (getName/detect/
// generate) so the orchestration layer can swap one for the other blindly.
const MODEL = "sarvam-105b-conversations";

// The vendor client throws several error shapes (HTTP error, network error,
// SDK validation error), and none of them alone reads as a usable log line.
function describe(error) {
  const status = error?.statusCode ?? error?.status;
  const body =
    typeof error?.body === "string"
      ? error.body.slice(0, 200)
      : error?.body
        ? JSON.stringify(error.body).slice(0, 200)
        : null;

  const prefix = status ? `HTTP ${status}` : "network error";
  return body ? `${prefix} — ${body}` : `${prefix} — ${error?.message}`;
}

export class SarvamProvider {
  constructor() {
    this.name = "Sarvam";
    this.apiKey = process.env.SARVAM_API_KEY?.trim();
    this.client = this.apiKey
      ? new SarvamAIClient({ apiKey: this.apiKey })
      : null;
  }

  getName() {
    return this.name;
  }

  // Single entry point for every call, so key checks, logging and empty
  // responses are handled once instead of per method.
  async #call(label, prompt) {
    if (!this.client) {
      throw new Error(
        "No Sarvam API key configured — set SARVAM_API_KEY to enable the fallback provider.",
      );
    }

    const startedAt = Date.now();

    let response;
    try {
      response = await this.client.chat.completions({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
      });
    } catch (error) {
      console.error(
        `[Sarvam] ${label} failed on ${MODEL} (${describe(error)})`,
      );
      throw error;
    }

    const content = response?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(`Sarvam returned an empty ${label} response`);
    }

    console.log(
      `[Sarvam] ${label} completed on ${MODEL} in ${Date.now() - startedAt}ms`,
    );

    return content;
  }

  async generate(prompt) {
    return this.#call("generation", prompt);
  }

  async detect(existingReadme) {
    const content = await this.#call(
      "detection",
      buildDetectPrompt(existingReadme),
    );

    return extractJson(content);
  }

  async cleanup(existingReadme) {
    return this.#call("cleanup", buildCleanupPrompt(existingReadme));
  }
}
