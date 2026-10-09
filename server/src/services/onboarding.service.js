import ActiveRepo from "../schema/activeRepo.js";
import UserLogModel from "../schema/userLog.schema.js";

const README_GENERATION_ACTIONS = [
  "README_GENERATION_STARTED",
  "README_GENERATION_SUCCESS",
  "README_GENERATION_SKIPPED",
  "README_GENERATION_FAILED",
];

// A skipped run means the README already covered the repo, which is as good
// an outcome as a fresh commit for someone checking that DaemonDoc works.
const SETTLED_RUN_STATUSES = ["success", "skipped"];

export const ONBOARDING_EVENTS = [
  "snoozed",
  "resumed",
  "dismissed",
  "completed",
];

const summariseRun = (run) =>
  run
    ? {
        logId: run.logId,
        status: run.status,
        repoName: run.repoName,
        repoOwner: run.repoOwner ?? null,
        commitId: run.commitId ?? null,
      }
    : null;

/**
 * The checklist only stores what it cannot see elsewhere. Whether a repo is
 * on and whether a README has run are read from the repos and logs, so the
 * steps can never disagree with what actually happened.
 */
export async function getOnboardingState(user) {
  const onboarding = user.onboarding ?? {};

  if (
    !onboarding.startedAt ||
    onboarding.completedAt ||
    onboarding.dismissedAt
  ) {
    return { active: false };
  }

  const logUserId = String(user._id);

  // Only a repo that is on right now counts: the step promises that pushes
  // reach DaemonDoc, which stops being true once every repo is turned off.
  const [enabledRepo, settledRun, latestRun] = await Promise.all([
    ActiveRepo.exists({ userId: user._id, active: true }),
    UserLogModel.findOne({
      userId: logUserId,
      action: { $in: README_GENERATION_ACTIONS },
      status: { $in: SETTLED_RUN_STATUSES },
    })
      .sort({ createdAt: 1 })
      .lean(),
    UserLogModel.findOne({
      userId: logUserId,
      action: { $in: README_GENERATION_ACTIONS },
    })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const firstReadme = summariseRun(settledRun ?? latestRun);

  return {
    active: true,
    snoozed: Boolean(onboarding.snoozedAt),
    preferredCommitType: user.preferredCommitType,
    steps: {
      commitType: Boolean(onboarding.commitTypeConfirmedAt),
      firstRepo: Boolean(enabledRepo),
      firstReadme: SETTLED_RUN_STATUSES.includes(firstReadme?.status),
    },
    firstReadme,
  };
}

export const allStepsDone = (state) =>
  state.active && Object.values(state.steps).every(Boolean);
