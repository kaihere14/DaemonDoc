import { Router } from "express";
import * as email from "../controllers/email.controller.js";
const router = Router();

router.post("/send", email.sendFeatureUpdateEmail);
router.get("/queue-status", email.getEmailQueueStatus);

export default router;
