import { describe, it, expect, vi } from "vitest";

vi.mock("../../services/convex.service.js", () => ({
  liveUpdate: vi.fn(),
}));

const {
  formatCommitDiff,
  truncateText,
  validateContext,
  optimizeContext,
  buildProviderPrompt,
  detectReadme,
  generateReadme,
} = await import("../readme.generate.js");

function makeProvider(name, overrides = {}) {
  return {
    getName: () => name,
    getContextTokenLimit: () => Infinity,
    detect: vi.fn(),
    generate: vi.fn(),
    ...overrides,
  };
}

describe("formatCommitDiff", () => {
  it("formats message and grouped file changes", () => {
    const diff = formatCommitDiff({
      message: "fix: bug",
      files: [
        { filename: "a.js", status: "added", additions: 5 },
        { filename: "b.js", status: "modified", additions: 2, deletions: 1 },
        { filename: "c.js", status: "removed" },
        { filename: "e.js", previous_filename: "d.js", status: "renamed" },
      ],
      stats: { additions: 7, deletions: 1 },
    });

    expect(diff).toContain("Commit Message: fix: bug");
    expect(diff).toContain("Added (1):");
    expect(diff).toContain("+ a.js (+5 lines)");
    expect(diff).toContain("Modified (1):");
    expect(diff).toContain("~ b.js (+2/-1 lines)");
    expect(diff).toContain("Removed (1):");
    expect(diff).toContain("- c.js");
    expect(diff).toContain("Renamed (1):");
    expect(diff).toContain("d.js → e.js");
    expect(diff).toContain("Total Changes: +7 -1");
  });

  it("returns empty string when there is nothing to report", () => {
    expect(formatCommitDiff({})).toBe("");
  });
});

describe("truncateText", () => {
  it("returns text unchanged when within the line limit", () => {
    expect(truncateText("a\nb", 5)).toBe("a\nb");
  });

  it("truncates and appends a marker with the dropped line count", () => {
    const text = Array.from({ length: 10 }, (_, i) => `line${i}`).join("\n");
    const result = truncateText(text, 3);
    expect(result).toContain("line0\nline1\nline2");
    expect(result).toContain("... (truncated 7 lines)");
  });

  it("passes through falsy input", () => {
    expect(truncateText("", 5)).toBe("");
    expect(truncateText(null, 5)).toBe(null);
  });
});

describe("validateContext", () => {
  it("requires repoName and repoOwner", () => {
    const result = validateContext({});
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining(["repoName is required", "repoOwner is required"]),
    );
  });

  it("warns when there is no structure or content at all", () => {
    const result = validateContext({ repoName: "r", repoOwner: "o" });
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        "repoStructure is missing - README may lack context",
        "No codebase context, commit diff, or changed files - README may lack detail",
      ]),
    );
  });

  it("is valid and warning-free with structure and full codebase content", () => {
    const result = validateContext({
      repoName: "r",
      repoOwner: "o",
      repoStructure: "tree",
      fullCodebase: [{ path: "a.js", content: "x" }],
    });
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual([]);
    expect(result.hasFullCodebase).toBe(true);
  });
});

describe("optimizeContext", () => {
  it("returns the context unchanged when already under budget", () => {
    const context = { fullCodebase: [], changedFiles: [] };
    expect(optimizeContext(context, 10)).toBe(context);
  });

  it("truncates fullCodebase file contents before dropping files", () => {
    const bigFile = {
      path: "big.js",
      content: Array.from({ length: 1000 }, (_, i) => `line${i}`).join("\n"),
    };
    const context = {
      fullCodebase: [bigFile],
      changedFiles: [],
      repoStructure: "",
      existingReadme: "",
      commitDiff: "",
    };

    const optimized = optimizeContext(context, 200);
    expect(optimized.fullCodebase[0].content.length).toBeLessThan(
      bigFile.content.length,
    );
  });

  it("eventually empties fullCodebase for an extremely tight budget", () => {
    const context = {
      fullCodebase: Array.from({ length: 100 }, (_, i) => ({
        path: `f${i}.js`,
        content: "x".repeat(2000),
      })),
      changedFiles: [{ path: "c.js", content: "y".repeat(2000) }],
      repoStructure: "s".repeat(2000),
      existingReadme: "r".repeat(2000),
      commitDiff: "d".repeat(2000),
    };

    const optimized = optimizeContext(context, 50);
    expect(optimized.fullCodebase).toEqual([]);
  });
});

describe("buildProviderPrompt", () => {
  it("returns the untrimmed prompt when it already fits the provider's window", () => {
    const provider = makeProvider("Gemini");
    const result = buildProviderPrompt({
      provider,
      context: { a: 1 },
      buildPrompt: (ctx) => `prompt:${JSON.stringify(ctx)}`,
    });
    expect(result.trimmed).toBe(false);
    expect(result.prompt).toBe('prompt:{"a":1}');
  });

  it("optimizes the context down to the provider's budget when it doesn't fit", () => {
    const provider = makeProvider("Sarvam", { getContextTokenLimit: () => 10 });
    const optimize = vi.fn((ctx) => ({ ...ctx, trimmed: true }));
    const buildPrompt = (ctx) => JSON.stringify(ctx);

    const result = buildProviderPrompt({
      provider,
      context: { text: "x".repeat(500) },
      buildPrompt,
      optimize,
    });

    expect(optimize).toHaveBeenCalled();
    expect(result.trimmed).toBe(true);
    expect(JSON.parse(result.prompt).trimmed).toBe(true);
  });
});

describe("detectReadme", () => {
  it("returns full mode immediately when there is no existing README", async () => {
    const provider = makeProvider("Gemini");
    const result = await detectReadme({
      existingReadme: "",
      provider,
      fallBackProvider: makeProvider("Sarvam"),
    });
    expect(result.mode).toBe("full");
    expect(provider.detect).not.toHaveBeenCalled();
  });

  it("uses the primary provider's detection result", async () => {
    const provider = makeProvider("Gemini", {
      detect: vi
        .fn()
        .mockResolvedValue({ mode: "patch", reason: "small change" }),
    });
    const result = await detectReadme({
      existingReadme: "# Existing",
      provider,
      fallBackProvider: makeProvider("Sarvam"),
    });
    expect(result).toEqual({ mode: "patch", reason: "small change" });
  });

  it("falls back to the secondary provider when the primary detect() throws", async () => {
    const provider = makeProvider("Gemini", {
      detect: vi.fn().mockRejectedValue(new Error("quota exceeded")),
    });
    const fallBackProvider = makeProvider("Sarvam", {
      detect: vi.fn().mockResolvedValue({ mode: "full", reason: "fallback" }),
    });

    const result = await detectReadme({
      existingReadme: "# Existing",
      provider,
      fallBackProvider,
    });

    expect(fallBackProvider.detect).toHaveBeenCalledWith("# Existing");
    expect(result).toEqual({ mode: "full", reason: "fallback" });
  });
});

describe("generateReadme", () => {
  const baseArgs = {
    repoName: "repo",
    repoOwner: "owner",
    repoStructure: "tree",
    fullCodebase: [{ path: "a.js", content: "console.log(1)" }],
    changedFilesContent: [],
  };

  it("throws when required context is missing", async () => {
    await expect(
      generateReadme({
        provider: makeProvider("Gemini"),
        fallBackProvider: makeProvider("Sarvam"),
      }),
    ).rejects.toThrow(/Invalid context/);
  });

  it("returns the primary provider's README when generation succeeds", async () => {
    const provider = makeProvider("Gemini", {
      generate: vi.fn().mockResolvedValue("# Repo\n\nBody"),
    });
    const readme = await generateReadme({
      ...baseArgs,
      provider,
      fallBackProvider: makeProvider("Sarvam"),
    });
    expect(readme).toBe("# Repo\n\nBody");
  });

  it("falls back when the primary provider's generate() throws", async () => {
    const provider = makeProvider("Gemini", {
      generate: vi.fn().mockRejectedValue(new Error("down")),
    });
    const fallBackProvider = makeProvider("Sarvam", {
      generate: vi.fn().mockResolvedValue("# Repo\n\nFallback body"),
    });

    const readme = await generateReadme({
      ...baseArgs,
      provider,
      fallBackProvider,
    });

    expect(readme).toBe("# Repo\n\nFallback body");
  });

  it("rejects a generated README missing a top-level heading", async () => {
    const provider = makeProvider("Gemini", {
      generate: vi.fn().mockResolvedValue("Not a heading"),
    });
    await expect(
      generateReadme({
        ...baseArgs,
        provider,
        fallBackProvider: makeProvider("Sarvam"),
      }),
    ).rejects.toThrow(/missing a top-level heading/);
  });
});
