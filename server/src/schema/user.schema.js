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
  },
  { timestamps: true },
);

const User = model("User", userSchema);

export default User;
