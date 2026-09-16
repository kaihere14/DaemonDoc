import { describe, it, expect } from "vitest";
import {
  parseReadmeSections,
  hashSections,
  mergePatchedSections,
} from "../readme.parser.js";

describe("parseReadmeSections", () => {
  it("returns empty state for empty content", () => {
    expect(parseReadmeSections("")).toEqual({ sections: {}, orderedKeys: [] });
    expect(parseReadmeSections(null)).toEqual({
      sections: {},
      orderedKeys: [],
    });
  });

  it("buckets preamble content before the first heading", () => {
    const { sections, orderedKeys } = parseReadmeSections(
      "some intro text\n# Title\nbody",
    );
    expect(orderedKeys[0]).toBe("__preamble__");
    expect(sections.__preamble__).toBe("some intro text");
  });

  it("splits on H1 and H2 headings, keeping the heading line in its section", () => {
    const content = "# Title\nintro\n## Install\nnpm i\n## Usage\nrun it";
    const { sections, orderedKeys } = parseReadmeSections(content);

    expect(orderedKeys).toEqual(["__preamble__", "Title", "Install", "Usage"]);
    expect(sections.Title).toBe("# Title\nintro");
    expect(sections.Install).toBe("## Install\nnpm i");
    expect(sections.Usage).toBe("## Usage\nrun it");
  });

  it("ignores H3+ headings as section boundaries", () => {
    const { orderedKeys } = parseReadmeSections(
      "# Title\n### Sub heading\ntext",
    );
    expect(orderedKeys).toEqual(["__preamble__", "Title"]);
  });
});

describe("hashSections", () => {
  it("hashes each section independently and deterministically", () => {
    const hashes = hashSections({ a: "hello", b: "world" });
    expect(hashes.a).toBe(hashSections({ a: "hello" }).a);
    expect(hashes.a).not.toBe(hashes.b);
    expect(hashes.a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("treats nullish content as empty string", () => {
    expect(hashSections({ a: null }).a).toBe(hashSections({ a: "" }).a);
  });
});

describe("mergePatchedSections", () => {
  const original = {
    __preamble__: "",
    Title: "# Title",
    Install: "## Install\nold",
    Usage: "## Usage\nold",
  };
  const orderedKeys = ["__preamble__", "Title", "Install", "Usage"];

  it("keeps original content for keys with no patch", () => {
    const result = mergePatchedSections(original, orderedKeys, {
      Install: "## Install\nnew",
    });
    // original.__preamble__ is "" (not null), so it still contributes an
    // empty part and a leading separator.
    expect(result).toBe("\n# Title\n## Install\nnew\n## Usage\nold");
  });

  it("drops sections whose content is null/undefined", () => {
    const withEmptyPreamble = { ...original, __preamble__: null };
    const result = mergePatchedSections(withEmptyPreamble, orderedKeys, {});
    expect(result.startsWith("# Title")).toBe(true);
  });

  it("is a no-op merge when patches is empty", () => {
    const result = mergePatchedSections(original, orderedKeys, {});
    expect(result).toBe("\n# Title\n## Install\nold\n## Usage\nold");
  });
});
