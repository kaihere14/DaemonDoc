import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../services/convex.service.js", () => ({
  liveUpdate: vi.fn(),
}));

const detectReadme = vi.fn();
const generateReadme = vi.fn();
vi.mock("../readme.generate.js", () => ({
  detectReadme: (...args) => detectReadme(...args),
  generateReadme: (...args) => generateReadme(...args),
}));

const patchReadme = vi.fn();
vi.mock("../readme.patch.js", () => ({
  patchReadme: (...args) => patchReadme(...args),
}));

function makeProvider(name) {
  return { getName: () => name };
}

const gemini = makeProvider("Gemini");
const sarvam = makeProvider("Sarvam");
const createProvidersInstances = vi.fn(() => [gemini, sarvam]);
vi.mock("../utils/object-creator.js", () => ({
  createProvidersInstances: (...args) => createProvidersInstances(...args),
}));

const { LlmService } = await import("../llm.service.js");

describe("LlmService.generate", () => {
  beforeEach(() => {
    detectReadme.mockReset();
    generateReadme.mockReset();
    patchReadme.mockReset();
    createProvidersInstances.mockClear();
  });

  it("runs the full pipeline when detection selects full mode", async () => {
    detectReadme.mockResolvedValue({ mode: "full", reason: "no readme" });
    generateReadme.mockResolvedValue("# New README");

    const service = new LlmService();
    const result = await service.generate({ repoName: "r", repoOwner: "o" });

    expect(generateReadme).toHaveBeenCalledWith(
      expect.objectContaining({ provider: gemini, fallBackProvider: sarvam }),
    );
    expect(patchReadme).not.toHaveBeenCalled();
    expect(result).toEqual({
      skipped: false,
      readme: "# New README",
      mode: "full",
    });
  });

  it("runs the patch pipeline when detection selects patch mode", async () => {
    detectReadme.mockResolvedValue({ mode: "patch", reason: "small change" });
    patchReadme.mockResolvedValue({ skipped: false, readme: "# Patched" });

    const service = new LlmService();
    const result = await service.generate({ repoName: "r", repoOwner: "o" });

    expect(patchReadme).toHaveBeenCalled();
    expect(generateReadme).not.toHaveBeenCalled();
    expect(result).toEqual({
      skipped: false,
      readme: "# Patched",
      mode: "patch",
    });
  });

  it("throws for an unrecognized detection mode", async () => {
    detectReadme.mockResolvedValue({ mode: "unknown" });
    const service = new LlmService();
    await expect(
      service.generate({ repoName: "r", repoOwner: "o" }),
    ).rejects.toThrow(/Unknown generation mode/);
  });

  it("passes providersPriority through to the provider factory", async () => {
    detectReadme.mockResolvedValue({ mode: "full" });
    generateReadme.mockResolvedValue("# ok");

    const service = new LlmService();
    await service.generate({
      repoName: "r",
      repoOwner: "o",
      providersPriority: ["sarvam", "gemini"],
    });

    expect(createProvidersInstances).toHaveBeenCalledWith(
      ["sarvam", "gemini"],
      expect.any(Function),
      expect.any(Function),
    );
  });
});

describe("LlmService.cleanup", () => {
  beforeEach(() => {
    createProvidersInstances.mockClear();
  });

  it("uses the primary provider's cleanup() result", async () => {
    const primary = {
      getName: () => "Gemini",
      cleanup: vi.fn().mockResolvedValue("clean"),
    };
    const fallback = { getName: () => "Sarvam", cleanup: vi.fn() };
    createProvidersInstances.mockReturnValueOnce([primary, fallback]);

    const service = new LlmService();
    await expect(service.cleanup("# readme", "log-1")).resolves.toBe("clean");
    expect(fallback.cleanup).not.toHaveBeenCalled();
  });

  it("falls back to the secondary provider when primary cleanup() throws", async () => {
    const primary = {
      getName: () => "Gemini",
      cleanup: vi.fn().mockRejectedValue(new Error("down")),
    };
    const fallback = {
      getName: () => "Sarvam",
      cleanup: vi.fn().mockResolvedValue("fallback clean"),
    };
    createProvidersInstances.mockReturnValueOnce([primary, fallback]);

    const service = new LlmService();
    await expect(service.cleanup("# readme", "log-1")).resolves.toBe(
      "fallback clean",
    );
  });

  it("re-throws when the provider factory itself fails", async () => {
    createProvidersInstances.mockImplementationOnce(() => {
      throw new Error("bad priority");
    });

    const service = new LlmService();
    await expect(service.cleanup("# readme", "log-1")).rejects.toThrow(
      "bad priority",
    );
  });
});
