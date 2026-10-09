import { describe, it, expect, vi, beforeEach } from "vitest";

const activeRepoExists = vi.fn();
vi.mock("../../schema/activeRepo.js", () => ({
  default: { exists: (...args) => activeRepoExists(...args) },
}));

// findOne is called twice per state read: first for the earliest settled
// run, then for the latest run of any status.
const userLogFindOne = vi.fn();
vi.mock("../../schema/userLog.schema.js", () => ({
  default: {
    findOne: (...args) => {
      const result = userLogFindOne(...args);
      return { sort: () => ({ lean: async () => result }) };
    },
  },
}));

const { getOnboardingState, allStepsDone } =
  await import("../onboarding.service.js");

const newUser = (onboarding = {}) => ({
  _id: "user-1",
  preferredCommitType: "direct",
  onboarding: { startedAt: new Date("2026-10-10"), ...onboarding },
});

const run = (status, extra = {}) => ({
  logId: `log-${status}`,
  status,
  repoName: "repo",
  repoOwner: "owner",
  commitId: status === "success" ? "abc123" : null,
  ...extra,
});

beforeEach(() => {
  activeRepoExists.mockReset();
  userLogFindOne.mockReset();
});

describe("getOnboardingState", () => {
  it("stays inactive for accounts created before onboarding shipped", async () => {
    const state = await getOnboardingState({ _id: "old", onboarding: {} });

    expect(state).toEqual({ active: false });
    expect(activeRepoExists).not.toHaveBeenCalled();
  });

  it("stays inactive once completed or dismissed", async () => {
    expect(
      await getOnboardingState(newUser({ completedAt: new Date() })),
    ).toEqual({ active: false });
    expect(
      await getOnboardingState(newUser({ dismissedAt: new Date() })),
    ).toEqual({ active: false });
  });

  it("starts with every step open for a brand-new user", async () => {
    activeRepoExists.mockResolvedValue(null);
    userLogFindOne.mockReturnValue(null);

    const state = await getOnboardingState(newUser());

    expect(state).toEqual({
      active: true,
      snoozed: false,
      preferredCommitType: "direct",
      steps: { commitType: false, firstRepo: false, firstReadme: false },
      firstReadme: null,
    });
    expect(allStepsDone(state)).toBe(false);
  });

  it("only counts a repository that is still turned on", async () => {
    activeRepoExists.mockResolvedValue(null);
    userLogFindOne.mockReturnValue(null);

    await getOnboardingState(newUser());

    expect(activeRepoExists).toHaveBeenCalledWith({
      userId: "user-1",
      active: true,
    });
  });

  it("reports an in-progress first run without completing the step", async () => {
    activeRepoExists.mockResolvedValue({ _id: "repo" });
    userLogFindOne
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(run("ongoing"));

    const state = await getOnboardingState(
      newUser({ commitTypeConfirmedAt: new Date() }),
    );

    expect(state.steps).toEqual({
      commitType: true,
      firstRepo: true,
      firstReadme: false,
    });
    expect(state.firstReadme).toMatchObject({
      logId: "log-ongoing",
      status: "ongoing",
    });
  });

  it("keeps the first successful run even after a later failure", async () => {
    activeRepoExists.mockResolvedValue({ _id: "repo" });
    userLogFindOne
      .mockReturnValueOnce(run("success"))
      .mockReturnValueOnce(run("failed"));

    const state = await getOnboardingState(
      newUser({ commitTypeConfirmedAt: new Date() }),
    );

    expect(state.firstReadme).toMatchObject({
      status: "success",
      commitId: "abc123",
    });
    expect(allStepsDone(state)).toBe(true);
  });

  it("counts a skipped run as a finished first README", async () => {
    activeRepoExists.mockResolvedValue({ _id: "repo" });
    userLogFindOne
      .mockReturnValueOnce(run("skipped"))
      .mockReturnValueOnce(run("skipped"));

    const state = await getOnboardingState(newUser());

    expect(state.steps.firstReadme).toBe(true);
  });

  it("reflects a snooze", async () => {
    activeRepoExists.mockResolvedValue(null);
    userLogFindOne.mockReturnValue(null);

    const state = await getOnboardingState(newUser({ snoozedAt: new Date() }));

    expect(state.snoozed).toBe(true);
  });
});
