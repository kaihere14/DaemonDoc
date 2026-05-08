import { Router } from "express";
import {
  testConvexConnection,
  getTasks,
} from "../controllers/convex.controller.js";

const router = Router();

router.get("/test", testConvexConnection);
router.get("/tasks", getTasks);

export default router;
