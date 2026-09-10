// npm i sarvamai@1.1.8-alpha.5
import { SarvamAIClient } from "sarvamai";
import { buildDetectPrompt } from "../prompts/detect.prompt.js";
import { buildCleanupPrompt } from "../prompts/cleanup.prompt.js";
import { extractJson } from "../utils/response.js";
import { providerLog } from "../../utils/logger.js";

const log = providerLog("Sarvam");

// Sarvam ships no AI SDK adapter, so this provider talks to the vendor client
// directly. It exposes the same surface as GeminiProvider (getName/detect/
// generate) so the orchestration layer can swap one for the other blindly.
const MODEL = "sarvam-105b-conversations";

// Sarvam's context window is 32K tokens for prompt + completion combined —
// far tighter than Gemini. Reserve headroom for the generated README and let
// the rest go to the prompt. The generation pipeline reads getContextTokenLimit()
// and trims the repository context down to this budget before calling Sarvam;
// the Gemini fallback keeps the full, untrimmed context.
const CONTEXT_WINDOW_TOKENS = 32_000;
const COMPLETION_RESERVE_TOKENS = 8_000;
const PROMPT_TOKEN_BUDGET = CONTEXT_WINDOW_TOKENS - COMPLETION_RESERVE_TOKENS;

// Rough chars-per-token, matching the estimate the pipelines use elsewhere.
const MAX_PROMPT_CHARS = PROMPT_TOKEN_BUDGET * 4;

// detect/cleanup embed the existing README at the very end of the prompt,
// followed only by a closing marker, so clamping the README text is a safe
// way to keep those single-shot calls inside the window.
function clampReadme(existingReadme) {
  const text = (existingReadme || "").trim();
  if (text.length <= MAX_PROMPT_CHARS) return text;

  log.warn("Existing README exceeds Sarvam window — clamping", {
    chars: text.length,
    limit: MAX_PROMPT_CHARS,
  });
  return `${text.slice(0, MAX_PROMPT_CHARS)}\n\n... (truncated to fit Sarvam's context window)`;
}

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

  // Prompt-token budget the generation pipeline trims the context to before
  // handing a prompt to this provider.
  getContextTokenLimit() {
    return PROMPT_TOKEN_BUDGET;
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
      log.error(`${label} call failed`, {
        model: MODEL,
        detail: describe(error),
      });
      throw error;
    }

    const content = response?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(`Sarvam returned an empty ${label} response`);
    }

    log.info(`${label} call completed`, {
      model: MODEL,
      durationMs: Date.now() - startedAt,
    });

    return content;
  }

  async generate(prompt) {
    return this.#call("generation", prompt);
  }

  async detect(existingReadme) {
    const content = await this.#call(
      "detection",
      buildDetectPrompt(clampReadme(existingReadme)),
    );

    return extractJson(content);
  }

  async cleanup(existingReadme) {
    return this.#call("cleanup", buildCleanupPrompt(clampReadme(existingReadme)));
  }
}
