import Router from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";
import {
  addRepoActivity,
  getGithubRepos,
  githubWebhookHandler,
  deactivateRepoActivity,
  fetchUserLogs,
  fetchAdminAnalytics,
  fetchAdminUsers,
  cleanUpReadme,
} from "../controllers/github.controller.js";

const router = Router();

router.get("/getGithubRepos", authenticate, getGithubRepos);
router.post("/addRepoActivity", authenticate, addRepoActivity);
router.post("/deactivateRepoActivity", authenticate, deactivateRepoActivity);
router.post("/webhookhandler", githubWebhookHandler);
router.get("/fetchUserLogs", authenticate, fetchUserLogs);
router.get("/admin/analytics", authenticate, requireAdmin, fetchAdminAnalytics);
router.get("/admin/users", authenticate, requireAdmin, fetchAdminUsers);
router.post("/cleanUpReadme", authenticate, cleanUpReadme);

export default router;
