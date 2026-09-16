import { describe, it, expect } from "vitest";
import { validatePatches, FORBIDDEN_SECTIONS } from "../readme.validator.js";

const originalSections = {
  __preamble__: "",
  License: "## License\nMIT",
  Install: "## Install\nold",
  Usage: "## Usage\nold",
};

describe("validatePatches", () => {
  it("rejects a non-object patches payload", () => {
    expect(validatePatches({ originalSections, patches: null }).decision).toBe(
      "retry",
    );
    expect(validatePatches({ originalSections, patches: ["a"] }).decision).toBe(
      "retry",
    );
  });

  it("rejects edits to forbidden sections", () => {
    for (const section of FORBIDDEN_SECTIONS) {
      const result = validatePatches({
        originalSections,
        patches: { [section]: "anything" },
      });
      expect(result.decision).toBe("retry");
      expect(result.reason).toMatch(/Forbidden section/);
    }
  });

  it("rejects a patch key that doesn't exist in the original README", () => {
    const result = validatePatches({
      originalSections,
      patches: { Roadmap: "## Roadmap\nnew" },
    });
    expect(result.decision).toBe("retry");
    expect(result.reason).toMatch(/invented new section/);
  });

  it("rejects known hallucination phrases, case-insensitively", () => {
    const result = validatePatches({
      originalSections,
      patches: { Install: "As an AI language model, I cannot do that." },
    });
    expect(result.decision).toBe("retry");
    expect(result.reason).toMatch(/Hallucination phrase/);
  });

  it("commits a clean patch touching only real, non-forbidden sections", () => {
    const result = validatePatches({
      originalSections,
      patches: { Install: "## Install\nnpm i", Usage: "## Usage\nnpm start" },
    });
    expect(result).toEqual({
      decision: "commit",
      reason: "All validation checks passed",
      details: null,
    });
  });
});
