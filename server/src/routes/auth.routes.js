import { Router } from "express";

const router = Router();

import {
  deleteAccount,
  githubAuthRedirect,
  githubCallBack,
  updateLlmProviderPriority,
  verifyUser,
} from "../controllers/oauthcontroller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

router.get("/github", githubAuthRedirect);
router.get("/github/callback", githubCallBack);
router.post("/verify", authenticate, verifyUser);
router.patch("/llm-provider-priority", authenticate, updateLlmProviderPriority);
router.delete("/delete", authenticate, deleteAccount);

export default router;
