import { aiCall } from "../ai.sdk.js";
import { buildDetectPrompt } from "../prompts/detect.prompt.js";
import { extractJson } from "../utils/response.js";

export class GeminiProvider {
  constructor({ detectionModel, generationModel }) {
    this.detectionModel = detectionModel;
    this.generationModel = generationModel;
  }

  // Small model, tight budget — just picks full/patch mode.
  async detect(existingReadme) {
    const response = await aiCall({
      model: this.detectionModel,
      prompt: buildDetectPrompt(existingReadme),
      temperature: 0,
      maxOutputTokens: 200,
    });

    return extractJson(response);
  }

  // Main model — free-form README generation, no JSON parsing here.
  async generate(prompt) {
    return aiCall({
      model: this.generationModel,
      prompt,
      temperature: 0,
    });
  }
}
