const geminiConfig = {
  detectionModel: "gemini-3.5-flash-lite",
  generationModel: "gemini-3.6-flash",
  cleanupModel: "gemini-3.6-flash",
};

export const createProvidersInstances = (
  providerPriority,
  GeminiProvider,
  SarvamProvider,
) => {
  if (!providerPriority) {
    return [
      new GeminiProvider(geminiConfig),
      new SarvamProvider(),
    ];
  }

  return providerPriority.map((provider) => {
    switch (provider) {
      case "gemini":
        return new GeminiProvider(geminiConfig);

      case "sarvam":
        return new SarvamProvider();

      default:
        throw new Error(`Provider ${provider} is not supported`);
    }
  });
};