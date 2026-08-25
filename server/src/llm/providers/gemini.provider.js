import { aiCall } from "../ai.sdk.js";
import { buildDetectPrompt } from "../prompts/detect.prompt.js";
import { extractJson } from "../utils/response.js";

export class GeminiProvider {
  constructor({ detectionModel, generationModel }) {
    this.detectionModel = detectionModel;
    this.generationModel = generationModel;
  }

  async detect(existingReadme) {
    const response = await aiCall({
      model: this.detectionModel,
      prompt: buildDetectPrompt(existingReadme),
      constraints: {
        temperature: 0,
        responseFormat: "json",
        maxOutputTokens: 200,
      },
    });

    return extractJson(response);
  }

  async generate(prompt) {
    return aiCall({
      model: this.generationModel,
      prompt,
      constraints: {
        temperature: 0,
        responseFormat: "json",
        maxOutputTokens: 200,
      },
    });
  }
}
