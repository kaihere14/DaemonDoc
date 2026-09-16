import { describe, it, expect, vi } from "vitest";

// Mocks are reset inline at the top of each test rather than via a shared
// beforeEach — with this file's top-level-await dynamic import, a beforeEach
// hook that resets a mock used by a later rejects.toThrow() assertion causes
// the rejection to surface as an unhandled error instead of being caught by
// the assertion. Resetting inline sidesteps the ordering issue.

const githubGet = vi.fn();
const githubPut = vi.fn();
vi.mock("../../utils/githubApiClient.js", () => ({
  GITHUB_API_BASE: "https://api.github.com",
  githubGet: (...args) => githubGet(...args),
  githubPut: (...args) => githubPut(...args),
}));

const {
  getCommitDiff,
  getCommit,
  getRepoTree,
  getFileContent,
  commitFile,
  formatRepoTree,
  getFileLanguage,
  shouldIncludeFile,
  truncateContent,
} = await import("../github.service.js");

describe("formatRepoTree", () => {
  it("renders a nested tree, dropping ignored directories", () => {
    const tree = [
      { path: "src/index.js", type: "blob" },
      { path: "src/utils/a.js", type: "blob" },
      { path: "node_modules/pkg/index.js", type: "blob" },
    ];

    const result = formatRepoTree(tree, 3);

    expect(result).toContain("src/");
    expect(result).toContain("index.js");
    expect(result).not.toContain("node_modules");
  });

  it("respects maxDepth", () => {
    const tree = [{ path: "a/b/c/d.js", type: "blob" }];
    expect(formatRepoTree(tree, 1)).toBe("");
  });
});

describe("getFileLanguage", () => {
  it("delegates to the shared extension map", () => {
    expect(getFileLanguage("main.py")).toBe("python");
  });
});

describe("shouldIncludeFile", () => {
  it("accepts a relevant, case-insensitive extension", () => {
    expect(shouldIncludeFile("App.TSX")).toBe(true);
  });

  it("rejects an irrelevant extension", () => {
    expect(shouldIncludeFile("image.png")).toBe(false);
  });
});

describe("truncateContent", () => {
  it("returns content unchanged under the line limit", () => {
    expect(truncateContent("a\nb", 5)).toBe("a\nb");
  });

  it("truncates and appends a marker over the limit", () => {
    const content = Array.from({ length: 5 }, (_, i) => `l${i}`).join("\n");
    const result = truncateContent(content, 2);
    expect(result).toBe("l0\nl1\n\n... (truncated 3 lines)");
  });
});

describe("getCommitDiff", () => {
  it("normalizes a successful compare response", async () => {
    githubGet.mockReset();
    githubGet.mockResolvedValue({
      data: { files: [{ filename: "a.js" }], commits: [{}], total_commits: 1 },
    });

    const result = await getCommitDiff("token", "o", "r", "base", "head");
    expect(result).toEqual({
      files: [{ filename: "a.js" }],
      commits: [{}],
      totalCommits: 1,
    });
  });

  it("wraps a transport failure in a descriptive error", async () => {
    githubGet.mockReset();
    githubGet.mockRejectedValue(new Error("network fail"));
    await expect(
      getCommitDiff("token", "o", "r", "base", "head"),
    ).rejects.toThrow(/Failed to fetch commit diff/);
  });
});

describe("getCommit", () => {
  it("shapes the commit response", async () => {
    githubGet.mockReset();
    githubGet.mockResolvedValue({
      data: {
        sha: "abc",
        commit: { message: "msg", author: { name: "a" } },
        files: [],
        stats: { additions: 1 },
      },
    });

    const result = await getCommit("token", "o", "r", "abc");
    expect(result).toEqual({
      sha: "abc",
      message: "msg",
      author: { name: "a" },
      files: [],
      stats: { additions: 1 },
    });
  });
});

describe("getRepoTree", () => {
  it("resolves the branch's tree sha then fetches the recursive tree", async () => {
    githubGet.mockReset();
    githubGet
      .mockResolvedValueOnce({
        data: { commit: { commit: { tree: { sha: "tree-sha" } } } },
      })
      .mockResolvedValueOnce({
        data: { sha: "tree-sha", tree: [{ path: "a.js" }], truncated: false },
      });

    const result = await getRepoTree("token", "o", "r", "main");

    expect(result).toEqual({
      sha: "tree-sha",
      tree: [{ path: "a.js" }],
      truncated: false,
    });
    expect(githubGet).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("git/trees/tree-sha?recursive=1"),
      "token",
    );
  });
});

describe("getFileContent", () => {
  it("decodes base64 file content", async () => {
    githubGet.mockReset();
    githubGet.mockResolvedValue({
      data: {
        path: "a.js",
        sha: "sha1",
        size: 10,
        content: Buffer.from("hello").toString("base64"),
        encoding: "base64",
      },
    });

    const result = await getFileContent("token", "o", "r", "a.js", "main");
    expect(result.content).toBe("hello");
  });

  it("returns null for a 404 instead of throwing", async () => {
    githubGet.mockReset();
    githubGet.mockRejectedValue({ response: { status: 404 } });
    const result = await getFileContent(
      "token",
      "o",
      "r",
      "missing.js",
      "main",
    );
    expect(result).toBeNull();
  });

  it("still throws for a non-404 failure", async () => {
    githubGet.mockReset();
    githubGet.mockRejectedValue({ response: { status: 500 } });
    await expect(
      getFileContent("token", "o", "r", "a.js", "main"),
    ).rejects.toThrow(/Failed to fetch file content/);
  });
});

describe("commitFile", () => {
  it("base64-encodes content and includes sha only when updating", async () => {
    githubPut.mockReset();
    githubPut.mockResolvedValue({ data: { content: {}, commit: {} } });

    await commitFile(
      "token",
      "o",
      "r",
      "a.js",
      "hello",
      "commit msg",
      "main",
      "existing-sha",
    );

    const [, payload] = githubPut.mock.calls[0];
    expect(payload.content).toBe(Buffer.from("hello").toString("base64"));
    expect(payload.sha).toBe("existing-sha");
  });

  it("omits sha for a new file", async () => {
    githubPut.mockReset();
    githubPut.mockResolvedValue({ data: { content: {}, commit: {} } });
    await commitFile("token", "o", "r", "new.js", "hi", "msg", "main");
    const [, payload] = githubPut.mock.calls[0];
    expect(payload).not.toHaveProperty("sha");
  });
});
