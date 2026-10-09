import { Schema, model } from "mongoose";

// Every LLM provider the generation pipeline knows how to instantiate. A user's
// llmProviderPriority is always a full ordering of exactly these values.
export const SUPPORTED_LLM_PROVIDERS = ["gemini", "sarvam"];
export const SUPPORTED_COMMIT_TYPES = ["direct", "pull-request"];

const userSchema = new Schema(
  {
    githubId: { type: String, unique: true, sparse: true },
    githubUsername: { type: String },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    autoReadmeEnabled: { type: Boolean, default: true },
    avatarUrl: { type: String },
    emailNotificationsEnabled: { type: Boolean, default: true },
    admin: { type: Boolean, default: false },
    githubAccessToken: {
      iv: { type: String, required: true },
      content: { type: String, required: true },
      tag: { type: String, required: true },
    },
    llmProviderPriority: {
      type: [
        {
          type: String,
          enum: SUPPORTED_LLM_PROVIDERS,
        },
      ],
      default: () => [...SUPPORTED_LLM_PROVIDERS],
    },
    preferredCommitType: {
      type: String,
      enum: SUPPORTED_COMMIT_TYPES,
      default: "direct",
    },
    // First-run checklist. Only accounts created after it shipped get a
    // startedAt, so existing users never see onboarding for an app they know.
    onboarding: {
      startedAt: { type: Date, default: null },
      commitTypeConfirmedAt: { type: Date, default: null },
      snoozedAt: { type: Date, default: null },
      dismissedAt: { type: Date, default: null },
      completedAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

const User = model("User", userSchema);

export default User;
