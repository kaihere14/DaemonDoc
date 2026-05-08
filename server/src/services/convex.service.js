import { ConvexHttpClient } from "convex/browser";

if (!process.env.CONVEX_URL) {
  console.warn(
    "[convex.service] CONVEX_URL is not set — Convex queries will fail.",
  );
}

const client = new ConvexHttpClient(process.env.CONVEX_URL);

export default client;
