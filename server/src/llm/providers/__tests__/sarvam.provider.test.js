import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const chatCompletions = vi.fn();
vi.mock("sarvamai", () => ({
  SarvamAIClient: vi.fn(function SarvamAIClient() {
    this.chat = { completions: (...args) => chatCompletions(...args) };
  }),
}));

const { SarvamProvider } = await import("../sarvam.provider.js");

function response(content) {
  return { choices: [{ message: { content } }] };
}

describe("SarvamProvider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    chatCompletions.mockReset();
    process.env.SARVAM_API_KEY = "sarvam-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("has no client and throws on any call when no API key is set", async () => {
    delete process.env.SARVAM_API_KEY;
    const provider = new SarvamProvider();
    await expect(provider.generate("prompt")).rejects.toThrow(
      /No Sarvam API key configured/,
    );
  });

  it("returns the completion content on generate()", async () => {
    chatCompletions.mockResolvedValue(response("# README body"));
    const provider = new SarvamProvider();
    await expect(provider.generate("prompt")).resolves.toBe("# README body");
  });

  it("throws when Sarvam returns an empty response", async () => {
    chatCompletions.mockResolvedValue(response(""));
    const provider = new SarvamProvider();
    await expect(provider.generate("prompt")).rejects.toThrow(
      /empty generation response/,
    );
  });

  it("parses JSON from detect()", async () => {
    chatCompletions.mockResolvedValue(
      response('{"mode":"patch","reason":"ok"}'),
    );
    const provider = new SarvamProvider();
    await expect(provider.detect("# existing")).resolves.toEqual({
      mode: "patch",
      reason: "ok",
    });
  });

  it("clamps an oversized existing README before building the detect prompt", async () => {
    chatCompletions.mockResolvedValue(response('{"mode":"full","reason":"x"}'));
    const provider = new SarvamProvider();

    const huge = "x".repeat(200_000);
    await provider.detect(huge);

    const [{ messages }] = chatCompletions.mock.calls[0];
    expect(messages[0].content).toContain(
      "truncated to fit Sarvam's context window",
    );
    expect(messages[0].content.length).toBeLessThan(huge.length);
  });

  it("reports the prompt token budget minus completion reserve", () => {
    const provider = new SarvamProvider();
    expect(provider.getContextTokenLimit()).toBe(32_000 - 8_000);
  });

  it("propagates the underlying client error", async () => {
    chatCompletions.mockRejectedValue(
      Object.assign(new Error("network down"), { statusCode: 503 }),
    );
    const provider = new SarvamProvider();
    await expect(provider.generate("prompt")).rejects.toThrow("network down");
  });
});
