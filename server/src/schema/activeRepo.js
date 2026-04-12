import { Schema, model } from "mongoose";

const activeRepoSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    repoId: { type: Number, required: true },
    repoName: { type: String, required: true },
    repoFullName: { type: String, required: true },
    repoOwner: { type: String, required: true },
    defaultBranch: { type: String, required: true },

    active: { type: Boolean, default: true },
    lastProcessedSha: { type: String, default: null },

    webhookId: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now },

    lastReadmeGeneratedAt: { type: Date, default: null },
    readmeGenerationCount: { type: Number, default: 0 },
    lastReadmeSha: { type: String, default: null },

    sectionHashes: { type: Schema.Types.Mixed, default: {} },
    lastSectionHashesUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const ActiveRepo = model("ActiveRepo", activeRepoSchema);

export default ActiveRepo;
