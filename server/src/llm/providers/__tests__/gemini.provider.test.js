import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { APICallError, RetryError } from "ai";

const aiCall = vi.fn();
vi.mock("../../ai.sdk.js", () => ({ aiCall: (...args) => aiCall(...args) }));
vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: (config) => (modelId) => ({ modelId, config }),
}));

const { GeminiProvider } = await import("../gemini.provider.js");

function apiError(statusCode, responseBody = "") {
  return new APICallError({
    message: "boom",
    url: "https://example.test",
    requestBodyValues: {},
    statusCode,
    responseBody,
  });
}

const CONFIG = {
  detectionModel: "gemini-detect",
  generationModel: "gemini-gen",
  cleanupModel: "gemini-clean",
};

describe("GeminiProvider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    aiCall.mockReset();
    process.env.GEMINI_API_KEY1 = "key-1";
    process.env.GEMINI_API_KEY2 = "key-2";
    delete process.env.GEMINI_API_KEY3;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("drops unset/blank key slots", () => {
    delete process.env.GEMINI_API_KEY2;
    process.env.GEMINI_API_KEY3 = "  ";
    const provider = new GeminiProvider(CONFIG);
    expect(provider.clients).toHaveLength(1);
  });

  it("throws immediately when no keys are configured", async () => {
    delete process.env.GEMINI_API_KEY1;
    delete process.env.GEMINI_API_KEY2;
    const provider = new GeminiProvider(CONFIG);
    await expect(provider.generate("prompt")).rejects.toThrow(
      /No Gemini API keys configured/,
    );
  });

  it("calls the detection model with a strict token budget and parses JSON", async () => {
    aiCall.mockResolvedValue('{"mode":"full","reason":"stub"}');
    const provider = new GeminiProvider(CONFIG);

    const result = await provider.detect("# existing");

    expect(result).toEqual({ mode: "full", reason: "stub" });
    expect(aiCall).toHaveBeenCalledWith(
      expect.objectContaining({
        maxOutputTokens: 200,
        temperature: 0,
        maxRetries: 0,
      }),
    );
  });

  it("returns the raw generation text unmodified", async () => {
    aiCall.mockResolvedValue("# Generated README");
    const provider = new GeminiProvider(CONFIG);
    await expect(provider.generate("prompt")).resolves.toBe(
      "# Generated README",
    );
  });

  it("rotates to the next key on a rotatable failure (429) and succeeds", async () => {
    aiCall
      .mockRejectedValueOnce(apiError(429, "quota"))
      .mockResolvedValueOnce("ok");

    const provider = new GeminiProvider(CONFIG);
    await expect(provider.generate("prompt")).resolves.toBe("ok");
    expect(aiCall).toHaveBeenCalledTimes(2);
  });

  it("does not rotate on a non-rotatable failure (400) and throws immediately", async () => {
    aiCall.mockRejectedValueOnce(apiError(400, "bad request"));

    const provider = new GeminiProvider(CONFIG);
    await expect(provider.generate("prompt")).rejects.toThrow();
    expect(aiCall).toHaveBeenCalledTimes(1);
  });

  it("throws a combined error once every key has been exhausted", async () => {
    aiCall
      .mockRejectedValueOnce(apiError(500, "overload"))
      .mockRejectedValueOnce(apiError(503, "overload again"));

    const provider = new GeminiProvider(CONFIG);
    await expect(provider.generate("prompt")).rejects.toThrow(
      /All 2 Gemini API key\(s\) failed/,
    );
    expect(aiCall).toHaveBeenCalledTimes(2);
  });

  it("treats a RetryError's wrapped lastError as the transport failure", async () => {
    const wrapped = new RetryError({
      message: "retries exhausted",
      reason: "maxRetriesExceeded",
      errors: [apiError(429, "quota")],
    });
    aiCall.mockRejectedValueOnce(wrapped).mockResolvedValueOnce("ok");

    const provider = new GeminiProvider(CONFIG);
    await expect(provider.generate("prompt")).resolves.toBe("ok");
  });

  it("reports the correct context token limit", () => {
    expect(new GeminiProvider(CONFIG).getContextTokenLimit()).toBe(1_000_000);
  });
});
