import { Schema, model } from "mongoose";

const UserLogSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    repoName: {
      type: String,
      required: true,
    },

    repoOwner: {
      type: String,
      required: false,
    },

    commitId: {
      type: String,
      required: false,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "README_GENERATION_STARTED",
        "README_GENERATION_SUCCESS",
        "README_GENERATION_FAILED",
        "GITHUB_REPO_CONNECTED",
        "GITHUB_AUTH_FAILED",
        "README_COMMIT_PUSHED",
      ],
    },

    status: {
      type: String,
      enum: ["success", "failed", "ongoing"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

const UserLogModel = model("UserLog", UserLogSchema);
export default UserLogModel;
