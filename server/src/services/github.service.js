import {
  GITHUB_API_BASE,
  githubGet,
  githubPut,
} from "../utils/githubApiClient.js";
import { getLanguageFromExtension } from "../utils/langMap.js";

/**
 * Get commit diff between two commits
 * @param {string} accessToken - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} baseSha - Base commit SHA
 * @param {string} headSha - Head commit SHA
 * @returns {Promise<Object>} Commit comparison data
 */
export async function getCommitDiff(
  accessToken,
  owner,
  repo,
  baseSha,
  headSha,
) {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/compare/${baseSha}...${headSha}`;
    const response = await githubGet(url, accessToken);

    return {
      files: response.data.files || [],
      commits: response.data.commits || [],
      totalCommits: response.data.total_commits || 0,
    };
  } catch (error) {
    console.error("Error fetching commit diff:", error.message);
    throw new Error(`Failed to fetch commit diff: ${error.message}`);
  }
}

/**
 * Get single commit details
 * @param {string} accessToken - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} sha - Commit SHA
 * @returns {Promise<Object>} Commit data
 */
export async function getCommit(accessToken, owner, repo, sha) {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`;
    const response = await githubGet(url, accessToken);

    return {
      sha: response.data.sha,
      message: response.data.commit.message,
      author: response.data.commit.author,
      files: response.data.files || [],
      stats: response.data.stats,
    };
  } catch (error) {
    console.error("Error fetching commit:", error.message);
    throw new Error(`Failed to fetch commit: ${error.message}`);
  }
}

/**
 * Get repository file tree structure
 * @param {string} accessToken - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name
 * @returns {Promise<Object>} Repository tree
 */
export async function getRepoTree(accessToken, owner, repo, branch) {
  try {
    // First get the branch to get the tree SHA
    const branchUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches/${branch}`;
    const branchResponse = await githubGet(branchUrl, accessToken);
    const treeSha = branchResponse.data.commit.commit.tree.sha;

    // Get the tree recursively
    const treeUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`;
    const treeResponse = await githubGet(treeUrl, accessToken);

    return {
      sha: treeResponse.data.sha,
      tree: treeResponse.data.tree || [],
      truncated: treeResponse.data.truncated || false,
    };
  } catch (error) {
    console.error("Error fetching repo tree:", error.message);
    throw new Error(`Failed to fetch repo tree: ${error.message}`);
  }
}

/**
 * Get file content from repository
 * @param {string} accessToken - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - File path
 * @param {string} branch - Branch name
 * @returns {Promise<Object>} File content and metadata
 */
export async function getFileContent(accessToken, owner, repo, path, branch) {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const response = await githubGet(url, accessToken);

    // Decode base64 content
    const content = Buffer.from(response.data.content, "base64").toString(
      "utf-8",
    );

    return {
      path: response.data.path,
      sha: response.data.sha,
      size: response.data.size,
      content: content,
      encoding: response.data.encoding,
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // File doesn't exist
    }
    console.error(`Error fetching file content (${path}):`, error.message);
    throw new Error(`Failed to fetch file content: ${error.message}`);
  }
}

/**
 * Commit a file to repository
 * @param {string} accessToken - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - File path
 * @param {string} content - File content
 * @param {string} message - Commit message
 * @param {string} branch - Branch name
 * @param {string} sha - Current file SHA (for updates, optional for new files)
 * @returns {Promise<Object>} Commit response
 */
export async function commitFile(
  accessToken,
  owner,
  repo,
  path,
  content,
  message,
  branch,
  sha = null,
) {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;

    // Encode content to base64
    const encodedContent = Buffer.from(content).toString("base64");

    const payload = {
      message: message,
      content: encodedContent,
      branch: branch,
    };

    // Include SHA if updating existing file
    if (sha) {
      payload.sha = sha;
    }

    const response = await githubPut(url, payload, accessToken);

    return {
      content: response.data.content,
      commit: response.data.commit,
    };
  } catch (error) {
    console.error(`Error committing file (${path}):`, error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    throw new Error(`Failed to commit file: ${error.message}`);
  }
}

/**
 * Format repository tree into a readable structure
 * @param {Array} tree - Array of tree items
 * @param {number} maxDepth - Maximum depth to display (default: 3)
 * @returns {string} Formatted tree structure
 */
export function formatRepoTree(tree, maxDepth = 3) {
  // Filter out common directories to ignore
  const ignorePatterns = [
    /^node_modules\//,
    /^\.git\//,
    /^dist\//,
    /^build\//,
    /^coverage\//,
    /^\.next\//,
    /^\.cache\//,
    /^__pycache__\//,
    /^venv\//,
    /^\.venv\//,
  ];

  const filteredTree = tree.filter((item) => {
    return !ignorePatterns.some((pattern) => pattern.test(item.path));
  });

  // Build tree structure
  const structure = {};

  filteredTree.forEach((item) => {
    const parts = item.path.split("/");
    const depth = parts.length;

    if (depth > maxDepth) return;

    let current = structure;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] =
          index === parts.length - 1 && item.type === "blob" ? null : {};
      }
      if (current[part] !== null) {
        current = current[part];
      }
    });
  });

  // Format structure as string
  function formatNode(node, prefix = "", isLast = true) {
    let result = "";
    const entries = Object.entries(node);

    entries.forEach(([key, value], index) => {
      const isLastEntry = index === entries.length - 1;
      const connector = isLastEntry ? "└── " : "├── ";
      const extension = value === null ? "" : "/";

      result += prefix + connector + key + extension + "\n";

      if (value !== null) {
        const newPrefix = prefix + (isLastEntry ? "    " : "│   ");
        result += formatNode(value, newPrefix, isLastEntry);
      }
    });

    return result;
  }

  return formatNode(structure);
}

/**
 * Determine file language based on extension
 * @param {string} filename - File name
 * @returns {string} Language identifier
 */
export function getFileLanguage(filename) {
  return getLanguageFromExtension(filename);
}

/**
 * Check if file should be included in context (filter by extension)
 * @param {string} filename - File name
 * @returns {boolean} Whether to include the file
 */
export function shouldIncludeFile(filename) {
  const relevantExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".cs",
    ".go",
    ".rs",
    ".rb",
    ".php",
    ".swift",
    ".kt",
    ".scala",
    ".sh",
    ".bash",
    ".yml",
    ".yaml",
    ".json",
    ".md",
    ".sql",
  ];

  return relevantExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
}

/**
 * Truncate file content if too large
 * @param {string} content - File content
 * @param {number} maxLines - Maximum number of lines (default: 100)
 * @returns {string} Truncated content
 */
export function truncateContent(content, maxLines = 100) {
  const lines = content.split("\n");

  if (lines.length <= maxLines) {
    return content;
  }

  const truncated = lines.slice(0, maxLines).join("\n");
  return truncated + `\n\n... (truncated ${lines.length - maxLines} lines)`;
}
