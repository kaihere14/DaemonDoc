import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getPlans,
  createOrder,
  verifyPayment,
  getMyPlan,
} from "../controllers/payment.controller.js";

const router = Router();

router.get("/plans", getPlans); // public — no auth needed
router.get("/my-plan", authenticate, getMyPlan);
router.post("/create-order", authenticate, createOrder);
router.post("/verify", authenticate, verifyPayment);

// NOTE: /api/webhook/razorpay is registered separately in index.js
// BEFORE express.json() so it receives the raw body needed for signature verification.

export default router;
