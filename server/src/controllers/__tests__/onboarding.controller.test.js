import { describe, it, expect, vi, beforeEach } from "vitest";

const userFindById = vi.fn();
const userFindByIdAndUpdate = vi.fn();
vi.mock("../../schema/user.schema.js", () => ({
  default: {
    findById: (...args) => ({ select: async () => userFindById(...args) }),
    findByIdAndUpdate: (...args) => ({
      select: async () => userFindByIdAndUpdate(...args),
    }),
  },
}));

const getOnboardingState = vi.fn();
vi.mock("../../services/onboarding.service.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getOnboardingState: (...args) => getOnboardingState(...args),
  };
});

const { getOnboarding, updateOnboarding } =
  await import("../onboarding.controller.js");

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

const activeState = (steps = {}) => ({
  active: true,
  snoozed: false,
  preferredCommitType: "direct",
  steps: { commitType: true, firstRepo: true, firstReadme: true, ...steps },
  firstReadme: null,
});

beforeEach(() => {
  userFindById.mockReset();
  userFindByIdAndUpdate.mockReset();
  getOnboardingState.mockReset();
});

describe("getOnboarding", () => {
  it("returns the derived state", async () => {
    userFindById.mockResolvedValue({ _id: "u1" });
    getOnboardingState.mockResolvedValue({ active: false });
    const res = mockRes();

    await getOnboarding({ userId: "u1" }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ onboarding: { active: false } });
  });

  it("404s for a missing user", async () => {
    userFindById.mockResolvedValue(null);
    const res = mockRes();

    await getOnboarding({ userId: "gone" }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("updateOnboarding", () => {
  it("rejects unknown events", async () => {
    const res = mockRes();

    await updateOnboarding({ userId: "u1", body: { event: "skip" } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(userFindById).not.toHaveBeenCalled();
  });

  it("refuses events once onboarding is over", async () => {
    userFindById.mockResolvedValue({ _id: "u1" });
    getOnboardingState.mockResolvedValue({ active: false });
    const res = mockRes();

    await updateOnboarding({ userId: "u1", body: { event: "snoozed" } }, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(userFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("refuses to complete while a step is still open", async () => {
    userFindById.mockResolvedValue({ _id: "u1" });
    getOnboardingState.mockResolvedValue(activeState({ firstReadme: false }));
    const res = mockRes();

    await updateOnboarding({ userId: "u1", body: { event: "completed" } }, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(userFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("stamps a snooze and returns the new state", async () => {
    userFindById.mockResolvedValue({ _id: "u1" });
    userFindByIdAndUpdate.mockResolvedValue({ _id: "u1" });
    getOnboardingState
      .mockResolvedValueOnce(activeState())
      .mockResolvedValueOnce({ ...activeState(), snoozed: true });
    const res = mockRes();

    await updateOnboarding({ userId: "u1", body: { event: "snoozed" } }, res);

    const [, update] = userFindByIdAndUpdate.mock.calls[0];
    expect(update.$set["onboarding.snoozedAt"]).toBeInstanceOf(Date);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].onboarding.snoozed).toBe(true);
  });

  it("clears the snooze on resume", async () => {
    userFindById.mockResolvedValue({ _id: "u1" });
    userFindByIdAndUpdate.mockResolvedValue({ _id: "u1" });
    getOnboardingState.mockResolvedValue(activeState());
    const res = mockRes();

    await updateOnboarding({ userId: "u1", body: { event: "resumed" } }, res);

    const [, update] = userFindByIdAndUpdate.mock.calls[0];
    expect(update.$set).toEqual({ "onboarding.snoozedAt": null });
  });

  it("completes when every step is done", async () => {
    userFindById.mockResolvedValue({ _id: "u1" });
    userFindByIdAndUpdate.mockResolvedValue({ _id: "u1" });
    getOnboardingState
      .mockResolvedValueOnce(activeState())
      .mockResolvedValueOnce({ active: false });
    const res = mockRes();

    await updateOnboarding({ userId: "u1", body: { event: "completed" } }, res);

    const [, update] = userFindByIdAndUpdate.mock.calls[0];
    expect(update.$set["onboarding.completedAt"]).toBeInstanceOf(Date);
    expect(res.json).toHaveBeenCalledWith({ onboarding: { active: false } });
  });
});
