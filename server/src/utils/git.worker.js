import { Queue } from "bullmq";
import { UnrecoverableError, Worker } from "bullmq";
import { redis, readmeConnection as connection } from "./redis.js";
import User from "../schema/user.schema.js";
import ActiveRepo from "../schema/activeRepo.js";
import { decrypt } from "./crypto.js";
import { REPOSITORY_LIMITS } from "./repo.limits.js";
import {
  getCommit,
  getRepoTree,
  getFileContent,
  commitFile,
  formatRepoTree,
  getFileLanguage,
  shouldIncludeFile,
  truncateContent,
} from "../services/github.service.js";
import { selectImportantFiles } from "./scan.filters.js";
import UserLogModel from "../schema/userLog.schema.js";
import { liveUpdate } from "../services/convex.service.js";
import { githubLog, queueLog, workerLog } from "./logger.js";

const generationLog = workerLog.child({ job: "readme-generation" });
const cleanupLog = workerLog.child({ job: "readme-cleanup" });
import { LlmService } from "../llm/llm.service.js";

export const readmeQueue = new Queue("readme-generation", { connection });

new Worker(
  "readme-generation",
  async (job) => {
    queueLog.info("README generation job received", {
      jobId: job.id,
      repo: job.data.repoFullName,
      commit: job.data.commitSha,
    });
    const sharedLogId = crypto.randomUUID();
    const userLog = await UserLogModel.create({
      logId: sharedLogId,
      userId: job.data.userId,
      repoName: job.data.repoName,
      repoOwner: job.data.repoOwner,
      action: "README_GENERATION_STARTED",
      status: "ongoing",
    });
    await redis.del("admin_analytics");
    job.data.logId = userLog._id.toString();
    job.data.sharedLogId = sharedLogId;
    queueLog.debug("Job bound to log row", {
      jobId: job.id,
      logId: job.data.logId,
      sharedLogId,
    });

    await aihandler(job.data);
  },
  {
    connection,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
);

// Errors here are swallowed so a logging failure never kills a generation job
async function updateLogStatus(logId, action, status, commitId = null) {
  try {
    const update = {
      action,
      status,
    };

    if (commitId) {
      update.commitId = commitId;
    }

    const log = await UserLogModel.findByIdAndUpdate(logId, update, {
      new: true,
      runValidators: true,
    });

    if (log) {
      generationLog.debug("Log row updated", {
        logId,
        action: log.action,
        status: log.status,
      });
      await redis.del("admin_analytics");
    }
  } catch (err) {
    generationLog.error("Failed to update log row", {
      logId,
      detail: err.message,
    });
  }
}

const aihandler = async (data) => {
  const {
    userId,
    repoId,
    repoName,
    repoFullName,
    repoOwner,
    defaultBranch,
    commitSha,
    sharedLogId,
  } = data;

  const repo_limits = REPOSITORY_LIMITS;

  generationLog.info("Starting README generation", {
    repo: repoFullName,
    commit: commitSha,
  });
  liveUpdate(
    sharedLogId,
    `Starting README generation for ${repoFullName} at commit ${commitSha.slice(0, 7)}`,
  );

  try {
    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      throw new Error("GitHub access token not found for user");
    }

    const providersPriority = user.llmProviderPriority || ["gemini", "sarvam"];

    const accessToken = decrypt(user.githubAccessToken);

    const activeRepo = await ActiveRepo.findOne({
      userId,
      repoId,
      active: true,
    });
    if (!activeRepo) throw new Error("Active repository not found");

    githubLog.info("Fetching commit details", {
      repo: repoFullName,
      commit: commitSha,
    });
    liveUpdate(sharedLogId, `Fetching commit details`);
    const commitData = await getCommit(
      accessToken,
      repoOwner,
      repoName,
      commitSha,
    );

    githubLog.info("Fetching repository tree", { repo: repoFullName });
    liveUpdate(sharedLogId, `Fetching repository structure`);
    let repoStructure = "";
    let repoTree = null;
    try {
      repoTree = await getRepoTree(
        accessToken,
        repoOwner,
        repoName,
        defaultBranch,
      );
      repoStructure = formatRepoTree(repoTree.tree, 3);

      if (repoTree.truncated) {
        githubLog.warn("Repository tree truncated by GitHub — partial scan", {
          repo: repoFullName,
        });
        liveUpdate(
          sharedLogId,
          `Repository tree truncated by GitHub — scan may be partial`,
        );
      }
    } catch (error) {
      githubLog.warn("Could not fetch repository tree", {
        repo: repoFullName,
        detail: error.message,
      });
      repoStructure = "Repository structure not available";
    }

    githubLog.info("Checking for existing README", { repo: repoFullName });
    liveUpdate(sharedLogId, `Checking for existing README`);
    const readmeFileName = process.env.README_FILE_NAME || "README.md";
    let existingReadme = null;
    let existingReadmeSha = null;

    try {
      const readmeData = await getFileContent(
        accessToken,
        repoOwner,
        repoName,
        readmeFileName,
        defaultBranch,
      );
      if (readmeData) {
        existingReadme = readmeData.content;
        existingReadmeSha = readmeData.sha;
        githubLog.info("Existing README found", {
          repo: repoFullName,
          bytes: readmeData.size,
        });
        liveUpdate(
          sharedLogId,
          `Found existing README (${readmeData.size} bytes)`,
        );
      }
    } catch (error) {
      githubLog.info("No existing README — generating from scratch", {
        repo: repoFullName,
        detail: error.message,
      });
      liveUpdate(
        sharedLogId,
        `No existing README found — will generate from scratch`,
      );
    }

    await updateLogStatus(
      data.logId,
      "GITHUB_REPO_CONNECTED",
      "ongoing",
      null,
      sharedLogId,
    );

    let fullCodebase = [];
    try {
      fullCodebase = await fetchFilesFromTree(
        accessToken,
        repoOwner,
        repoName,
        defaultBranch,
        repoTree,
        repo_limits.maxFilesFullScan,
        repo_limits.maxLinesPerFile,
      );
      githubLog.info("Repository scan complete", {
        repo: repoFullName,
        files: fullCodebase.length,
      });
      liveUpdate(sharedLogId, `Scanned ${fullCodebase.length} important files`);
    } catch (error) {
      githubLog.error("Repository scan failed", {
        repo: repoFullName,
        detail: error.message,
      });
    }

    const fullCodebasePathSet = new Set(fullCodebase.map((f) => f.path));
    const changedFilesContent = await fetchChangedFiles(
      accessToken,
      repoOwner,
      repoName,
      defaultBranch,
      commitData.files,
      repo_limits.maxChangedFiles,
      repo_limits.maxChangedFileLines,
      fullCodebasePathSet,
    );

    let llm = new LlmService();

    const result = await llm.generate({
      repoName,
      repoOwner,
      repoStructure,
      existingReadme,
      existingReadmeSha,
      changedFilesContent,
      fullCodebase,
      commitData,
      sharedLogId,
      providersPriority,
    });

    // Nothing worth documenting changed — this is a normal outcome, not a
    // failure, so settle the log as skipped and commit nothing.
    if (result.skipped) {
      generationLog.info("No README update needed", {
        repo: repoFullName,
        reason: result.reason,
      });
      liveUpdate(
        sharedLogId,
        `No major section update — skipping README commit`,
      );
      await updateLogStatus(
        data.logId,
        "README_GENERATION_SKIPPED",
        "skipped",
        null,
        sharedLogId,
      );

      return { skipped: true, reason: result.reason };
    }

    const readme = result.readme;

    let commitResult;

    try {
      commitResult = await commitFile(
        accessToken,
        repoOwner,
        repoName,
        readmeFileName,
        readme,
        "chore: auto-update README [skip ci]",
        defaultBranch,
        existingReadmeSha,
      );

      liveUpdate(sharedLogId, `Readme commited successfully `);

      await updateLogStatus(
        data.logId,
        "README_GENERATION_SUCCESS",
        "success",
        commitResult.commit.sha,
        sharedLogId,
      );

      githubLog.info("README committed", {
        repo: repoFullName,
        commit: commitResult.commit.sha,
      });
    } catch {
      liveUpdate(sharedLogId, `Readme failed to commit `);

      await updateLogStatus(
        data.logId,
        "README_GENERATION_FAILED",
        "failed",
        null,
        sharedLogId,
      );

      githubLog.error("README commit failed", { repo: repoFullName });
    }
  } catch (error) {
    generationLog.error("README generation failed", {
      repo: repoFullName,
      commit: commitSha,
      detail: error.message,
      stack: error.stack,
    });
    liveUpdate(sharedLogId, `✗ Failed: ${error.message}`);
    await updateLogStatus(
      data.logId,
      "README_GENERATION_FAILED",
      "failed",
      null,
      sharedLogId,
    );
    throw error;
  }
};

async function fetchFilesFromTree(
  accessToken,
  owner,
  repo,
  branch,
  treeData,
  limit = 25,
  linesPerFile = 200,
) {
  if (
    !treeData ||
    !Array.isArray(treeData.tree) ||
    treeData.tree.length === 0
  ) {
    return [];
  }

  const filePaths = selectImportantFiles(treeData.tree, limit);
  const results = [];

  for (const filePath of filePaths) {
    try {
      const fileData = await getFileContent(
        accessToken,
        owner,
        repo,
        filePath,
        branch,
      );
      if (fileData) {
        results.push({
          path: filePath,
          content: truncateContent(fileData.content, linesPerFile),
          language: getFileLanguage(filePath),
        });
      }
    } catch (err) {
      githubLog.warn("Could not fetch file", {
        repo: `${owner}/${repo}`,
        path: filePath,
        detail: err.message,
      });
    }
  }
  return results;
}

// excludePaths avoids fetching files already loaded in the full scan
async function fetchChangedFiles(
  accessToken,
  owner,
  repo,
  branch,
  commitFiles,
  limit,
  maxLines,
  excludePaths = new Set(),
) {
  const relevant = commitFiles
    .filter(
      (f) =>
        shouldIncludeFile(f.filename) &&
        (f.status === "added" || f.status === "modified") &&
        !excludePaths.has(f.filename),
    )
    .slice(0, limit);

  const results = [];
  for (const file of relevant) {
    try {
      const fileData = await getFileContent(
        accessToken,
        owner,
        repo,
        file.filename,
        branch,
      );
      if (fileData) {
        results.push({
          path: file.filename,
          content: truncateContent(fileData.content, maxLines),
          language: getFileLanguage(file.filename),
          status: file.status,
        });
      }
    } catch (err) {
      githubLog.warn("Could not fetch changed file", {
        repo: `${owner}/${repo}`,
        path: file.filename,
        detail: err.message,
      });
    }
  }
  return results;
}

export const cleanUpQueue = new Queue("cleanup-queue", { connection });

new Worker("cleanup-queue", cleanupHandler, {
  connection,
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
});

// A retry reuses the sharedLogId minted by the controller, so upsert the row
// instead of creating one — a stalled job re-run would otherwise leave a
// second Mongo row for the same cleanup, and logRecovery would mark the
// orphan failed while the retry is still running.
async function startCleanupLog({ sharedLogId, userId, repoName, repoOwner }) {
  const userLog = await UserLogModel.findOneAndUpdate(
    { logId: sharedLogId },
    {
      logId: sharedLogId,
      userId,
      repoName,
      repoOwner,
      action: "README_CLEANUP_STARTED",
      status: "ongoing",
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );
  await redis.del("admin_analytics");
  return userLog;
}

async function cleanupHandler(job) {
  const {
    userId,
    repoName,
    repoOwner,
    defaultBranch,
    encryptedAccessToken,
    sharedLogId,
    providerPriority,
  } = job.data;

  const userLog = await startCleanupLog({
    sharedLogId,
    userId,
    repoName,
    repoOwner,
  });

  try {
    const accessToken = decrypt(encryptedAccessToken);

    liveUpdate(
      sharedLogId,
      `Starting README cleanup for ${repoOwner}/${repoName}`,
    );
    githubLog.info("Fetching README for cleanup", {
      repo: `${repoOwner}/${repoName}`,
    });
    const readmeFile = await getFileContent(
      accessToken,
      repoOwner,
      repoName,
      "README.md",
      defaultBranch,
    );

    if (!readmeFile?.content?.trim()) {
      githubLog.warn("README not found — cleanup cannot run", {
        repo: `${repoOwner}/${repoName}`,
      });
      // Retrying cannot conjure a README — fail the job outright rather than
      // burning every attempt plus its backoff on a job that cannot succeed.
      throw new UnrecoverableError("README.md not found in repository");
    }

    githubLog.info("README fetched", {
      repo: `${repoOwner}/${repoName}`,
      bytes: readmeFile.content.length,
    });
    liveUpdate(sharedLogId, "Fetched existing README.md");
    liveUpdate(sharedLogId, "Rewriting the README");
    cleanupLog.info("Running README cleanup", {
      repo: `${repoOwner}/${repoName}`,
    });
    const llmService = new LlmService();
    const cleanedReadme = await llmService.cleanup(
      readmeFile.content,
      sharedLogId,
      providerPriority,
    );
    if (!cleanedReadme) {
      liveUpdate(sharedLogId, "The model returned an empty README");
      throw new Error("Cleanup returned empty content");
    }
    cleanupLog.info("Cleanup complete", { chars: cleanedReadme.length });
    liveUpdate(
      sharedLogId,
      `Cleanup complete — ${cleanedReadme.length.toLocaleString()} characters`,
    );

    githubLog.info("Committing cleaned README", {
      repo: `${repoOwner}/${repoName}`,
    });
    liveUpdate(sharedLogId, "Committing cleaned README to GitHub");
    const commitResult = await commitFile(
      accessToken,
      repoOwner,
      repoName,
      "README.md",
      cleanedReadme,
      "chore: cleanup README [skip ci]",
      defaultBranch,
      readmeFile.sha,
    );

    githubLog.info("Cleaned README committed", {
      repo: `${repoOwner}/${repoName}`,
      commit: commitResult.commit.sha,
    });
    liveUpdate(
      sharedLogId,
      `✓ README committed: ${commitResult.commit.sha.slice(0, 7)}`,
    );
    await UserLogModel.findByIdAndUpdate(
      userLog._id,
      {
        action: "README_CLEANUP_SUCCESS",
        status: "success",
        commitId: commitResult.commit.sha,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    await redis.del("admin_analytics");
  } catch (error) {
    cleanupLog.error("README cleanup failed", {
      repo: `${repoOwner}/${repoName}`,
      detail: error.message,
    });

    // Only settle the log as failed once no attempt is left, so a transient
    // failure does not flash "failed" in the UI before the retry reopens it.
    const attemptsAllowed = job.opts.attempts ?? 1;
    const attemptsUsed = job.attemptsStarted ?? job.attemptsMade + 1;
    const isLastAttempt =
      error instanceof UnrecoverableError || attemptsUsed >= attemptsAllowed;

    if (isLastAttempt) {
      liveUpdate(sharedLogId, `✗ README cleanup failed: ${error.message}`);
      await UserLogModel.findByIdAndUpdate(
        userLog._id,
        {
          action: "README_CLEANUP_FAILED",
          status: "failed",
        },
        {
          new: true,
          runValidators: true,
        },
      );
      await redis.del("admin_analytics");
    } else {
      liveUpdate(
        sharedLogId,
        `Attempt ${attemptsUsed}/${attemptsAllowed} failed (${error.message}) — retrying`,
      );
    }

    throw error;
  }
}
