import { Router } from "express";
import * as email from "../controllers/email.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate, requireAdmin);
router.get("/recipients", email.getFeatureUpdateRecipients);
router.post("/send", email.sendFeatureUpdateEmail);
router.get("/queue-status", email.getEmailQueueStatus);

export default router;
