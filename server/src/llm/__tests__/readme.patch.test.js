import { describe, it, expect, vi } from "vitest";

vi.mock("../../services/convex.service.js", () => ({
  liveUpdate: vi.fn(),
}));

const {
  validatePatchContext,
  optimizePatchContext,
  parsePatchResponse,
  patchReadme,
} = await import("../readme.patch.js");

function makeProvider(name, overrides = {}) {
  return {
    getName: () => name,
    getContextTokenLimit: () => Infinity,
    generate: vi.fn(),
    ...overrides,
  };
}

const README = [
  "# Title",
  "intro",
  "## Install",
  "npm i",
  "## License",
  "MIT",
].join("\n");

describe("validatePatchContext", () => {
  it("requires repoName, repoOwner, and at least one patchable section", () => {
    const result = validatePatchContext({
      repoName: "",
      repoOwner: "",
      sections: [],
      changedFiles: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "repoName is required",
        "repoOwner is required",
        "Existing README has no patchable sections",
      ]),
    );
  });

  it("warns but stays valid with sections and no diff/structure", () => {
    const result = validatePatchContext({
      repoName: "r",
      repoOwner: "o",
      sections: [{ name: "Install", heading: "## Install", content: "x" }],
      changedFiles: [],
      commitDiff: null,
    });
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("optimizePatchContext", () => {
  it("returns context unchanged when under budget", () => {
    const context = { changedFiles: [], sections: [] };
    expect(optimizePatchContext(context, 1000)).toBe(context);
  });

  it("truncates changed-file content before dropping sections", () => {
    const bigContent = Array.from({ length: 300 }, (_, i) => `line${i}`).join(
      "\n",
    );
    const context = {
      changedFiles: [{ path: "a.js", content: bigContent }],
      sections: [{ name: "Install", content: "keep me" }],
      repoStructure: "tree",
      commitDiff: "diff",
    };

    const optimized = optimizePatchContext(context, 150);
    expect(optimized.changedFiles[0].content.length).toBeLessThan(
      bigContent.length,
    );
  });
});

describe("parsePatchResponse", () => {
  const sections = {
    Install: "## Install\nold",
    Usage: "## Usage\nold",
  };
  const editableKeys = ["Install", "Usage"];

  it("throws on malformed JSON", () => {
    expect(() =>
      parsePatchResponse("not json", { sections, editableKeys }),
    ).toThrow(/malformed patch JSON/);
  });

  it("throws when the updates array is missing", () => {
    expect(() => parsePatchResponse("{}", { sections, editableKeys })).toThrow(
      /missing an "updates" array/,
    );
  });

  it("throws when a section is not editable", () => {
    const response = JSON.stringify({
      updates: [{ section: "License", content: "## License\nnew" }],
    });
    expect(() =>
      parsePatchResponse(response, { sections, editableKeys }),
    ).toThrow(/cannot be patched/);
  });

  it("skips empty-content updates instead of failing", () => {
    const response = JSON.stringify({
      updates: [{ section: "Install", content: "   " }],
    });
    const patches = parsePatchResponse(response, { sections, editableKeys });
    expect(patches).toEqual({});
  });

  it("re-anchors a replacement to the original heading level", () => {
    const response = JSON.stringify({
      updates: [{ section: "Install", content: "# Install\nnew content" }],
    });
    const patches = parsePatchResponse(response, { sections, editableKeys });
    expect(patches.Install).toBe("## Install\nnew content");
  });

  it("rejects a replacement headed with the wrong section name", () => {
    const response = JSON.stringify({
      updates: [{ section: "Install", content: "## Wrong Name\nnew" }],
    });
    expect(() =>
      parsePatchResponse(response, { sections, editableKeys }),
    ).toThrow(/headed "Wrong Name"/);
  });

  it("rejects duplicate updates for the same section", () => {
    const response = JSON.stringify({
      updates: [
        { section: "Install", content: "## Install\nfirst" },
        { section: "Install", content: "## Install\nsecond" },
      ],
    });
    expect(() =>
      parsePatchResponse(response, { sections, editableKeys }),
    ).toThrow(/duplicate updates/);
  });
});

describe("patchReadme", () => {
  const baseArgs = {
    repoName: "repo",
    repoOwner: "owner",
    repoStructure: "tree",
    changedFilesContent: [{ path: "install.md", content: "npm i" }],
    commitData: { message: "docs: update install steps" },
  };

  it("throws when there is no existing README to patch", async () => {
    await expect(
      patchReadme({
        ...baseArgs,
        existingReadme: "",
        provider: makeProvider("Gemini"),
      }),
    ).rejects.toThrow(/requires an existing README/);
  });

  it("skips the run when the model returns no section updates", async () => {
    const provider = makeProvider("Gemini", {
      generate: vi.fn().mockResolvedValue(JSON.stringify({ updates: [] })),
    });

    const result = await patchReadme({
      ...baseArgs,
      existingReadme: README,
      provider,
      fallBackProvider: makeProvider("Sarvam"),
    });

    expect(result).toEqual({
      skipped: true,
      reason: "AI returned no section updates",
    });
  });

  it("applies a valid patch and merges it back into the README", async () => {
    const provider = makeProvider("Gemini", {
      generate: vi.fn().mockResolvedValue(
        JSON.stringify({
          updates: [{ section: "Install", content: "## Install\nnpm ci" }],
        }),
      ),
    });

    const result = await patchReadme({
      ...baseArgs,
      existingReadme: README,
      provider,
      fallBackProvider: makeProvider("Sarvam"),
    });

    expect(result.skipped).toBe(false);
    expect(result.readme).toContain("## Install\nnpm ci");
    expect(result.readme).toContain("## License\nMIT");
  });

  it("rejects a patch that touches the forbidden License section", async () => {
    const provider = makeProvider("Gemini", {
      generate: vi.fn().mockResolvedValue(
        JSON.stringify({
          updates: [{ section: "License", content: "## License\nApache" }],
        }),
      ),
    });

    // License is forbidden, so parsePatchResponse rejects it before
    // validatePatches ever runs — the whole call rejects.
    await expect(
      patchReadme({
        ...baseArgs,
        existingReadme: README,
        provider,
        fallBackProvider: makeProvider("Sarvam"),
      }),
    ).rejects.toThrow(/cannot be patched/);
  });

  it("falls back to the secondary provider when the primary generate() throws", async () => {
    const provider = makeProvider("Gemini", {
      generate: vi.fn().mockRejectedValue(new Error("quota exceeded")),
    });
    const fallBackProvider = makeProvider("Sarvam", {
      generate: vi.fn().mockResolvedValue(
        JSON.stringify({
          updates: [{ section: "Install", content: "## Install\nyarn" }],
        }),
      ),
    });

    const result = await patchReadme({
      ...baseArgs,
      existingReadme: README,
      provider,
      fallBackProvider,
    });

    expect(fallBackProvider.generate).toHaveBeenCalled();
    expect(result.readme).toContain("## Install\nyarn");
  });
});
