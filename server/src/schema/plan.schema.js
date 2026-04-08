import { Schema, model } from "mongoose";

/**
 * Stores plan definitions including pricing and feature limits.
 * Prices are in paise (₹1 = 100 paise) to avoid float rounding bugs.
 * Edit documents in DB to update pricing without redeployment.
 */
const planSchema = new Schema(
  {
    // Unique identifier used in code e.g. "pro_monthly", "pro_yearly"
    planId: { type: String, required: true, unique: true },

    name: { type: String, required: true }, // "Pro Monthly"
    interval: {
      type: String,
      enum: ["free", "monthly", "yearly"],
      required: true,
    },

    // Amount in paise — 49900 = ₹499
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    // How many days of access this plan grants (used to compute planExpiry)
    billingDays: { type: Number, required: true },

    // Feature limits — null means unlimited
    reviewLimit: { type: Number, default: null },
    competitorLimit: { type: Number, default: null },
    activeRepoLimit: { type: Number, default: null },

    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Plan = model("Plan", planSchema);

export default Plan;
