import crypto from "node:crypto";
import Razorpay from "razorpay";
import User from "../schema/user.schema.js";
import PaymentLedger from "../schema/paymentLedger.schema.js";
import {
  SUBSCRIPTION_PLANS,
  PLAN_LIMITS,
  PLAN_EXPIRY_BUFFER_DAYS,
} from "../config/pricingPlans.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const getPlanExpiry = (billingDays) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + billingDays + PLAN_EXPIRY_BUFFER_DAYS);
  return expiry;
};

const applyProPlan = async (userId, planId) => {
  const plan = SUBSCRIPTION_PLANS[planId];
  const limits = PLAN_LIMITS.pro;
  const expiry = getPlanExpiry(plan.billingDays);

  await User.findByIdAndUpdate(userId, {
    $set: {
      plan: "pro",
      reviewLimit: limits.reviewLimit,
      competitorLimit: limits.competitorLimit,
      activeRepoLimit: limits.activeRepoLimit,
      planExpiry: expiry,
    },
  });

  return expiry;
};

// ── GET /api/payments/my-plan ─────────────────────────────────────────────────

export const getMyPlan = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "plan reviewLimit competitorLimit activeRepoLimit planExpiry",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const latestPayment = await PaymentLedger.findOne({
      userId: req.userId,
      status: "success",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      plan: user.plan,
      reviewLimit: user.reviewLimit,
      competitorLimit: user.competitorLimit,
      activeRepoLimit: user.activeRepoLimit,
      planExpiry: user.planExpiry,
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

  const plan = SUBSCRIPTION_PLANS[planId];
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
      planLabel: plan.label,
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
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } =
    req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !planId
  ) {
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
  const existing = await PaymentLedger.findOne({ razorpayPaymentId: razorpay_payment_id });
  if (existing) {
    return res.status(200).json({ message: "Payment already processed", alreadyProcessed: true });
  }

  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    return res.status(400).json({ message: "Invalid plan ID" });
  }

  try {
    const user = await User.findById(req.userId);
    const planBefore = user?.plan ?? "free";

    const planExpiry = await applyProPlan(req.userId, planId);

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
      note: `${plan.label} activated via checkout`,
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

  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    console.warn("Webhook payment.captured: unknown planId", { planId });
    return;
  }

  // Idempotency check
  const existing = await PaymentLedger.findOne({ razorpayPaymentId: paymentId });
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
    note: `${plan.label} activated via webhook`,
    razorpayResponse: payment,
  });

  console.log(`Webhook: Pro plan activated for user ${userId} via payment ${paymentId}`);
};
