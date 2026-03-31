import User from "../schema/user.schema.js";

const USAGE_PERIOD_DAYS = 30;

/**
 * For yearly plans only: roll the usage period forward if 30 days have passed.
 * Monthly plans do NOT reset — their quota covers the full 30+4 day billing period.
 * Returns the (possibly updated) user document.
 */
const rollPeriodIfExpired = async (user) => {
  // Monthly plan or free — never reset mid-period
  if (user.planInterval !== "yearly") return user;

  if (!user.usagePeriodStart) {
    return User.findByIdAndUpdate(
      user._id,
      { $set: { usagePeriodStart: new Date(), reviewsUsed: 0, competitorAnalysesUsed: 0 } },
      { new: true },
    );
  }

  const periodStartMs = new Date(user.usagePeriodStart).getTime();
  const periodLengthMs = USAGE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();

  if (now - periodStartMs >= periodLengthMs) {
    // Roll the period start forward by however many full 30-day blocks have passed
    const periodsElapsed = Math.floor((now - periodStartMs) / periodLengthMs);
    const newPeriodStart = new Date(periodStartMs + periodsElapsed * periodLengthMs);

    return User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          usagePeriodStart: newPeriodStart,
          reviewsUsed: 0,
          competitorAnalysesUsed: 0,
        },
      },
      { new: true },
    );
  }

  return user;
};

/**
 * Check whether the user can perform an action, and if so atomically
 * increment the usage counter.
 *
 * @param {string} userId
 * @param {"review"|"competitor"} type
 * @returns {{ allowed: boolean, used: number, limit: number, resetAt: Date }}
 */
export const checkAndIncrementUsage = async (userId, type) => {
  let user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Roll forward if the 30-day period has expired
  user = await rollPeriodIfExpired(user);

  const usedField = type === "review" ? "reviewsUsed" : "competitorAnalysesUsed";
  const limitField = type === "review" ? "reviewLimit" : "competitorLimit";

  const limit = user[limitField] ?? 1;
  const used = user[usedField] ?? 0;

  if (used >= limit) {
    const resetAt = new Date(
      new Date(user.usagePeriodStart).getTime() + USAGE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    );
    return { allowed: false, used, limit, resetAt };
  }

  // Atomically increment — findOneAndUpdate with condition guards race conditions
  const updated = await User.findOneAndUpdate(
    { _id: userId, [usedField]: { $lt: limit } },
    { $inc: { [usedField]: 1 } },
    { new: true },
  );

  if (!updated) {
    // Race condition — another request beat us to the last slot
    const resetAt = new Date(
      new Date(user.usagePeriodStart).getTime() + USAGE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    );
    return { allowed: false, used: limit, limit, resetAt };
  }

  return {
    allowed: true,
    used: updated[usedField],
    limit,
    resetAt: new Date(
      new Date(updated.usagePeriodStart).getTime() + USAGE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    ),
  };
};

/**
 * Get current usage summary for a user without incrementing.
 * Also rolls the period forward if expired.
 */
export const getUsageSummary = async (userId) => {
  let user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user = await rollPeriodIfExpired(user);

  // For yearly plans: resetAt is 30 days from period start.
  // For monthly plans: quota covers the full billing period — show plan expiry instead.
  let resetAt;
  if (user.planInterval === "yearly" && user.usagePeriodStart) {
    resetAt = new Date(
      new Date(user.usagePeriodStart).getTime() + USAGE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    );
  } else {
    resetAt = user.planExpiry ?? null;
  }

  return {
    planInterval: user.planInterval ?? "free",
    reviews: {
      used: user.reviewsUsed ?? 0,
      limit: user.reviewLimit ?? 1,
      resetAt,
    },
    competitor: {
      used: user.competitorAnalysesUsed ?? 0,
      limit: user.competitorLimit ?? 1,
      resetAt,
    },
    usagePeriodStart: user.usagePeriodStart ?? null,
    resetAt,
  };
};
