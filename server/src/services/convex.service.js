import { ConvexClient, ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

if (!process.env.CONVEX_URL) {
  console.warn(
    "[convex.service] CONVEX_URL is not set — Convex queries will fail.",
  );
}

const logsAddMessage = makeFunctionReference("logs:addLogMessage");
const client = new ConvexHttpClient(process.env.CONVEX_URL);

export function liveUpdate(sharedLogId, message) {
  if (!sharedLogId) return;
  ConvexClient.mutation(logsAddMessage, { logId: sharedLogId, message }).catch(
    (err) =>
      console.warn(
        "[cleanUpReadme] Convex log message failed (non-fatal):",
        err.message,
      ),
  );
}

export default client;
