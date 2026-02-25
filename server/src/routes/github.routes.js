import Router from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  addRepoActivity,
  getGithubRepos,
  githubWebhookHandler,
  deactivateRepoActivity,
  fetchUserLogs,
} from "../controllers/github.controller.js";

const router = Router();

router.get("/getGithubRepos", authenticate, getGithubRepos);
router.post("/addRepoActivity", authenticate, addRepoActivity);
router.post("/deactivateRepoActivity", authenticate, deactivateRepoActivity);
router.post("/webhookhandler", githubWebhookHandler);
router.get("/fetchUserLogs", authenticate, fetchUserLogs);

export default router;
