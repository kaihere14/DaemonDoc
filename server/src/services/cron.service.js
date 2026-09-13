import cron from "node-cron";
import { enqueueStaleLogSweep } from "./staleLog.queue.js";
import { serverLog } from "../utils/logger.js";

// Same work as GET /cleanup, minus the HTTP round-trip to ourselves.
const STALE_LOG_SWEEP_SCHEDULE = "0 */12 * * *"; // 00:00 and 12:00 every day

export function startCronJobs() {
  cron.schedule(
    STALE_LOG_SWEEP_SCHEDULE,
    async () => {
      try {
        const jobId = await enqueueStaleLogSweep();
        serverLog.info("Scheduled stale log sweep enqueued", { jobId });
      } catch (error) {
        serverLog.error("Scheduled stale log sweep failed to enqueue", {
          detail: error.message,
        });
      }
    },
    { name: "stale-log-sweep" },
  );

  serverLog.info("Cron jobs started", {
    staleLogSweep: STALE_LOG_SWEEP_SCHEDULE,
  });
}
