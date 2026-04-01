import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";
import {
  getPlans,
  createOrder,
  verifyPayment,
  getMyPlan,
  fetchPaymentAdminAnalytics,
  adminRevokePlan,
  adminGetUsersWithPlan,
  adminUpdatePlanPrice,
  resetSubscription,
} from "../controllers/payment.controller.js";

const router = Router();

router.get("/plans", getPlans); // public — no auth needed
router.get("/my-plan", authenticate, getMyPlan);
router.post("/create-order", authenticate, createOrder);
router.post("/verify", authenticate, verifyPayment);

// Admin
router.get(
  "/admin/analytics",
  authenticate,
  requireAdmin,
  fetchPaymentAdminAnalytics,
);
router.get("/admin/users", authenticate, requireAdmin, adminGetUsersWithPlan);
router.post("/admin/revoke-plan", authenticate, requireAdmin, adminRevokePlan);
router.patch(
  "/admin/update-plan-price",
  authenticate,
  requireAdmin,
  adminUpdatePlanPrice,
);

router.get("/reset-user-subscription", resetSubscription);

// NOTE: /api/webhook/razorpay is registered separately in index.js
// BEFORE express.json() so it receives the raw body needed for signature verification.

export default router;
