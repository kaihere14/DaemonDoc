import { Schema, model } from "mongoose";

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

    // Subscription / plan fields
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    reviewLimit: { type: Number, default: 1 },
    competitorLimit: { type: Number, default: 1 },
    activeRepoLimit: { type: Number, default: 5 },
    planExpiry: { type: Date, default: null },

    // Monthly usage tracking — resets every 30 days from usagePeriodStart
    reviewsUsed: { type: Number, default: 0 },
    competitorAnalysesUsed: { type: Number, default: 0 },
    // The date the current usage period started (set on plan activation,
    // then rolled forward by 30 days each time a reset happens)
    usagePeriodStart: { type: Date, default: null },

    // Set to true once repos were auto-deactivated due to free plan limit
    // Used to show a one-time dashboard notification
    reposDeactivatedNotification: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const User = model("User", userSchema);

export default User;
