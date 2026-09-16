import { describe, it, expect } from "vitest";
import {
  basenameOf,
  extensionOf,
  depthOf,
  isIgnoredPath,
  isLockfile,
  isSourceFile,
  isScannable,
  selectImportantFiles,
} from "../scan.filters.js";

describe("basenameOf", () => {
  it("returns the last path segment", () => {
    expect(basenameOf("src/utils/foo.js")).toBe("foo.js");
    expect(basenameOf("foo.js")).toBe("foo.js");
  });
});

describe("extensionOf", () => {
  it("lowercases the extension", () => {
    expect(extensionOf("src/Foo.TS")).toBe("ts");
  });

  it("returns empty string for dotfiles and no-extension names", () => {
    expect(extensionOf(".env")).toBe("");
    expect(extensionOf("Makefile")).toBe("");
  });
});

describe("depthOf", () => {
  it("counts path separators", () => {
    expect(depthOf("a.js")).toBe(0);
    expect(depthOf("src/a.js")).toBe(1);
    expect(depthOf("src/lib/a.js")).toBe(2);
  });
});

describe("isIgnoredPath", () => {
  it("flags root-anchored junk directories", () => {
    expect(isIgnoredPath("node_modules/foo/index.js")).toBe(true);
    expect(isIgnoredPath("dist/bundle.js")).toBe(true);
  });

  it("does not flag a similarly named source directory", () => {
    expect(isIgnoredPath("src/node_modules_helper.js")).toBe(false);
  });
});

describe("isLockfile", () => {
  it("matches known lockfile basenames only", () => {
    expect(isLockfile("pnpm-lock.yaml")).toBe(true);
    expect(isLockfile("src/pnpm-lock.yaml")).toBe(true);
    expect(isLockfile("package.json")).toBe(false);
  });
});

describe("isSourceFile / isScannable", () => {
  it("treats source extensions as source files", () => {
    expect(isSourceFile("main.go")).toBe(true);
    expect(isSourceFile("README.md")).toBe(false);
  });

  it("treats config/doc extensions as scannable but not source", () => {
    expect(isScannable("package.json")).toBe(true);
    expect(isSourceFile("package.json")).toBe(false);
  });

  it("excludes ignored paths and lockfiles from scannable", () => {
    expect(isScannable("node_modules/pkg/index.js")).toBe(false);
    expect(isScannable("pnpm-lock.yaml")).toBe(false);
  });
});

describe("selectImportantFiles", () => {
  it("ranks curated manifests and conventional-dir source above deep matches", () => {
    const tree = [
      { path: "deep/a/b/c/util.js", type: "blob" },
      { path: "package.json", type: "blob" },
      { path: "src/index.js", type: "blob" },
      { path: "node_modules/x/index.js", type: "blob" },
      { path: "pnpm-lock.yaml", type: "blob" },
    ];

    const result = selectImportantFiles(tree, 10);

    expect(result).toContain("package.json");
    expect(result).toContain("src/index.js");
    expect(result).not.toContain("node_modules/x/index.js");
    expect(result).not.toContain("pnpm-lock.yaml");
    expect(result.indexOf("package.json")).toBeLessThan(
      result.indexOf("deep/a/b/c/util.js"),
    );
  });

  it("respects the limit and never drops a path once chosen", () => {
    const tree = Array.from({ length: 20 }, (_, i) => ({
      path: `src/file${i}.js`,
      type: "blob",
    }));

    const result = selectImportantFiles(tree, 5);
    expect(result).toHaveLength(5);
  });

  it("ignores tree entries that are not blobs", () => {
    const tree = [
      { path: "src", type: "tree" },
      { path: "src/index.js", type: "blob" },
    ];
    expect(selectImportantFiles(tree)).toEqual(["src/index.js"]);
  });
});
