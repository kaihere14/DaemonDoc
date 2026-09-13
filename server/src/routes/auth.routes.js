import { Router } from "express";

const router = Router();

import {
  deleteAccount,
  getProviders,
  githubAuthRedirect,
  githubCallBack,
  updateEmailNotifications,
  updateLlmProviderPriority,
  verifyUser,
} from "../controllers/oauthcontroller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

router.get("/github", githubAuthRedirect);
router.get("/github/callback", githubCallBack);
router.post("/verify", authenticate, verifyUser);
router.get("/providers", authenticate, getProviders);
router.patch("/llm-provider-priority", authenticate, updateLlmProviderPriority);
router.patch("/email-notifications", authenticate, updateEmailNotifications);
router.delete("/delete", authenticate, deleteAccount);

export default router;
