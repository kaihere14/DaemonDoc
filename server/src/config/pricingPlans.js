/**
 * Single source of truth for all plan definitions.
 * Amounts are always in paise (₹1 = 100 paise).
 *
 * PRO plan limits — mirrors what is set on the User document when upgraded:
 *   reviewLimit:      20
 *   competitorLimit:  10
 *   activeRepoLimit:  null  (unlimited — enforced in code as no cap)
 *   planExpiry:       30 days + 4 buffer days from activation date
 */

export const PLAN_LIMITS = {
  free: {
    reviewLimit: 1,
    competitorLimit: 1,
    activeRepoLimit: 5,
  },
  pro: {
    reviewLimit: 20,
    competitorLimit: 10,
    activeRepoLimit: null, // unlimited
  },
};

// Grace buffer days added on top of the billing period
export const PLAN_EXPIRY_BUFFER_DAYS = 4;

export const SUBSCRIPTION_PLANS = {
  pro_monthly: {
    id: "pro_monthly",
    label: "Pro — Monthly",
    amount: 49900, // ₹499/month in paise
    currency: "INR",
    interval: "monthly",
    billingDays: 30,
  },
  pro_yearly: {
    id: "pro_yearly",
    label: "Pro — Yearly",
    amount: 399900, // ₹3999/year in paise (~33% savings)
    currency: "INR",
    interval: "yearly",
    billingDays: 365,
  },
};
