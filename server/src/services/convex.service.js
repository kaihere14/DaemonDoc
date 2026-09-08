import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { convexLog as log } from "../utils/logger.js";

if (!process.env.CONVEX_URL) {
  log.warn("CONVEX_URL is not set — live updates will fail");
}

const client = new ConvexHttpClient(process.env.CONVEX_URL);
const logsAddMessage = makeFunctionReference("logs:addLogMessage");

export function liveUpdate(sharedLogId, message) {
  if (!sharedLogId) return;
  client
    .mutation(logsAddMessage, { logId: sharedLogId, message })
    .catch((err) =>
      log.warn("Live update failed (non-fatal)", {
        logId: sharedLogId,
        detail: err.message,
      }),
    );
}

export default client;
