import { describe, it, expect } from "vitest";
import { getLanguageFromExtension } from "../langMap.js";

describe("getLanguageFromExtension", () => {
  it("maps a known extension to its language", () => {
    expect(getLanguageFromExtension("index.ts")).toBe("typescript");
    expect(getLanguageFromExtension("src/App.jsx")).toBe("jsx");
  });

  it("is case-insensitive on the extension", () => {
    expect(getLanguageFromExtension("Readme.MD")).toBe("markdown");
  });

  it("falls back to the raw extension when unmapped", () => {
    expect(getLanguageFromExtension("data.xyz")).toBe("xyz");
  });

  it("returns the basename for a file with no extension", () => {
    expect(getLanguageFromExtension("Makefile")).toBe("makefile");
    expect(getLanguageFromExtension("noext")).toBe("noext");
  });
});
