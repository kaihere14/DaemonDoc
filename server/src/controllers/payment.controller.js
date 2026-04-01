import crypto from "node:crypto";
import Razorpay from "razorpay";
import User from "../schema/user.schema.js";
import ActiveRepo from "../schema/activeRepo.js";
import PaymentLedger from "../schema/paymentLedger.schema.js";
import Plan from "../schema/plan.schema.js";
import { PLAN_EXPIRY_BUFFER_DAYS } from "../config/pricingPlans.js";
import { getUsageSummary } from "../utils/usageTracker.js";
import { decrypt } from "./oauthcontroller.js";
import { GITHUB_API_BASE, githubDelete } from "../utils/githubApiClient.js";
import { resetQueue } from "../services/reset.queue.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const DAY_WINDOW = 7;

// ── Helpers ──────────────────────────────────────────────────────────────────

const getPlanExpiry = (billingDays) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + billingDays + PLAN_EXPIRY_BUFFER_DAYS);
  return expiry;
};

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const successRevenueMatch = {
  status: "success",
  amount: { $gt: 0 },
};

const toDayKey = (date) => new Date(date).toISOString().slice(0, 10);

const applyProPlan = async (userId, planId) => {
  const plan = await Plan.findOne({ planId, active: true });
  if (!plan) throw new Error(`Plan not found in DB: ${planId}`);

  const expiry = getPlanExpiry(plan.billingDays);
  const now = new Date();

  await User.findByIdAndUpdate(userId, {
    $set: {
      plan: "pro",
      planInterval: plan.interval, // "monthly" or "yearly"
      reviewLimit: plan.reviewLimit,
      competitorLimit: plan.competitorLimit,
      activeRepoLimit: plan.activeRepoLimit,
      planExpiry: expiry,
      // Reset usage counters and start a fresh period
      reviewsUsed: 0,
      competitorAnalysesUsed: 0,
      usagePeriodStart: now,
    },
  });

  return expiry;
};

// ── POST /api/admin/payments/revoke-plan ─────────────────────────────────────

export const adminRevokePlan = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const activeRepos = await ActiveRepo.find({ userId, active: true })
      .sort({ createdAt: 1, _id: 1 })
      .select("_id repoOwner repoName webhookId");

    const reposToDeactivate = activeRepos.slice(5);

    if (reposToDeactivate.length > 0 && user.githubAccessToken) {
      const accessToken = decrypt(user.githubAccessToken);

      for (const repo of reposToDeactivate) {
        try {
          await githubDelete(
            `${GITHUB_API_BASE}/repos/${repo.repoOwner}/${repo.repoName}/hooks/${repo.webhookId}`,
            accessToken,
          );
        } catch (error) {
          if (error.response?.status !== 404) {
            console.warn(
              `Failed to delete webhook for ${repo.repoOwner}/${repo.repoName}:`,
              error.message,
            );
          }
        }
      }
    }

    if (reposToDeactivate.length > 0) {
      await ActiveRepo.updateMany(
        { _id: { $in: reposToDeactivate.map((repo) => repo._id) } },
        { $set: { active: false } },
      );
    }

    await User.findByIdAndUpdate(userId, {
      $set: {
        plan: "free",
        planInterval: "free",
        reviewLimit: 1,
        competitorLimit: 1,
        activeRepoLimit: 5,
        planExpiry: null,
        reviewsUsed: 0,
        competitorAnalysesUsed: 0,
        usagePeriodStart: null,
        reposDeactivatedNotification: reposToDeactivate.length > 0,
      },
    });

    return res.status(200).json({
      message: "Plan revoked. User moved to free plan.",
      deactivatedRepoCount: reposToDeactivate.length,
    });
  } catch (error) {
    console.error("adminRevokePlan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── GET /api/admin/payments/users-plan ────────────────────────────────────────

const PAGE_SIZE = 10;

export const adminGetUsersWithPlan = async (req, res) => {
  try {
    const { search = "", plan = "", page = "1" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);

    const filter = {};
    if (plan) filter.plan = plan;
    if (search) {
      filter.$or = [
        { githubUsername: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(
          "githubUsername email avatarUrl plan planInterval planExpiry reviewLimit competitorLimit activeRepoLimit reviewsUsed competitorAnalysesUsed",
        )
        .sort({ plan: -1, createdAt: -1 })
        .skip((pageNum - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      users,
      meta: {
        total,
        page: pageNum,
        limit: PAGE_SIZE,
        pages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error("adminGetUsersWithPlan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── PATCH /api/admin/payments/update-plan-price ───────────────────────────────

export const adminUpdatePlanPrice = async (req, res) => {
  const { planId, amount } = req.body;
  if (!planId || amount == null) {
    return res.status(400).json({ message: "planId and amount are required" });
  }
  if (!Number.isInteger(amount) || amount < 0) {
    return res
      .status(400)
      .json({ message: "amount must be a non-negative integer (paise)" });
  }

  try {
    const plan = await Plan.findOneAndUpdate(
      { planId },
      { $set: { amount } },
      { new: true },
    );
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    return res.status(200).json({ message: "Price updated.", plan });
  } catch (error) {
    console.error("adminUpdatePlanPrice error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── GET /api/payments/admin/analytics ────────────────────────────────────────

export const fetchPaymentAdminAnalytics = async (_req, res) => {
  try {
    const todayStart = startOfDay(new Date());
    const rangeStart = new Date(todayStart);
    rangeStart.setDate(rangeStart.getDate() - (DAY_WINDOW - 1));

    const [
      paidUsers,
      totalRevenueResult,
      successfulPayments,
      failedPayments,
      latestPayment,
      activePaidUsers,
      plans,
      recentPaymentLogs,
    ] = await Promise.all([
      User.countDocuments({ plan: "pro" }),
      PaymentLedger.aggregate([
        { $match: successRevenueMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]),
      PaymentLedger.countDocuments(successRevenueMatch),
      PaymentLedger.countDocuments({ status: "failed" }),
      PaymentLedger.findOne(successRevenueMatch).sort({ createdAt: -1 }).lean(),
      User.find({ plan: "pro" })
        .select(
          "githubUsername email avatarUrl plan planInterval planExpiry createdAt",
        )
        .lean(),
      Plan.find({ active: true, interval: { $in: ["monthly", "yearly"] } })
        .select("interval amount billingDays")
        .lean(),
      PaymentLedger.find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("userId", "githubUsername email avatarUrl plan planInterval")
        .lean(),
    ]);

    const activePaidUserIds = activePaidUsers.map((user) => user._id);
    const latestSuccessfulPayments = activePaidUserIds.length
      ? await PaymentLedger.aggregate([
          {
            $match: {
              ...successRevenueMatch,
              userId: { $in: activePaidUserIds },
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "$userId",
              amount: { $first: "$amount" },
            },
          },
        ])
      : [];

    const latestPaymentByUser = new Map(
      latestSuccessfulPayments.map((entry) => [String(entry._id), entry]),
    );
    const planByInterval = new Map(plans.map((plan) => [plan.interval, plan]));

    let monthlyPaidUsers = 0;
    let yearlyPaidUsers = 0;
    let mrr = 0;
    let arr = 0;
    let fallbackRevenue = 0;

    activePaidUsers.forEach((user) => {
      const latestPaymentAmount = latestPaymentByUser.get(
        String(user._id),
      )?.amount;
      const fallbackAmount = planByInterval.get(user.planInterval)?.amount || 0;
      const amount = latestPaymentAmount || fallbackAmount;

      if (user.planInterval === "yearly") {
        yearlyPaidUsers += 1;
        arr += amount;
        mrr += Math.round(amount / 12);
        fallbackRevenue += amount;
        return;
      }

      monthlyPaidUsers += 1;
      arr += amount * 12;
      mrr += amount;
      fallbackRevenue += amount;
    });

    const dailyRevenueRaw = await PaymentLedger.aggregate([
      {
        $match: {
          ...successRevenueMatch,
          createdAt: {
            $gte: rangeStart,
            $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            day: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          },
          purchases: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    const dailyLookup = new Map(
      dailyRevenueRaw.map((entry) => [
        entry._id.day,
        { purchases: entry.purchases, revenue: entry.revenue },
      ]),
    );

    activePaidUsers.forEach((user) => {
      if (latestPaymentByUser.has(String(user._id))) {
        return;
      }

      const plan = planByInterval.get(user.planInterval);
      if (!plan) {
        return;
      }

      let purchaseDate = null;

      if (user.planExpiry) {
        purchaseDate = new Date(user.planExpiry);
        purchaseDate.setDate(
          purchaseDate.getDate() - plan.billingDays - PLAN_EXPIRY_BUFFER_DAYS,
        );
      } else if (user.createdAt) {
        purchaseDate = new Date(user.createdAt);
      }

      if (!purchaseDate) {
        return;
      }

      const purchaseDay = startOfDay(purchaseDate);
      if (purchaseDay < rangeStart || purchaseDay > todayStart) {
        return;
      }

      const key = toDayKey(purchaseDay);
      const current = dailyLookup.get(key) || { purchases: 0, revenue: 0 };
      current.purchases += 1;
      current.revenue += plan.amount;
      dailyLookup.set(key, current);
    });

    const activity = Array.from({ length: DAY_WINDOW }, (_, index) => {
      const day = new Date(rangeStart);
      day.setDate(rangeStart.getDate() + index);
      const key = toDayKey(day);
      const stats = dailyLookup.get(key) || { purchases: 0, revenue: 0 };

      return {
        date: key,
        label: day.toLocaleDateString("en-US", { weekday: "short" }),
        shortDate: day.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        purchases: stats.purchases,
        revenue: stats.revenue,
      };
    });

    const recentLogs = recentPaymentLogs.map((log) => ({
      id: log._id,
      type: log.type,
      status: log.status,
      amount: log.amount,
      currency: log.currency,
      note: log.note,
      planBefore: log.planBefore,
      planAfter: log.planAfter,
      createdAt: log.createdAt,
      razorpayPaymentId: log.razorpayPaymentId,
      razorpayOrderId: log.razorpayOrderId,
      user: log.userId
        ? {
            id: log.userId._id,
            githubUsername: log.userId.githubUsername,
            email: log.userId.email,
            avatarUrl: log.userId.avatarUrl,
            plan: log.userId.plan,
            planInterval: log.userId.planInterval,
          }
        : null,
    }));

    return res.status(200).json({
      overview: {
        paidUsers,
        totalRevenue: totalRevenueResult[0]?.totalRevenue || fallbackRevenue,
        successfulPayments,
        failedPayments,
        monthlyPaidUsers,
        yearlyPaidUsers,
        mrr,
        arr,
        latestPaymentAt:
          latestPayment?.createdAt || activePaidUsers[0]?.createdAt || null,
      },
      activity,
      recentLogs,
    });
  } catch (error) {
    console.error("Error fetching payment admin analytics:", error);
    return res
      .status(500)
      .json({ message: "Error fetching payment admin analytics" });
  }
};

// ── GET /api/payments/plans ───────────────────────────────────────────────────

export const getPlans = async (_req, res) => {
  try {
    const plans = await Plan.find({ active: true }).select(
      "planId name interval amount currency billingDays reviewLimit competitorLimit activeRepoLimit",
    );
    return res.status(200).json({ plans });
  } catch (error) {
    console.error("getPlans error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── GET /api/payments/my-plan ─────────────────────────────────────────────────

export const getMyPlan = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "plan reviewLimit competitorLimit activeRepoLimit planExpiry",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const [latestPayment, usage] = await Promise.all([
      PaymentLedger.findOne({ userId: req.userId, status: "success" }).sort({
        createdAt: -1,
      }),
      getUsageSummary(req.userId),
    ]);

    return res.status(200).json({
      plan: user.plan,
      reviewLimit: user.reviewLimit,
      competitorLimit: user.competitorLimit,
      activeRepoLimit: user.activeRepoLimit,
      planExpiry: user.planExpiry,
      usage,
      latestPayment: latestPayment
        ? {
            amount: latestPayment.amount,
            currency: latestPayment.currency,
            razorpayPaymentId: latestPayment.razorpayPaymentId,
            razorpayOrderId: latestPayment.razorpayOrderId,
            type: latestPayment.type,
            createdAt: latestPayment.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("getMyPlan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── POST /api/payments/create-order ──────────────────────────────────────────

export const createOrder = async (req, res) => {
  const { planId } = req.body;

  const plan = await Plan.findOne({ planId, active: true });
  if (!plan) {
    return res.status(400).json({ message: "Invalid plan ID" });
  }

  try {
    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: plan.currency,
      receipt: `r_${req.userId.toString().slice(-8)}_${Date.now().toString().slice(-10)}`,
      notes: {
        userId: req.userId.toString(),
        planId,
      },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planId,
      planLabel: plan.name,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return res.status(500).json({ message: "Failed to create payment order" });
  }
};

// ── POST /api/payments/verify ─────────────────────────────────────────────────
// Called by frontend after Razorpay checkout succeeds.
// This is the fast path — webhook is the reliable fallback.

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing payment fields" });
  }

  // ── Signature verification ────────────────────────────────────────────────
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    console.warn("Payment signature mismatch", {
      userId: req.userId,
      razorpay_order_id,
      razorpay_payment_id,
    });
    return res.status(400).json({ message: "Payment verification failed" });
  }

  // ── Idempotency check — never double-credit ───────────────────────────────
  const existing = await PaymentLedger.findOne({
    razorpayPaymentId: razorpay_payment_id,
  });
  if (existing) {
    return res
      .status(200)
      .json({ message: "Payment already processed", alreadyProcessed: true });
  }

  try {
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const orderPlanId = order.notes?.planId;
    const orderUserId = order.notes?.userId;

    if (!orderPlanId || !orderUserId) {
      return res
        .status(400)
        .json({ message: "Payment order is missing plan metadata" });
    }

    if (orderUserId !== req.userId.toString()) {
      return res
        .status(403)
        .json({ message: "Payment order does not belong to this user" });
    }

    const plan = await Plan.findOne({ planId: orderPlanId, active: true });
    if (!plan) {
      return res
        .status(400)
        .json({ message: "Invalid plan ID on payment order" });
    }

    if (order.amount !== plan.amount || order.currency !== plan.currency) {
      return res
        .status(400)
        .json({ message: "Payment order does not match plan pricing" });
    }

    const user = await User.findById(req.userId);
    const planBefore = user?.plan ?? "free";

    const planExpiry = await applyProPlan(req.userId, orderPlanId);

    await PaymentLedger.create({
      userId: req.userId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      type: "subscription_activated",
      planBefore,
      planAfter: "pro",
      amount: plan.amount,
      currency: plan.currency,
      status: "success",
      note: `${plan.name} activated via checkout`,
    });

    return res.status(200).json({
      message: "Payment verified. Pro plan activated.",
      planExpiry,
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return res.status(500).json({ message: "Failed to activate plan" });
  }
};

// ── POST /api/webhook/razorpay ────────────────────────────────────────────────
// Razorpay calls this directly — independent of the user's browser.
// IMPORTANT: This route must receive the RAW body (registered before express.json()).

export const razorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  // ── Verify webhook authenticity ───────────────────────────────────────────
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body) // raw Buffer
    .digest("hex");

  if (signature !== expectedSignature) {
    console.warn("Razorpay webhook: invalid signature");
    return res.status(400).send("Invalid signature");
  }

  // Acknowledge immediately — Razorpay will retry if we don't respond fast
  res.status(200).json({ received: true });

  try {
    const event = JSON.parse(req.body.toString());
    const eventType = event.event;

    if (eventType === "payment.captured") {
      await handlePaymentCaptured(event.payload.payment.entity);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
};

// ── Webhook: payment.captured ─────────────────────────────────────────────────
// Idempotent fallback handler — runs the same logic as verifyPayment but
// triggered by Razorpay directly. Safe to call multiple times.

const handlePaymentCaptured = async (payment) => {
  const paymentId = payment.id;
  const notes = payment.notes || {};
  const userId = notes.userId;
  const planId = notes.planId;

  if (!userId || !planId) {
    console.warn("Webhook payment.captured: missing notes", { paymentId });
    return;
  }

  const plan = await Plan.findOne({ planId, active: true });
  if (!plan) {
    console.warn("Webhook payment.captured: unknown planId", { planId });
    return;
  }

  // Idempotency check
  const existing = await PaymentLedger.findOne({
    razorpayPaymentId: paymentId,
  });
  if (existing) {
    return; // already handled by verify endpoint — skip silently
  }

  const user = await User.findById(userId);
  if (!user) {
    console.warn("Webhook payment.captured: user not found", { userId });
    return;
  }

  const planBefore = user.plan ?? "free";
  const planExpiry = await applyProPlan(userId, planId);

  await PaymentLedger.create({
    userId,
    razorpayOrderId: payment.order_id,
    razorpayPaymentId: paymentId,
    type: "subscription_activated",
    planBefore,
    planAfter: "pro",
    amount: payment.amount,
    currency: payment.currency,
    status: "success",
    note: `${plan.name} activated via webhook`,
    razorpayResponse: payment,
  });

  console.log(
    `Webhook: Pro plan activated for user ${userId} via payment ${paymentId}`,
  );
};

export const resetSubscription = async (req, res) => {
  try {
    const users = await User.find({ plan: "pro" });
    if (!users) return res.status(404).json("no user found with a active plan");

    await resetQueue.add("reset-job", { users });

    return res
      .status(200)
      .json({ message: "Reset Work added in the queue ", users });
  } catch (error) {
    console.error("Error in resetSubscription:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
