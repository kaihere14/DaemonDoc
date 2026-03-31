/**
 * Migration: Apply free plan defaults to all existing users
 *
 * What this does:
 *  1. Sets plan="free", reviewLimit=1, competitorLimit=1, activeRepoLimit=5
 *     on every user that doesn't already have a plan set.
 *  2. For users with more than 5 active repos, deactivates the excess ones
 *     (keeps the 5 most recently updated) and sets reposDeactivatedNotification=true
 *     so the dashboard can show them a one-time notice.
 *
 * HOW TO RUN (from the server directory):
 *   node --experimental-vm-modules src/scripts/migrate-free-plan.js
 *   or with tsx/ts-node if needed.
 *
 * SAFE TO RE-RUN: uses $setOnInsert / conditions so it won't overwrite
 * users that already have a plan.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });

import User from "../schema/user.schema.js";
import ActiveRepo from "../schema/activeRepo.js";

const FREE_PLAN_DEFAULTS = {
  plan: "free",
  reviewLimit: 1,
  competitorLimit: 1,
  activeRepoLimit: 5,
  planExpiry: null,
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // ── Step 1: Give all users without a plan the free plan defaults ──────────
  const updateResult = await User.updateMany(
    { plan: { $exists: false } },
    { $set: FREE_PLAN_DEFAULTS },
  );
  console.log(
    `Step 1: Set free plan on ${updateResult.modifiedCount} users (already-set users skipped).`,
  );

  // ── Step 2: Find users with >5 active repos ───────────────────────────────
  const usersWithExcessRepos = await ActiveRepo.aggregate([
    { $match: { active: true } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
    { $match: { count: { $gt: 5 } } },
  ]);

  console.log(
    `Step 2: Found ${usersWithExcessRepos.length} users with more than 5 active repos.`,
  );

  let deactivatedTotal = 0;

  for (const { _id: userId } of usersWithExcessRepos) {
    // Fetch all active repos sorted by lastUpdated desc (keep the 5 most recent)
    const repos = await ActiveRepo.find({ userId, active: true })
      .sort({ lastUpdated: -1 })
      .select("_id repoName lastUpdated");

    const toKeep = repos.slice(0, 5).map((r) => r._id);
    const toDeactivate = repos.slice(5).map((r) => r._id);

    if (toDeactivate.length === 0) continue;

    await ActiveRepo.updateMany(
      { _id: { $in: toDeactivate } },
      { $set: { active: false } },
    );

    await User.findByIdAndUpdate(userId, {
      $set: { reposDeactivatedNotification: true },
    });

    deactivatedTotal += toDeactivate.length;
    console.log(
      `  User ${userId}: deactivated ${toDeactivate.length} repos, kept ${toKeep.length}.`,
    );
  }

  console.log(`Step 2 complete: deactivated ${deactivatedTotal} repos total.`);
  console.log("Migration finished.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
