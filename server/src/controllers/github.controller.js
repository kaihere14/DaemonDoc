import User from "../schema/user.schema.js";
import { decrypt } from "./oauthcontroller.js";
import axios from "axios";
import ActiveRepo from "../schema/activeRepo.js";
import crypto from "node:crypto";
import { readmeQueue } from "../utils/git.worker.js";

export function verifyGithubSignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET);

  // Convert body to string if it's an object
  const payload =
    typeof req.body === "string" ? req.body : JSON.stringify(req.body);

  const digest = "sha256=" + hmac.update(payload).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export const getGithubRepos = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user || !user.githubAccessToken) {
      return res.status(404).json({ message: "GitHub access token not found" });
    }

    const accessToken = decrypt(user.githubAccessToken);

    const reposRes = await axios.get(
      "https://api.github.com/user/repos?per_page=100",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const activeRepos = await ActiveRepo.find({ userId: userId });
    const activeRepoIds = activeRepos
      .filter((repo) => repo.active == true)
      .map((repo) => repo.repoId);

    const reposData = reposRes.data
      .filter((repo) => !repo.fork && repo.permissions?.push)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        owner: repo.owner.login,
        default_branch: repo.default_branch,
        activated: activeRepoIds.includes(repo.id),
      }));

    res.status(200).json({ reposData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching GitHub repositories", error });
  }
};

export const addRepoActivity = async (req, res) => {
  try {
    const { repoId, repoName, repoFullName, repoOwner, defaultBranch } =
      req.body;
    const userId = req.userId;
    if (!repoId || !repoName || !repoFullName || !repoOwner || !defaultBranch) {
      return res
        .status(400)
        .json({ message: "Missing required repository information" });
    }
    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      return res.status(404).json({ message: "GitHub access token not found" });
    }
    const existedRepo = await ActiveRepo.findOne({
      userId,
      repoId,
      active: true,
    });
    if (existedRepo) {
      return res
        .status(400)
        .json({ message: "Repository activity already exists" });
    }

    const accessToken = decrypt(user.githubAccessToken);

    let webhookId;
    // Create webhook for the repository
    try {
      const webhookRes = await axios.post(
        `https://api.github.com/repos/${repoOwner}/${repoName}/hooks`,
        {
          name: "web",
          active: true,
          events: ["push"],
          config: {
            url: ` ${process.env.BACKEND_URL}/api/github/webhookhandler`,
            content_type: "json",
            secret: process.env.GITHUB_WEBHOOK_SECRET,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
          },
        }
      );
      webhookId = webhookRes.data.id;
    } catch (error) {
      if (error.response && error.response.status === 422) {
        return res
          .status(422)
          .json({ message: "Webhook already exists for this repository" });
      }
      return res
        .status(500)
        .json({ message: "Error creating webhook", error: error.message });
    }

    // Save active repository info in the database
    const activeRepo = new ActiveRepo({
      userId,
      repoId,
      repoName,
      repoFullName,
      repoOwner,
      defaultBranch,
      webhookId,
      active: true,
    });

    await activeRepo.save();

    res.status(200).json({ message: "Repository activity added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding repository activity", error });
  }
};

export const deactivateRepoActivity = async (req, res) => {
  try {
    const { repoId } = req.body;
    const userId = req.userId;
    const activeRepo = await ActiveRepo.findOne({ userId, repoId, active: true });

    if (!activeRepo) {
      return res.status(404).json({ message: "Active repository not found" });
    }

    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      return res.status(404).json({ message: "GitHub access token not found" });
    }

    const accessToken = decrypt(user.githubAccessToken);

    try {
      await axios.delete(
        `https://api.github.com/repos/${activeRepo.repoOwner}/${activeRepo.repoName}/hooks/${activeRepo.webhookId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
          },
        }
      );
    } catch (error) {
      console.error("Error deleting webhook:", error.message);
      // Even if webhook deletion fails, we'll proceed to deactivate the repo in our DB
    }

    activeRepo.active = false;
    await activeRepo.save();

    res.status(200).json({ message: "Repository activity deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deactivating repository activity", error });
  }
};


export const githubWebhookHandler = async (req, res) => {
  try {
    // 1. Verify signature
    const isValid = verifyGithubSignature(req);
    if (!isValid) {
      return res.status(401).send("Invalid signature");
    }

    // 2. Identify event
    const event = req.headers["x-github-event"];
    if (event !== "push") {
      return res.status(200).send("Event ignored");
    }

    // 3. Parse payload
    const payload =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const repoId = payload.repository.id;
    const commitSha = payload.after;
    const commitMessage = payload.head_commit?.message || "";

    // 4. Check active repo
    const activeRepo = await ActiveRepo.findOne({
      repoId,
      active: true,
    });

    if (!activeRepo) {
      return res.status(200).send("Repo not active");
    }

    // 5. Loop prevention - ignore bot commits
    if (commitMessage.includes("[skip ci]") || commitMessage.includes("auto-update README")) {
      console.log(`Ignoring bot commit: ${commitSha}`);
      return res.status(200).send("Bot commit ignored");
    }

    // 6. Check if already processed
    if (activeRepo.lastProcessedSha === commitSha) {
      return res.status(200).send("Already processed");
    }

    // 7. Queue README generation
    console.log(`Received push event for repo ${activeRepo.repoFullName} at commit ${commitSha}`);
    readmeQueue.add("generate-readme", {
      userId: activeRepo.userId,
      repoId: activeRepo.repoId,
      repoName: activeRepo.repoName,
      repoFullName: activeRepo.repoFullName,
      repoOwner: activeRepo.repoOwner,
      defaultBranch: activeRepo.defaultBranch,
      commitSha: commitSha,
    });

    // 8. Update last processed commit
    activeRepo.lastProcessedSha = commitSha;
    await activeRepo.save();

    return res.status(200).send("Webhook processed");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Webhook error");
  }
};
