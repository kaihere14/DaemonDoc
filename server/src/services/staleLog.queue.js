import { Queue, Worker } from "bullmq";
import UserLogModel from "../schema/userLog.schema.js";
import { liveUpdate } from "./convex.service.js";
import { redis, readmeConnection as connection } from "../utils/redis.js";
import { queueLog, workerLog } from "../utils/logger.js";

const STALE_LOG_QUEUE_NAME = "stale-log-cleanup";
const STALE_AFTER_MS = 20 * 60 * 1000;
const staleLog = workerLog.child({ job: "stale-log-cleanup" });

export const staleLogQueue = new Queue(STALE_LOG_QUEUE_NAME, { connection });

// Marks README generations that have been `ongoing` for longer than
// STALE_AFTER_MS as failed. A generation that genuinely runs this long has
// almost certainly lost its worker (crash, OOM, killed pod), so the row would
// otherwise stay `ongoing` forever and skew the admin analytics.
export async function failStaleGenerationLogs() {
  const cutoff = new Date(Date.now() - STALE_AFTER_MS);

  const staleLogs = await UserLogModel.find({
    action: "README_GENERATION_STARTED",
    status: "ongoing",
    createdAt: { $lt: cutoff },
  }).select("_id logId repoOwner repoName");

  if (staleLogs.length === 0) {
    return 0;
  }

  await UserLogModel.updateMany(
    { _id: { $in: staleLogs.map((log) => log._id) } },
    {
      $set: {
        action: "README_GENERATION_FAILED",
        status: "failed",
      },
    },
  );

  await redis.del("admin_analytics");

  for (const log of staleLogs) {
    liveUpdate(
      log.logId,
      "README generation marked failed — no progress for over 20 minutes",
    );
  }

  return staleLogs.length;
}

// Single worker: the sweep is a whole-collection query, so running two at once
// would only race on the same rows.
new Worker(
  STALE_LOG_QUEUE_NAME,
  async (job) => {
    staleLog.info("Stale log sweep started", { jobId: job.id });
    const failedCount = await failStaleGenerationLogs();
    staleLog.info("Stale log sweep finished", {
      jobId: job.id,
      failedCount,
    });
    return { failedCount };
  },
  {
    connection,
    concurrency: 1,
  },
);

// A fixed jobId collapses repeated requests into one pending sweep — BullMQ
// ignores an add whose id is already waiting or active.
export async function enqueueStaleLogSweep() {
  const job = await staleLogQueue.add(
    "sweep",
    { requestedAt: new Date().toISOString() },
    {
      jobId: "stale-log-sweep",
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      // Finished jobs must be removed right away: BullMQ ignores an add whose
      // jobId still exists in any set, so a retained completed/failed sweep
      // would block every later request until it aged out. Booleans are only
      // accepted here, not in worker options.
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
  queueLog.info("Stale log sweep enqueued", { jobId: job.id });
  return job.id;
}
