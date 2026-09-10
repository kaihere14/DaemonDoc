import { Schema, model } from "mongoose";
import { SUPPORTED_LLM_PROVIDERS } from "./user.schema.js";

// Display metadata for the LLM providers the generation pipeline supports. The
// set of provider ids is the same one enforced on user.llmProviderPriority;
// this collection only adds a human name and a logo for the settings UI.
const providerSchema = new Schema(
  {
    providerId: {
      type: String,
      required: true,
      unique: true,
      enum: SUPPORTED_LLM_PROVIDERS,
    },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Provider = model("Provider", providerSchema);

export default Provider;
