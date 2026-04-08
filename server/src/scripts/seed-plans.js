/**
 * Seed script: upserts plan definitions into MongoDB.
 * Safe to re-run — uses upsert so it won't duplicate.
 *
 * Run from server directory:
 *   node src/scripts/seed-plans.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });

import Plan from "../schema/plan.schema.js";

const PLANS = [
  {
    planId: "free",
    name: "Free",
    interval: "free",
    amount: 0,
    currency: "INR",
    billingDays: 0,
    reviewLimit: 1,
    competitorLimit: 1,
    activeRepoLimit: 5,
    active: true,
  },
  {
    planId: "pro_monthly",
    name: "Pro Monthly",
    interval: "monthly",
    amount: 49900, // ₹499
    currency: "INR",
    billingDays: 30,
    reviewLimit: 20,
    competitorLimit: 10,
    activeRepoLimit: null, // unlimited
    active: true,
  },
  {
    planId: "pro_yearly",
    name: "Pro Yearly",
    interval: "yearly",
    amount: 399900, // ₹3,999
    currency: "INR",
    billingDays: 365,
    reviewLimit: 20,
    competitorLimit: 10,
    activeRepoLimit: null, // unlimited
    active: true,
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  for (const plan of PLANS) {
    await Plan.findOneAndUpdate({ planId: plan.planId }, plan, {
      upsert: true,
      new: true,
    });
    console.log(
      `Upserted plan: ${plan.planId} (${plan.name}, ₹${plan.amount / 100})`,
    );
  }

  console.log("Seeding complete.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
