import { describe, it, expect } from "vitest";
import { createProvidersInstances } from "../object-creator.js";

class FakeGemini {
  constructor(config) {
    this.config = config;
    this.name = "Gemini";
  }
}
class FakeSarvam {
  constructor() {
    this.name = "Sarvam";
  }
}

describe("createProvidersInstances", () => {
  it("defaults to [Gemini, Sarvam] when no priority is given", () => {
    const providers = createProvidersInstances(null, FakeGemini, FakeSarvam);
    expect(providers.map((p) => p.name)).toEqual(["Gemini", "Sarvam"]);
    expect(providers[0]).toBeInstanceOf(FakeGemini);
    expect(providers[1]).toBeInstanceOf(FakeSarvam);
  });

  it("honors an explicit provider order", () => {
    const providers = createProvidersInstances(
      ["sarvam", "gemini"],
      FakeGemini,
      FakeSarvam,
    );
    expect(providers.map((p) => p.name)).toEqual(["Sarvam", "Gemini"]);
  });

  it("supports a single-provider priority list", () => {
    const providers = createProvidersInstances(
      ["gemini"],
      FakeGemini,
      FakeSarvam,
    );
    expect(providers).toHaveLength(1);
    expect(providers[0]).toBeInstanceOf(FakeGemini);
  });

  it("throws for an unsupported provider name", () => {
    expect(() =>
      createProvidersInstances(["openai"], FakeGemini, FakeSarvam),
    ).toThrow(/not supported/);
  });

  it("passes a model config object into the Gemini constructor", () => {
    const providers = createProvidersInstances(
      ["gemini"],
      FakeGemini,
      FakeSarvam,
    );
    expect(providers[0].config).toMatchObject({
      detectionModel: expect.any(String),
      generationModel: expect.any(String),
      cleanupModel: expect.any(String),
    });
  });
});
