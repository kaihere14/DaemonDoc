import IORedis from "ioredis";
import { Queue } from "bullmq";
import { Worker } from "bullmq";
import User from "../schema/user.schema.js";
import ActiveRepo from "../schema/activeRepo.js";
import { decrypt } from "../controllers/oauthcontroller.js";
import {
  generateReadme,
  analyzeReadmeDepth,
} from "../services/groq.service.js";
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
import  UserLogModel  from "../schema/userLog.schema.js";

export const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  username: "default",
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  keepAlive: 30000, // Send keepalive packets every 30s
  retryStrategy: (times) => {
    // Retry indefinitely for production stability
    const delay = Math.min(times * 1000, 10000); // Max 10s delay
    console.log(`Retrying Redis connection in ${delay}ms (attempt ${times})`);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
    if (targetErrors.some((e) => err.message.includes(e))) {
      console.log("Reconnecting due to:", err.message);
      return true; // Reconnect on these errors
    }
    return false;
  },
  connectTimeout: 10000,
  lazyConnect: true,
});

connection.on("error", (err) => {
  console.error("Redis connection error:", err.message);
  // Don't crash the server, just log the error
});

connection.on("connect", () => {
  console.log("Redis connected successfully");
});

connection.on("ready", () => {
  console.log("Redis ready to accept commands");
});

connection.on("close", () => {
  console.warn("Redis connection closed. Will attempt to reconnect...");
});

connection.on("reconnecting", (timeToReconnect) => {
  console.log(`Reconnecting to Redis in ${timeToReconnect}ms...`);
});

connection.on("end", () => {
  console.error("Redis connection ended permanently");
});

// Attempt to connect
connection.connect().catch((err) => {
  console.error("Failed to connect to Redis:", err.message);
  console.log(
    "Redis is optional. Server will continue without queue functionality."
  );
});

export const readmeQueue = new Queue("readme-generation", {
  connection,
});

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
  }
);

/**
 * AI Handler - Processes README generation jobs
 * @param {Object} data - Job data from webhook
 */
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

  console.log(
    `[AI Handler] Starting README generation for ${repoFullName} at commit ${commitSha}`
  );

  try {
    // Step 1: Fetch user's GitHub token
    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      throw new Error("GitHub access token not found for user");
    }

    const accessToken = decrypt(user.githubAccessToken);

    // Step 2: Get active repo record
    const activeRepo = await ActiveRepo.findOne({
      userId,
      repoId,
      active: true,
    });
    if (!activeRepo) {
      throw new Error("Active repository not found");
    }

    // Step 3: Fetch commit details
    console.log(`[AI Handler] Fetching commit details for ${commitSha}`);
    const commitData = await getCommit(
      accessToken,
      repoOwner,
      repoName,
      commitSha
    );

    // Step 4: Fetch repository structure
    console.log(`[AI Handler] Fetching repository structure`);
    let repoStructure = "";
    try {
      const treeData = await getRepoTree(
        accessToken,
        repoOwner,
        repoName,
        defaultBranch
      );
      repoStructure = formatRepoTree(treeData.tree, 3);
    } catch (error) {
      console.warn(`[AI Handler] Could not fetch repo tree: ${error.message}`);
      repoStructure = "Repository structure not available";
    }

    // Step 5: Fetch existing README
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
        defaultBranch
      );

      if (readmeData) {
        existingReadme = readmeData.content;
        existingReadmeSha = readmeData.sha;
        console.log(
          `[AI Handler] Found existing README (${readmeData.size} bytes)`
        );
      }
    } catch (error) {
      console.log(
        `[AI Handler] No existing README found or error fetching: ${error.message}`
      );
    }
    const log = await UserLogModel.findById(data.logId);
    if (log) {
      log.action = "GITHUB_REPO_CONNECTED";
      await log.save();
    }

    // Step 6: Analyze README depth to determine strategy
    const readmeAnalysis = analyzeReadmeDepth(existingReadme);
    console.log(`[AI Handler] README Analysis:`, {
      strategy: readmeAnalysis.strategy,
      reason: readmeAnalysis.reason,
      depthScore: readmeAnalysis.depthScore,
      needsFullCodebase: readmeAnalysis.needsFullCodebase,
    });

    // Step 7: Fetch files based on analysis strategy
    let changedFilesContent = [];
    let fullCodebase = [];

    if (readmeAnalysis.needsFullCodebase) {
      // README doesn't exist or is poor quality - scan entire repo
      console.log(
        `[AI Handler] Strategy: ${readmeAnalysis.strategy.toUpperCase()} - scanning entire repository`
      );

      try {
        const treeData = await getRepoTree(
          accessToken,
          repoOwner,
          repoName,
          defaultBranch
        );

        // Get important files from the repo
        const importantFiles = getImportantFiles(treeData.tree);

        // Fetch content of important files (limit to 25 for full scan)
        const filesToFetch = importantFiles.slice(0, 25);

        for (const filePath of filesToFetch) {
          try {
            const fileData = await getFileContent(
              accessToken,
              repoOwner,
              repoName,
              filePath,
              defaultBranch
            );

            if (fileData) {
              fullCodebase.push({
                path: filePath,
                content: truncateContent(fileData.content, 200), // More content for full analysis
                language: getFileLanguage(filePath),
              });
            }
          } catch (error) {
            console.warn(
              `[AI Handler] Could not fetch file ${filePath}: ${error.message}`
            );
          }
        }

        console.log(
          `[AI Handler] Scanned ${fullCodebase.length} important files from repository`
        );
      } catch (error) {
        console.error(
          `[AI Handler] Error scanning repository: ${error.message}`
        );
      }

      // Also fetch changed files for context
      const relevantFiles = commitData.files.filter(
        (file) =>
          shouldIncludeFile(file.filename) &&
          (file.status === "added" || file.status === "modified")
      );

      for (const file of relevantFiles.slice(0, 10)) {
        try {
          // Skip if already in fullCodebase
          if (fullCodebase.some((f) => f.path === file.filename)) continue;

          const fileData = await getFileContent(
            accessToken,
            repoOwner,
            repoName,
            file.filename,
            defaultBranch
          );

          if (fileData) {
            changedFilesContent.push({
              path: file.filename,
              content: truncateContent(fileData.content, 150),
              language: getFileLanguage(file.filename),
              status: file.status,
            });
          }
        } catch (error) {
          console.warn(
            `[AI Handler] Could not fetch changed file ${file.filename}: ${error.message}`
          );
        }
      }
    } else {
      // README is comprehensive - only fetch changed files (incremental update)
      console.log(
        `[AI Handler] Strategy: INCREMENTAL - fetching only changed files`
      );

      const relevantFiles = commitData.files.filter(
        (file) =>
          shouldIncludeFile(file.filename) &&
          (file.status === "added" || file.status === "modified")
      );

      // Limit to first 10 files for incremental updates
      const filesToFetch = relevantFiles.slice(0, 10);

      for (const file of filesToFetch) {
        try {
          const fileData = await getFileContent(
            accessToken,
            repoOwner,
            repoName,
            file.filename,
            defaultBranch
          );

          if (fileData) {
            changedFilesContent.push({
              path: file.filename,
              content: truncateContent(fileData.content, 100),
              language: getFileLanguage(file.filename),
              status: file.status,
            });
          }
        } catch (error) {
          console.warn(
            `[AI Handler] Could not fetch file ${file.filename}: ${error.message}`
          );
        }
      }

      console.log(
        `[AI Handler] Fetched ${changedFilesContent.length} changed files`
      );
    }

    // Step 8: Build context for Groq API
    console.log(`[AI Handler] Building context for README generation`);
    let context = buildReadmeContext({
      repoName,
      repoOwner,
      repoStructure,
      existingReadme,
      commitData,
      changedFilesContent,
      fullCodebase: readmeAnalysis.needsFullCodebase ? fullCodebase : undefined,
    });

    // Validate and optimize context
    const validation = validateContext(context);
    console.log(`[AI Handler] Context validation:`, validation);

    if (!validation.valid) {
      throw new Error(`Invalid context: ${validation.errors.join(", ")}`);
    }

    if (validation.warnings.length > 0) {
      console.warn(`[AI Handler] Context warnings:`, validation.warnings);
    }

    // Optimize if needed
    if (validation.estimatedTokens > 8000) {
      console.log(
        `[AI Handler] Optimizing context (${validation.estimatedTokens} tokens)`
      );
      context = optimizeContext(context, 8000);
    }

    // Step 8: Generate README using Groq API
    console.log(`[AI Handler] Calling Groq API to generate README`);
    const generatedReadme = await generateReadme(context);

    if (!generatedReadme || generatedReadme.trim().length === 0) {
      throw new Error("Groq API returned empty README");
    }

    console.log(
      `[AI Handler] Generated README (${generatedReadme.length} characters)`
    );

    // Step 9: Commit README back to repository
    console.log(`[AI Handler] Committing README to repository`);
    const commitMessage = "chore: auto-update README [skip ci]";

    const commitResult = await commitFile(
      accessToken,
      repoOwner,
      repoName,
      readmeFileName,
      generatedReadme,
      commitMessage,
      defaultBranch,
      existingReadmeSha
    );

    console.log(
      `[AI Handler] README committed successfully:`,
      commitResult.commit.sha
    );

    // Step 10: Update active repo metadata
    activeRepo.lastReadmeGeneratedAt = new Date();
    activeRepo.readmeGenerationCount =
      (activeRepo.readmeGenerationCount || 0) + 1;
    activeRepo.lastReadmeSha = commitResult.commit.sha;
    await activeRepo.save();

    console.log(
      `[AI Handler] ✓ README generation completed for ${repoFullName}`
    );

    // Update log to success and save commitId
    const successLog = await UserLogModel.findById(data.logId);
    if (successLog) {
      successLog.action = "README_GENERATION_SUCCESS";
      successLog.status = "success";
      successLog.commitId = commitResult.commit.sha;
      await successLog.save();
      console.log(`[AI Handler] Log updated with commitId: ${commitResult.commit.sha}`);
    }

    return {
      success: true,
      commitSha: commitResult.commit.sha,
      readmeLength: generatedReadme.length,
    };
  } catch (error) {
    console.error(
      `[AI Handler] ✗ Error generating README for ${repoFullName}:`,
      error.message
    );
    console.error(error.stack);

    // Update log to failed
    try {
      const errorLog = await UserLogModel.findById(data.logId);
      if (errorLog) {
        errorLog.action = "README_GENERATION_FAILED";
        errorLog.status = "failed";
        await errorLog.save();
      }
    } catch (logError) {
      console.error("Failed to update error log:", logError.message);
    }

    // Log error but don't throw - let BullMQ handle retries
    throw error;
  }
};

/**
 * Check if README is substantial and well-formed
 * @param {string} readme - README content
 * @returns {boolean} True if README is good quality
 */
function isReadmeSubstantial(readme) {
  if (!readme || readme.trim().length === 0) {
    return false;
  }

  // Check minimum length (at least 200 characters for a decent README)
  if (readme.length < 200) {
    return false;
  }

  // Check for common README sections (at least 2 should be present)
  const commonSections = [
    /##?\s*(about|overview|description|introduction)/i,
    /##?\s*(installation|install|setup|getting started)/i,
    /##?\s*(usage|how to use|examples)/i,
    /##?\s*(features|functionality)/i,
    /##?\s*(api|documentation|docs)/i,
    /##?\s*(contributing|contribution)/i,
    /##?\s*(license)/i,
  ];

  const sectionsFound = commonSections.filter((pattern) =>
    pattern.test(readme)
  ).length;

  // If it has at least 2 sections, consider it good
  if (sectionsFound >= 2) {
    return true;
  }

  // Check if it's just a placeholder or very basic
  const placeholderPatterns = [
    /^#\s*[\w-]+\s*$/m, // Just a title
    /TODO/i,
    /coming soon/i,
    /under construction/i,
    /work in progress/i,
  ];

  const hasPlaceholder = placeholderPatterns.some((pattern) =>
    pattern.test(readme)
  );

  // If it has placeholder text and few sections, it's not good
  if (hasPlaceholder && sectionsFound < 2) {
    return false;
  }

  // Check for code blocks or examples (indicates detailed documentation)
  const hasCodeBlocks = /```[\s\S]*?```/.test(readme);

  // If it has code blocks and reasonable length, it's probably good
  if (hasCodeBlocks && readme.length > 300) {
    return true;
  }

  // Default: if it's long enough and has some structure, consider it okay
  return readme.length > 500 && sectionsFound >= 1;
}

/**
 * Get important files from repository tree
 * @param {Array} tree - Repository tree
 * @returns {Array} Array of important file paths
 */
function getImportantFiles(tree) {
  const importantFiles = [];

  // Priority order for file types
  const priorities = {
    // Package/config files (highest priority)
    "package.json": 1,
    "package-lock.json": 1,
    "requirements.txt": 1,
    "setup.py": 1,
    "Cargo.toml": 1,
    "go.mod": 1,
    "pom.xml": 1,
    "build.gradle": 1,
    "composer.json": 1,

    // Main entry points
    "index.js": 2,
    "index.ts": 2,
    "main.js": 2,
    "main.ts": 2,
    "main.py": 2,
    "app.js": 2,
    "app.ts": 2,
    "server.js": 2,
    "server.ts": 2,

    // Config files
    ".env.example": 3,
    "config.js": 3,
    "config.json": 3,

    // Documentation
    "CHANGELOG.md": 4,
    "CONTRIBUTING.md": 4,
  };

  // Patterns for important directories
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

  // Categorize files
  const categorized = tree
    .filter((item) => item.type === "blob")
    .map((item) => {
      const filename = item.path.split("/").pop();
      const priority = priorities[filename] || 999;

      // Check if it matches important directory patterns
      const matchesPattern = importantDirPatterns.some((pattern) =>
        pattern.test(item.path)
      );

      return {
        path: item.path,
        priority,
        matchesPattern,
      };
    })
    .filter((item) => {
      // Include if it has a priority or matches a pattern
      return item.priority < 999 || item.matchesPattern;
    })
    .sort((a, b) => {
      // Sort by priority first, then by pattern match
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      if (a.matchesPattern && !b.matchesPattern) return -1;
      if (!a.matchesPattern && b.matchesPattern) return 1;
      return 0;
    });

  return categorized.map((item) => item.path);
}
