import { describe, it, expect } from "vitest";
import { extractJson } from "../response.js";

describe("extractJson", () => {
  it("parses plain JSON", () => {
    expect(extractJson('{"mode":"full"}')).toEqual({ mode: "full" });
  });

  it("strips a ```json fenced code block", () => {
    const text = '```json\n{"mode":"patch"}\n```';
    expect(extractJson(text)).toEqual({ mode: "patch" });
  });

  it("strips a bare ``` fenced code block", () => {
    const text = '```\n{"mode":"patch"}\n```';
    expect(extractJson(text)).toEqual({ mode: "patch" });
  });

  it("trims surrounding whitespace", () => {
    expect(extractJson('  {"a":1}  \n')).toEqual({ a: 1 });
  });

  it("throws on invalid JSON", () => {
    expect(() => extractJson("not json")).toThrow();
  });
});
