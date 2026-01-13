import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../schema/user.schema.js";
import crypto from "node:crypto";
import ActiveRepo from "../schema/activeRepo.js";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.GITHUB_TOKEN_SECRET, "hex");

export function encrypt(text) {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(encrypted.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const githubAuthRedirect = (req, res) => {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  const authUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${githubClientId}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=repo read:user user:email`;
  res.redirect(authUrl);
};

export const githubCallBack = async (req, res) => {
  const authCode = req.query.code;
  let user;
  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        code: authCode,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    const userInfoRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo = userInfoRes.data;

    let user;
    try {
      const result = await createOAuthUser(userInfo, accessToken);
      user = result.user;
    } catch (error) {
      console.error("Error creating OAuth user:", error);
      return res
        .status(500)
        .json({ message: "Error creating OAuth user", error: error.message });
    }

    if (!user || !user._id) {
      console.error("User creation failed: user object is invalid");
      return res
        .status(500)
        .json({ message: "Failed to create or retrieve user" });
    }

    let accessTokenJWT;
    try {
      accessTokenJWT = generateAccessToken(user._id.toString());
    } catch (error) {
      return res.status(500).json({ message: "Error generating JWT", error });
    }

    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success#accessToken=${accessTokenJWT}`;
    res.redirect(302, redirectUrl);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during github OAuth callback", error });
  }
};

export const createOAuthUser = async (profile, access_token) => {
  let user = await User.findOne({ githubUsername: profile.login });
  if (!user) {
    user = new User({
      githubId: profile.id,
      githubUsername: profile.login,
      avatarUrl: profile.avatar_url,
      githubAccessToken: encrypt(access_token),
    });
    await user.save();
  } else {
    console.log("User already exists. Updating access token.");
    user.githubAccessToken = encrypt(access_token);
    await user.save();
  }

  return { user };
};

export const verifyUser = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).select("-__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Verify user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

export const deleteAccount = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const accessToken = decrypt(user.githubAccessToken);
    const activeRepos = await ActiveRepo.find({ userId });

    // Delete webhooks - ignore 404 errors as the webhook may already be deleted
    for (const repo of activeRepos) {
      try {
        await axios.delete(
          `https://api.github.com/repos/${repo.repoOwner}/${repo.repoName}/hooks/${repo.webhookId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github+json",
            },
          }
        );
      } catch (webhookError) {
        // Ignore 404 errors - webhook may have already been deleted
        if (webhookError.response?.status !== 404) {
          console.warn(
            `Failed to delete webhook for ${repo.repoName}:`,
            webhookError.message
          );
        }
      }
    }
    await User.deleteOne({ _id: userId });
    await ActiveRepo.deleteMany({ userId });
    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
