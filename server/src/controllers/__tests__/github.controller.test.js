import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";

vi.mock("../../services/convex.service.js", () => ({
  liveUpdate: vi.fn(),
}));

const userFindById = vi.fn();
vi.mock("../../schema/user.schema.js", () => ({
  default: { findById: (...args) => userFindById(...args) },
}));

const activeRepoFindOne = vi.fn();
const activeRepoFind = vi.fn();
const activeRepoUpdateOne = vi.fn();
vi.mock("../../schema/activeRepo.js", () => ({
  default: {
    findOne: (...args) => activeRepoFindOne(...args),
    find: (...args) => activeRepoFind(...args),
    updateOne: (...args) => activeRepoUpdateOne(...args),
  },
}));

const readmeQueueAdd = vi.fn();
const cleanUpQueueAdd = vi.fn();
vi.mock("../../utils/git.worker.js", () => ({
  readmeQueue: { add: (...args) => readmeQueueAdd(...args) },
  cleanUpQueue: { add: (...args) => cleanUpQueueAdd(...args) },
}));

const githubGet = vi.fn();
const githubPost = vi.fn();
const githubDelete = vi.fn();
vi.mock("../../utils/githubApiClient.js", () => ({
  GITHUB_API_BASE: "https://api.github.com",
  githubGet: (...args) => githubGet(...args),
  githubPost: (...args) => githubPost(...args),
  githubDelete: (...args) => githubDelete(...args),
}));

const redisDel = vi.fn();
vi.mock("../../utils/redis.js", () => ({
  redis: { del: (...args) => redisDel(...args), get: vi.fn(), set: vi.fn() },
}));

const decrypt = vi.fn(() => "decrypted-token");
vi.mock("../oauthcontroller.js", () => ({
  decrypt: (...args) => decrypt(...args),
}));

const {
  verifyGithubSignature,
  getGithubRepos,
  addRepoActivity,
  githubWebhookHandler,
} = await import("../github.controller.js");

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

function signedBody(payload, secret = process.env.GITHUB_WEBHOOK_SECRET) {
  const body = Buffer.from(JSON.stringify(payload));
  const digest =
    "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
  return { body, digest };
}

describe("verifyGithubSignature", () => {
  it("rejects a non-Buffer body", () => {
    expect(verifyGithubSignature({ body: "{}", headers: {} })).toBe(false);
  });

  it("rejects a missing signature header", () => {
    expect(
      verifyGithubSignature({ body: Buffer.from("{}"), headers: {} }),
    ).toBe(false);
  });

  it("rejects a signature computed with the wrong secret", () => {
    const { body } = signedBody({ a: 1 }, "wrong-secret");
    expect(
      verifyGithubSignature({
        body,
        headers: { "x-hub-signature-256": "sha256=deadbeef" },
      }),
    ).toBe(false);
  });

  it("accepts a signature computed with the real webhook secret", () => {
    const { body, digest } = signedBody({ a: 1 });
    expect(
      verifyGithubSignature({
        body,
        headers: { "x-hub-signature-256": digest },
      }),
    ).toBe(true);
  });
});

describe("getGithubRepos", () => {
  beforeEach(() => {
    userFindById.mockReset();
    githubGet.mockReset();
    activeRepoFind.mockReset();
  });

  it("404s when the user has no stored GitHub access token", async () => {
    userFindById.mockResolvedValue(null);
    const res = mockRes();

    await getGithubRepos({ userId: "u1" }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("lists non-fork, push-capable repos and marks which are already active", async () => {
    userFindById.mockResolvedValue({ githubAccessToken: { iv: "i" } });
    githubGet.mockResolvedValue({
      data: [
        {
          id: 1,
          name: "a",
          full_name: "o/a",
          private: false,
          owner: { login: "o" },
          default_branch: "main",
          fork: false,
          permissions: { push: true, admin: true },
        },
        {
          id: 2,
          name: "forked",
          full_name: "o/forked",
          fork: true,
          permissions: { push: true },
        },
        {
          id: 3,
          name: "no-push",
          full_name: "o/no-push",
          fork: false,
          permissions: { push: false },
        },
      ],
    });
    activeRepoFind.mockResolvedValue([{ repoId: 1, active: true }]);

    const res = mockRes();
    await getGithubRepos({ userId: "u1" }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const { reposData } = res.json.mock.calls[0][0];
    expect(reposData).toHaveLength(1);
    expect(reposData[0]).toMatchObject({
      id: 1,
      activated: true,
      canActivate: true,
    });
  });
});

describe("addRepoActivity", () => {
  beforeEach(() => {
    userFindById.mockReset();
    activeRepoFindOne.mockReset();
    githubPost.mockReset();
    githubGet.mockReset();
    readmeQueueAdd.mockReset();
    redisDel.mockReset();
  });

  it("rejects a request missing required repository fields", async () => {
    const res = mockRes();
    await addRepoActivity({ body: {}, userId: "u1" }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("400s when the repository is already active", async () => {
    userFindById.mockResolvedValue({ githubAccessToken: { iv: "i" } });
    activeRepoFindOne.mockResolvedValue({ active: true });

    const res = mockRes();
    await addRepoActivity(
      {
        body: {
          repoId: 1,
          repoName: "a",
          repoFullName: "o/a",
          repoOwner: "o",
          defaultBranch: "main",
        },
        userId: "u1",
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("githubWebhookHandler", () => {
  beforeEach(() => {
    activeRepoFindOne.mockReset();
    readmeQueueAdd.mockReset();
  });

  function pushRequest(payload, headers = {}) {
    const { body, digest } = signedBody(payload);
    return {
      body,
      headers: {
        "x-hub-signature-256": digest,
        "x-github-event": "push",
        ...headers,
      },
    };
  }

  it("401s on an invalid signature", async () => {
    const res = mockRes();
    await githubWebhookHandler({ body: Buffer.from("{}"), headers: {} }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("ignores non-push events", async () => {
    const req = pushRequest({}, { "x-github-event": "issues" });
    const res = mockRes();
    await githubWebhookHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Event ignored");
  });

  it("no-ops when the repository is not active", async () => {
    activeRepoFindOne.mockResolvedValue(null);
    const req = pushRequest({
      repository: { id: 1 },
      after: "sha1",
      ref: "refs/heads/main",
    });
    const res = mockRes();
    await githubWebhookHandler(req, res);
    expect(res.send).toHaveBeenCalledWith("Repo not active");
  });

  it("ignores a push to a non-default branch", async () => {
    activeRepoFindOne.mockResolvedValue({ defaultBranch: "main" });
    const req = pushRequest({
      repository: { id: 1 },
      after: "sha1",
      ref: "refs/heads/feature",
    });
    const res = mockRes();
    await githubWebhookHandler(req, res);
    expect(res.send).toHaveBeenCalledWith("Non-default branch ignored");
    expect(readmeQueueAdd).not.toHaveBeenCalled();
  });

  it("ignores a bot commit carrying the auto-update marker", async () => {
    activeRepoFindOne.mockResolvedValue({ defaultBranch: "main" });
    const req = pushRequest({
      repository: { id: 1 },
      after: "sha1",
      ref: "refs/heads/main",
      head_commit: { message: "auto-update README" },
    });
    const res = mockRes();
    await githubWebhookHandler(req, res);
    expect(res.send).toHaveBeenCalledWith("Bot commit ignored");
  });

  it("skips a commit that was already processed", async () => {
    activeRepoFindOne.mockResolvedValue({
      defaultBranch: "main",
      lastProcessedSha: "sha1",
    });
    const req = pushRequest({
      repository: { id: 1 },
      after: "sha1",
      ref: "refs/heads/main",
    });
    const res = mockRes();
    await githubWebhookHandler(req, res);
    expect(res.send).toHaveBeenCalledWith("Already processed");
    expect(readmeQueueAdd).not.toHaveBeenCalled();
  });

  it("queues README generation for a new commit on the default branch", async () => {
    const activeRepo = {
      userId: "u1",
      repoId: 1,
      repoName: "a",
      repoFullName: "o/a",
      repoOwner: "o",
      defaultBranch: "main",
      lastProcessedSha: "old-sha",
      save: vi.fn().mockResolvedValue(undefined),
    };
    activeRepoFindOne.mockResolvedValue(activeRepo);

    const req = pushRequest({
      repository: { id: 1 },
      after: "new-sha",
      ref: "refs/heads/main",
    });
    const res = mockRes();
    await githubWebhookHandler(req, res);

    expect(readmeQueueAdd).toHaveBeenCalledWith(
      "generate-readme",
      expect.objectContaining({ commitSha: "new-sha", repoId: 1 }),
    );
    expect(activeRepo.lastProcessedSha).toBe("new-sha");
    expect(activeRepo.save).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith("Webhook processed");
  });
});
