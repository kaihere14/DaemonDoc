import { liveUpdate } from "./convex.service.js";
import UserLogModel from "../schema/userLog.schema.js";

export async function recoverInterruptedCleanupLogs() {
  const interruptedLogs = await UserLogModel.find({
    action: "README_CLEANUP_STARTED",
    status: "ongoing",
  }).select("_id logId");

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
