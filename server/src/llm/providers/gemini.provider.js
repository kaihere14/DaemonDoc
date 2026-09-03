import { APICallError, RetryError } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { aiCall } from "../ai.sdk.js";
import { buildDetectPrompt } from "../prompts/detect.prompt.js";
import { extractJson } from "../utils/response.js";
import { buildCleanupPrompt } from "../prompts/cleanup.prompt.js";

// Keys are tried in slot order. Unset or blank slots are dropped, so a
// half-filled .env still works instead of burning an attempt on nothing.
function loadGeminiKeys() {
  return [
    process.env.GEMINI_API_KEY1,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_API_KEY3,
  ]
    .map((key) => key?.trim())
    .filter(Boolean);
}

// Another key can plausibly fix these: 429 quota exhausted, 401/403 dead or
// revoked key, 408/409 transport hiccup, any 5xx overload. Everything else
// (400 bad request, invalid prompt, parse failure) fails the same way on
// every key, so rotating through them only wastes time.
const ROTATABLE_STATUS = new Set([401, 403, 408, 409, 429]);

// Pull the transport-level failure out of whatever generateText() threw.
function toApiError(error) {
  const cause = RetryError.isInstance(error) ? error.lastError : error;
  return APICallError.isInstance(cause) ? cause : null;
}

function isRotatable(error) {
  const apiError = toApiError(error);

  if (!apiError) return false;
  // No status means the request never reached the API (network/transport).
  if (apiError.statusCode === undefined) return apiError.isRetryable === true;

  return (
    ROTATABLE_STATUS.has(apiError.statusCode) || apiError.statusCode >= 500
  );
}

// Gemini leaves APICallError.message empty and puts the real reason in the
// response body, so neither one alone makes a usable log line.
function describe(error) {
  const apiError = toApiError(error);
  if (!apiError) return error.message;

  const status = apiError.statusCode
    ? `HTTP ${apiError.statusCode}`
    : "network error";
  const body = apiError.responseBody?.slice(0, 200);

  return body ? `${status} — ${body}` : status;
}

export class GeminiProvider {
  // detectionModel/generationModel are Gemini model ids. The provider binds
  // them to a key itself, because the key is what rotates — not the model.
  constructor({ detectionModel, generationModel, cleanupModel }) {
    this.detectionModel = detectionModel;
    this.generationModel = generationModel;
    this.cleanupModel = cleanupModel;

    // One AI SDK client per usable key, built once and reused for every call.
    this.clients = loadGeminiKeys().map((apiKey) =>
      createGoogleGenerativeAI({ apiKey }),
    );
  }

  // keys -> try key -> failure -> next key -> success.
  // Once every key is exhausted this throws, which is the signal a fallback
  // provider would hang off of in the orchestration layer above.
  async #call(modelId, options) {
    if (this.clients.length === 0) {
      throw new Error(
        "No Gemini API keys configured — set GEMINI_API_KEY1, GEMINI_API_KEY2 or GEMINI_API_KEY3.",
      );
    }

    let lastError;

    for (const [index, client] of this.clients.entries()) {
      try {
        // maxRetries: 0 — key rotation is the retry strategy. Letting the
        // SDK burn its own backoff on a key we are about to abandon just
        // delays the working key.
        return await aiCall({
          model: client(modelId),
          maxRetries: 0,
          ...options,
        });
      } catch (error) {
        if (!isRotatable(error)) throw error;

        lastError = error;
        console.warn(
          `[Gemini] key ${index + 1}/${this.clients.length} failed on ${modelId} (${describe(error)}) — trying next key`,
        );
      }
    }

    throw new Error(
      `All ${this.clients.length} Gemini API key(s) failed on ${modelId}. Last error: ${describe(lastError)}`,
      { cause: lastError },
    );
  }

  // Small model, tight budget — just picks full/patch mode.
  async detect(existingReadme) {
    const response = await this.#call(this.detectionModel, {
      prompt: buildDetectPrompt(existingReadme),
      temperature: 0,
      maxOutputTokens: 200,
    });

    return extractJson(response);
  }

  // Main model — free-form README generation, no JSON parsing here.
  async generate(prompt) {
    return this.#call(this.generationModel, {
      prompt,
      temperature: 0,
    });
  }

  async cleanup(existingReadme) {
    return this.#call(this.cleanupModel, {
      prompt: buildCleanupPrompt(existingReadme),
      temperature: 0,
    });
  }
}
