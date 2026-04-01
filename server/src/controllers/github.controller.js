import User from "../schema/user.schema.js";
import { decrypt } from "./oauthcontroller.js";
import ActiveRepo from "../schema/activeRepo.js";
import crypto from "node:crypto";
import { readmeQueue } from "../utils/git.worker.js";
import UserLogModel from "../schema/userLog.schema.js";
import {
  GITHUB_API_BASE,
  githubGet,
  githubPost,
  githubDelete,
} from "../utils/githubApiClient.js";

export function verifyGithubSignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET);

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

    const reposRes = await githubGet(
      `${GITHUB_API_BASE}/user/repos?per_page=100`,
      accessToken,
    );
    const activeRepos = await ActiveRepo.find({ userId: userId });
    const activeRepoIdSet = new Set(
      activeRepos
        .filter((repo) => repo.active === true)
        .map((repo) => repo.repoId),
    );

    const reposData = reposRes.data
      .filter((repo) => !repo.fork && repo.permissions?.push)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        owner: repo.owner.login,
        default_branch: repo.default_branch,
        activated: activeRepoIdSet.has(repo.id),
        canActivate: !!repo.permissions?.admin,
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

    // Enforce plan-based active repo limit.
    // null means unlimited (pro plan) — do NOT fall back with ?? here.
    const activeRepoLimit = user.activeRepoLimit;
    if (activeRepoLimit !== null && activeRepoLimit !== undefined) {
      const currentActiveCount = await ActiveRepo.countDocuments({
        userId,
        active: true,
      });
      if (currentActiveCount >= activeRepoLimit) {
        return res.status(403).json({
          message: `Active repo limit reached. Your plan allows up to ${activeRepoLimit} active ${activeRepoLimit === 1 ? "repo" : "repos"}.`,
          code: "ACTIVE_REPO_LIMIT_REACHED",
          limit: activeRepoLimit,
        });
      }
    }

    const accessToken = decrypt(user.githubAccessToken);

    let webhookId;
    try {
      const webhookRes = await githubPost(
        `${GITHUB_API_BASE}/repos/${repoOwner}/${repoName}/hooks`,
        {
          name: "web",
          active: true,
          events: ["push"],
          config: {
            url: `${process.env.BACKEND_URL}/api/github/webhookhandler`,
            content_type: "json",
            secret: process.env.GITHUB_WEBHOOK_SECRET,
          },
        },
        accessToken,
      );
      webhookId = webhookRes.data.id;
    } catch (error) {
      if (error.response?.status === 422) {
        // Webhook already exists on GitHub (e.g. repo was deactivated without
        // removing the webhook). Find and reuse the existing webhook ID.
        try {
          const hooksRes = await githubGet(
            `${GITHUB_API_BASE}/repos/${repoOwner}/${repoName}/hooks`,
            accessToken,
          );
          const webhookUrl = `${process.env.BACKEND_URL}/api/github/webhookhandler`;
          const existing = hooksRes.data.find((h) => h.config?.url === webhookUrl);
          if (existing) {
            webhookId = existing.id;
          } else {
            return res.status(422).json({ message: "Webhook already exists for this repository" });
          }
        } catch {
          return res.status(422).json({ message: "Webhook already exists for this repository" });
        }
      } else {
        return res
          .status(500)
          .json({ message: "Error creating webhook", error: error.message });
      }
    }

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

    // On first-ever activation, immediately trigger README generation
    // so users don't have to make a commit themselves to see it work.
    const hasBeenActivatedBefore = await ActiveRepo.findOne({
      userId,
      repoId,
      active: false,
    });
    if (!hasBeenActivatedBefore) {
      try {
        const refRes = await githubGet(
          `${GITHUB_API_BASE}/repos/${repoOwner}/${repoName}/git/ref/heads/${defaultBranch}`,
          accessToken,
        );
        const headSha = refRes.data.object.sha;

        await readmeQueue.add("generate-readme", {
          userId,
          repoId,
          repoName,
          repoFullName,
          repoOwner,
          defaultBranch,
          commitSha: headSha,
        });

        activeRepo.lastProcessedSha = headSha;
        await activeRepo.save();
      } catch (err) {
        console.error(
          "Failed to trigger initial README generation:",
          err.message,
        );
        // Non-fatal: repo is still activated, pipeline just won't auto-start
      }
    }

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
    const activeRepo = await ActiveRepo.findOne({
      userId,
      repoId,
      active: true,
    });

    if (!activeRepo) {
      return res.status(404).json({ message: "Active repository not found" });
    }

    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      return res.status(404).json({ message: "GitHub access token not found" });
    }

    const accessToken = decrypt(user.githubAccessToken);

    try {
      await githubDelete(
        `${GITHUB_API_BASE}/repos/${activeRepo.repoOwner}/${activeRepo.repoName}/hooks/${activeRepo.webhookId}`,
        accessToken,
      );
    } catch (error) {
      console.error("Error deleting webhook:", error.message);
    }

    //insted of turning the toggle of we are just removing the complete document from the db as there was a issue with the toggle where if the user deactivates and activates again then the document was created twice and it was creating an issue for the users so we are just removing the document from the db and when the user activates again then we will create a new document in the db and a new webhook in the github

    const response = await ActiveRepo.deleteOne({ _id: activeRepo._id });

    console.log(response);
    res
      .status(200)
      .json({ message: "Repository activity deactivated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deactivating repository activity", error });
  }
};

export const githubWebhookHandler = async (req, res) => {
  try {
    const isValid = verifyGithubSignature(req);
    if (!isValid) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.headers["x-github-event"];
    if (event !== "push") {
      return res.status(200).send("Event ignored");
    }

    const payload =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const repoId = payload.repository.id;
    const commitSha = payload.after;
    const commitMessage = payload.head_commit?.message || "";
    const ref = payload.ref; // e.g., "refs/heads/main"
    const branchName = ref.replace("refs/heads/", "");

    const activeRepo = await ActiveRepo.findOne({
      repoId,
      active: true,
    });

    if (!activeRepo) {
      return res.status(200).send("Repo not active");
    }

    // Only process README generation on default branch
    if (branchName !== activeRepo.defaultBranch) {
      console.log(
        `Ignoring push to non-default branch: ${branchName} (default: ${activeRepo.defaultBranch})`,
      );
      return res.status(200).send("Non-default branch ignored");
    }

    if (
      commitMessage.includes("[skip ci]") ||
      commitMessage.includes("auto-update README")
    ) {
      console.log(`Ignoring bot commit: ${commitSha}`);
      return res.status(200).send("Bot commit ignored");
    }

    if (activeRepo.lastProcessedSha === commitSha) {
      return res.status(200).send("Already processed");
    }

    console.log(
      `Received push event for repo ${activeRepo.repoFullName} at commit ${commitSha}`,
    );

    readmeQueue.add("generate-readme", {
      userId: activeRepo.userId,
      repoId: activeRepo.repoId,
      repoName: activeRepo.repoName,
      repoFullName: activeRepo.repoFullName,
      repoOwner: activeRepo.repoOwner,
      defaultBranch: activeRepo.defaultBranch,
      commitSha: commitSha,
    });

    activeRepo.lastProcessedSha = commitSha;
    await activeRepo.save();

    return res.status(200).send("Webhook processed");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Webhook error");
  }
};

export const fetchUserLogs = async (req, res) => {
  try {
    const userId = req.userId;

    const logs = await UserLogModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user logs", error });
  }
};

export const fetchAdminAnalytics = async (_req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeRepos,
      totalLogs,
      liveJobs,
      recentLogs,
      statusBreakdown,
      topReposRaw,
      latestLog,
    ] = await Promise.all([
      User.countDocuments(),
      ActiveRepo.countDocuments({ active: true }),
      UserLogModel.countDocuments(),
      UserLogModel.countDocuments({ status: "ongoing" }),
      UserLogModel.find({ createdAt: { $gte: last7Days } })
        .select("status createdAt")
        .sort({ createdAt: 1 })
        .lean(),
      UserLogModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      UserLogModel.aggregate([
        {
          $group: {
            _id: {
              repoName: "$repoName",
              repoOwner: "$repoOwner",
            },
            count: { $sum: 1 },
            lastEventAt: { $max: "$createdAt" },
          },
        },
        { $sort: { count: -1, lastEventAt: -1 } },
        { $limit: 5 },
      ]),
      UserLogModel.findOne().sort({ createdAt: -1 }).lean(),
    ]);

    const successfulTerminalRuns = await UserLogModel.countDocuments({
      status: "success",
    });
    const terminalRuns = await UserLogModel.countDocuments({
      status: { $in: ["success", "failed"] },
    });
    const successRate =
      terminalRuns > 0
        ? Math.round((successfulTerminalRuns / terminalRuns) * 100)
        : 0;

    const logsInLast24Hours = recentLogs.filter(
      (log) => new Date(log.createdAt) >= last24Hours,
    ).length;

    const activityLookup = new Map();
    recentLogs.forEach((log) => {
      const key = new Date(log.createdAt).toISOString().slice(0, 10);
      const currentDay = activityLookup.get(key) || {
        date: key,
        total: 0,
        success: 0,
        failed: 0,
        ongoing: 0,
        skipped: 0,
      };
      currentDay.total += 1;
      currentDay[log.status] += 1;
      activityLookup.set(key, currentDay);
    });

    const activity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(last7Days);
      date.setDate(last7Days.getDate() + index + 1);
      const key = date.toISOString().slice(0, 10);
      const dayData = activityLookup.get(key) || {
        date: key,
        total: 0,
        success: 0,
        failed: 0,
        ongoing: 0,
        skipped: 0,
      };

      return {
        ...dayData,
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
      };
    });

    const breakdown = {
      success: 0,
      failed: 0,
      ongoing: 0,
      skipped: 0,
    };

    statusBreakdown.forEach((entry) => {
      if (entry?._id in breakdown) {
        breakdown[entry._id] = entry.count;
      }
    });

    const topRepos = topReposRaw.map((repo) => ({
      repoName: repo._id.repoName,
      repoOwner: repo._id.repoOwner,
      count: repo.count,
      lastEventAt: repo.lastEventAt,
    }));

    const threeLatestLogs = await UserLogModel.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    if (threeLatestLogs.length === 0) {
      threeLatestLogs.push({
        repoName: "No activity yet",
        repoOwner: null,
        status: null,
        createdAt: new Date(),
      });
    }

    return res.status(200).json({
      overview: {
        totalUsers,
        activeRepos,
        totalRuns: totalLogs,
        liveJobs,
        successRate,
        logsInLast24Hours,
        latestActivityAt: latestLog?.createdAt || null,
      },
      breakdown,
      activity,
      topRepos,
      recentLogs: threeLatestLogs,
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return res.status(500).json({ message: "Error fetching admin analytics" });
  }
};
