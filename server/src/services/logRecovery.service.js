import { liveUpdate } from "./convex.service.js";
import UserLogModel from "../schema/userLog.schema.js";
import { cleanUpQueue } from "../utils/git.worker.js";

// The worker starts consuming as soon as git.worker.js is imported, which
// happens before this runs. A job that stalled on the previous shutdown is
// re-queued and retried, so its log is legitimately `ongoing` again — only
// logs with no job left behind them were actually interrupted.
async function getLogIdsStillQueued() {
  const jobs = await cleanUpQueue.getJobs([
    "waiting",
    "waiting-children",
    "prioritized",
    "delayed",
    "paused",
    "active",
  ]);

  return new Set(
    jobs.map((job) => job?.data?.sharedLogId).filter((logId) => Boolean(logId)),
  );
}

export async function recoverInterruptedCleanupLogs() {
  const ongoingLogs = await UserLogModel.find({
    action: "README_CLEANUP_STARTED",
    status: "ongoing",
  }).select("_id logId");

  if (ongoingLogs.length === 0) {
    return 0;
  }

  const stillQueued = await getLogIdsStillQueued();
  const interruptedLogs = ongoingLogs.filter(
    (log) => !stillQueued.has(log.logId),
  );

  if (interruptedLogs.length === 0) {
    return 0;
  }

  await UserLogModel.updateMany(
    {
      _id: { $in: interruptedLogs.map((log) => log._id) },
    },
    {
      $set: {
        action: "README_CLEANUP_FAILED",
        status: "failed",
      },
    },
  );

  await Promise.allSettled(
    interruptedLogs.flatMap((log) => [
      liveUpdate(
        log.logId,
        "Cleanup interrupted because the backend restarted",
      ),
    ]),
  );

  return interruptedLogs.length;
}
