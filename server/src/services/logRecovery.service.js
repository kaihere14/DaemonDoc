import { makeFunctionReference } from "convex/server";
import convexClient from "./convex.service.js";
import UserLogModel from "../schema/userLog.schema.js";

const logsUpdate = makeFunctionReference("logs:updateLog");
const logsAddMessage = makeFunctionReference("logs:addLogMessage");

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
      convexClient.mutation(logsAddMessage, {
        logId: log.logId,
        message: "Cleanup interrupted because the backend restarted",
      }),
      convexClient.mutation(logsUpdate, {
        logId: log.logId,
        status: "failed",
      }),
    ]),
  );

  return interruptedLogs.length;
}
