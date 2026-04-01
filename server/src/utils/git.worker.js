import IORedis from "ioredis";
import { Queue } from "bullmq";
import { Worker } from "bullmq";
import User from "../schema/user.schema.js";
import ActiveRepo from "../schema/activeRepo.js";
import { decrypt } from "./crypto.js";
import {
  generateReadme,
  generateReadmePatch,
  determineGenerationMode,
} from "../services/groq.service.js";
import { getActiveLimits } from "../services/gemini.service.js";
import { parseReadmeSections, hashSections } from "./readme.parser.js";
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
import {
  buildReadmeContext,
  optimizeContext,
  validateContext,
} from "./prompt.builder.js";
import UserLogModel from "../schema/userLog.schema.js";

export const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  username: "default",
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  keepAlive: 30000,
  retryStrategy: (times) => {
    const delay = Math.min(times * 1000, 10000);
    console.log(`Retrying Redis connection in ${delay}ms (attempt ${times})`);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
    if (targetErrors.some((e) => err.message.includes(e))) {
      console.log("Reconnecting due to:", err.message);
      return true;
    }
    return false;
  },
  connectTimeout: 10000,
  lazyConnect: true,
});

connection.on("error", (err) =>
  console.error("Redis connection error:", err.message),
);
connection.on("connect", () => console.log("Redis connected successfully"));
connection.on("ready", () => console.log("Redis ready to accept commands"));
connection.on("close", () =>
  console.warn("Redis connection closed. Will attempt to reconnect..."),
);
connection.on("reconnecting", (timeToReconnect) =>
  console.log(`Reconnecting to Redis in ${timeToReconnect}ms...`),
);
connection.on("end", () => console.error("Redis connection ended permanently"));

connection.connect().catch((err) => {
  console.error("Failed to connect to Redis:", err.message);
  console.log(
    "Redis is optional. Server will continue without queue functionality.",
  );
});

export const readmeQueue = new Queue("readme-generation", { connection });

new Worker(
  "readme-generation",
  async (job) => {
    console.log("Processing job:", job.data);
    const userLog = await UserLogModel.create({
      userId: job.data.userId,
      repoName: job.data.repoName,
      repoOwner: job.data.repoOwner,
      action: "README_GENERATION_STARTED",
      status: "ongoing",
    });
    job.data.logId = userLog._id.toString();
    console.log("Updated job data with logId:", job.data.logId);
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
    const log = await UserLogModel.findById(logId);
    if (log) {
      log.action = action;
      log.status = status;
      if (commitId) log.commitId = commitId;
      await log.save();
    }
  } catch (err) {
    console.error("[AI Handler] Failed to update log:", err.message);
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
  } = data;

  // Resolve fetch limits up front — Gemini gets larger budgets than Groq
  const limits = getActiveLimits();

  console.log(
    `[AI Handler] Starting README generation for ${repoFullName} at commit ${commitSha}`,
  );

  try {
    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      throw new Error("GitHub access token not found for user");
    }

    const accessToken = decrypt(user.githubAccessToken);

    const activeRepo = await ActiveRepo.findOne({
      userId,
      repoId,
      active: true,
    });
    if (!activeRepo) throw new Error("Active repository not found");

    console.log(`[AI Handler] Fetching commit details for ${commitSha}`);
    const commitData = await getCommit(
      accessToken,
      repoOwner,
      repoName,
      commitSha,
    );

    console.log(`[AI Handler] Fetching repository structure`);
    let repoStructure = "";
    try {
      const treeData = await getRepoTree(
        accessToken,
        repoOwner,
        repoName,
        defaultBranch,
      );
      repoStructure = formatRepoTree(treeData.tree, 3);
    } catch (error) {
      console.warn(`[AI Handler] Could not fetch repo tree: ${error.message}`);
      repoStructure = "Repository structure not available";
    }

    console.log(`[AI Handler] Checking for existing README`);
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
        console.log(
          `[AI Handler] Found existing README (${readmeData.size} bytes)`,
        );
      }
    } catch (error) {
      console.log(
        `[AI Handler] No existing README found or error fetching: ${error.message}`,
      );
    }

    await updateLogStatus(data.logId, "GITHUB_REPO_CONNECTED", "ongoing");

    const { mode, reason } = determineGenerationMode(existingReadme);
    console.log(`[AI Handler] Generation mode: ${mode} — ${reason}`);

    if (mode === "full") {
      console.log(`[AI Handler] FULL mode — scanning entire repository`);

      let fullCodebase = [];
      try {
        fullCodebase = await fetchFilesFromTree(
          accessToken,
          repoOwner,
          repoName,
          defaultBranch,
          limits.maxFilesFullScan,
          limits.maxLinesPerFile,
        );
        console.log(
          `[AI Handler] Scanned ${fullCodebase.length} important files from repository`,
        );
      } catch (error) {
        console.error(
          `[AI Handler] Error scanning repository: ${error.message}`,
        );
      }

      const fullCodebasePathSet = new Set(fullCodebase.map((f) => f.path));
      const changedFilesContent = await fetchChangedFiles(
        accessToken,
        repoOwner,
        repoName,
        defaultBranch,
        commitData.files,
        limits.maxChangedFiles,
        limits.maxChangedFileLines,
        fullCodebasePathSet,
      );

      let context = buildReadmeContext({
        repoName,
        repoOwner,
        repoStructure,
        existingReadme,
        commitData,
        changedFilesContent,
        fullCodebase,
      });

      const validation = validateContext(context);
      console.log(`[AI Handler] Context validation:`, validation);

      if (!validation.valid)
        throw new Error(`Invalid context: ${validation.errors.join(", ")}`);

      if (validation.warnings.length > 0) {
        console.warn(`[AI Handler] Context warnings:`, validation.warnings);
      }

      if (validation.estimatedTokens > limits.contextOptimizeAt) {
        console.log(
          `[AI Handler] Optimizing context (${validation.estimatedTokens} tokens > ${limits.contextOptimizeAt} limit)`,
        );
        context = optimizeContext(context, limits.contextOptimizeAt);
      }

      console.log(`[AI Handler] Generating README (Gemini → Groq fallback)`);
      const generatedReadme = await generateReadme(context);

      if (!generatedReadme || generatedReadme.trim().length === 0) {
        throw new Error("AI returned empty README");
      }

      console.log(
        `[AI Handler] Generated README (${generatedReadme.length} characters)`,
      );

      const commitResult = await commitFile(
        accessToken,
        repoOwner,
        repoName,
        readmeFileName,
        generatedReadme,
        "chore: auto-update README [skip ci]",
        defaultBranch,
        existingReadmeSha,
      );

      console.log(
        `[AI Handler] README committed successfully: ${commitResult.commit.sha}`,
      );

      // Store section hashes so the next push can use patch mode instead of full regen
      const { sections: newSections } = parseReadmeSections(generatedReadme);
      const newHashes = hashSections(newSections);

      activeRepo.sectionHashes = newHashes;
      activeRepo.markModified("sectionHashes");
      activeRepo.lastSectionHashesUpdatedAt = new Date();
      activeRepo.lastReadmeGeneratedAt = new Date();
      activeRepo.readmeGenerationCount =
        (activeRepo.readmeGenerationCount || 0) + 1;
      activeRepo.lastReadmeSha = commitResult.commit.sha;
      await activeRepo.save();

      await updateLogStatus(
        data.logId,
        "README_GENERATION_SUCCESS",
        "success",
        commitResult.commit.sha,
      );

      console.log(
        `[AI Handler] ✓ Full README generation completed for ${repoFullName}`,
      );
      return {
        success: true,
        commitSha: commitResult.commit.sha,
        readmeLength: generatedReadme.length,
      };
    } else {
      console.log(`[AI Handler] PATCH mode — surgical section update`);

      const { sections: originalSections, orderedKeys } =
        parseReadmeSections(existingReadme);
      const originalHashes = hashSections(originalSections);

      const changedFilesContent = await fetchChangedFiles(
        accessToken,
        repoOwner,
        repoName,
        defaultBranch,
        commitData.files,
        limits.maxPatchFiles,
        limits.maxPatchFileLines,
      );
      console.log(
        `[AI Handler] Fetched ${changedFilesContent.length} changed files`,
      );

      const { commitDiff } = buildReadmeContext({
        repoName,
        repoOwner,
        repoStructure: "",
        existingReadme: null,
        commitData,
        changedFilesContent: [],
      });

      const patchResult = await generateReadmePatch({
        repoName,
        repoOwner,
        repoStructure,
        commitDiff,
        changedFiles: changedFilesContent,
        originalSections,
        orderedKeys,
        originalHashes,
      });

      if (!patchResult) {
        console.log(
          `[AI Handler] Patch generation returned null — skipping commit`,
        );
        await updateLogStatus(
          data.logId,
          "README_GENERATION_SKIPPED",
          "skipped",
        );
        return { skipped: true };
      }

      const { finalReadme, newHashes } = patchResult;

      const commitResult = await commitFile(
        accessToken,
        repoOwner,
        repoName,
        readmeFileName,
        finalReadme,
        "chore: auto-update README [skip ci]",
        defaultBranch,
        existingReadmeSha,
      );

      console.log(
        `[AI Handler] README patch committed successfully: ${commitResult.commit.sha}`,
      );

      activeRepo.sectionHashes = newHashes;
      activeRepo.markModified("sectionHashes");
      activeRepo.lastSectionHashesUpdatedAt = new Date();
      activeRepo.lastReadmeGeneratedAt = new Date();
      activeRepo.readmeGenerationCount =
        (activeRepo.readmeGenerationCount || 0) + 1;
      activeRepo.lastReadmeSha = commitResult.commit.sha;
      await activeRepo.save();

      await updateLogStatus(
        data.logId,
        "README_GENERATION_SUCCESS",
        "success",
        commitResult.commit.sha,
      );

      console.log(
        `[AI Handler] ✓ Patch README generation completed for ${repoFullName}`,
      );
      return {
        success: true,
        commitSha: commitResult.commit.sha,
        mode: "patch",
      };
    }
  } catch (error) {
    console.error(
      `[AI Handler] ✗ Error generating README for ${repoFullName}:`,
      error.message,
    );
    console.error(error.stack);
    await updateLogStatus(data.logId, "README_GENERATION_FAILED", "failed");
    throw error;
  }
};

async function fetchFilesFromTree(
  accessToken,
  owner,
  repo,
  branch,
  limit = 25,
  linesPerFile = 200,
) {
  const treeData = await getRepoTree(accessToken, owner, repo, branch);
  const filePaths = getImportantFiles(treeData.tree).slice(0, limit);
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
      console.warn(
        `[AI Handler] Could not fetch file ${filePath}: ${err.message}`,
      );
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
      console.warn(
        `[AI Handler] Could not fetch changed file ${file.filename}: ${err.message}`,
      );
    }
  }
  return results;
}

function getImportantFiles(tree) {
  const priorities = {
    // dependency/config files — tell us the most about the project
    "package.json": 1,
    "package-lock.json": 1,
    "requirements.txt": 1,
    "setup.py": 1,
    "Cargo.toml": 1,
    "go.mod": 1,
    "pom.xml": 1,
    "build.gradle": 1,
    "composer.json": 1,

    // entry points
    "index.js": 2,
    "index.ts": 2,
    "main.js": 2,
    "main.ts": 2,
    "main.py": 2,
    "app.js": 2,
    "app.ts": 2,
    "server.js": 2,
    "server.ts": 2,

    // runtime config
    ".env.example": 3,
    "config.js": 3,
    "config.json": 3,

    // docs
    "CHANGELOG.md": 4,
    "CONTRIBUTING.md": 4,
  };

  const importantDirPatterns = [
    /^src\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
    /^lib\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
    /^app\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
    /^api\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
    /^routes\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
    /^controllers\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
    /^models\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
    /^services\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
    /^utils\/.*\.(js|ts|jsx|tsx|py|java|go|rs)$/,
    /^components\/.*\.(js|ts|jsx|tsx)$/,
    /^pages\/.*\.(js|ts|jsx|tsx)$/,
  ];

  const categorized = tree
    .filter((item) => item.type === "blob")
    .map((item) => {
      const filename = item.path.split("/").pop();
      const priority = priorities[filename] || 999;
      const matchesPattern = importantDirPatterns.some((pattern) =>
        pattern.test(item.path),
      );
      return { path: item.path, priority, matchesPattern };
    })
    .filter((item) => item.priority < 999 || item.matchesPattern)
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.matchesPattern && !b.matchesPattern) return -1;
      if (!a.matchesPattern && b.matchesPattern) return 1;
      return 0;
    });

  return categorized.map((item) => item.path);
}
