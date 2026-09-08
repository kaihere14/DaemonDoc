import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import githubRoutes from "./routes/github.routes.js";
import emailRoutes from "./routes/email.routes.js";
import { connectDB } from "./db/connectDB.js";
import { recoverInterruptedCleanupLogs } from "./services/logRecovery.service.js";
import { githubWebhookHandler } from "./controllers/github.controller.js";
import { serverLog, requestLogger } from "./utils/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "https://daemondoc.online",
      "https://app.daemondoc.online",
      "https://www.daemondoc.online",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);

app.use(
  "/api/github/webhookhandler",
  express.raw({ type: "application/json" }),
  githubWebhookHandler,
);

app.use(express.json());

// One line per finished request, before the routes so every route is covered.
app.use(requestLogger);

app.use("/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/email", emailRoutes);

app.get("/", (req, res) => {
  res.send("Server is up and running ! ");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    redis: "connected",
  });
});

// eslint-disable-next-line no-unused-vars -- 4-arg signature required for Express to treat this as error middleware
app.use((err, req, res, next) => {
  serverLog.error("Unhandled request error", {
    method: req.method,
    url: req.originalUrl,
    detail: err.message,
  });
  res.status(500).json({ message: "Internal server error" });
});

connectDB()
  .then(() => {
    recoverInterruptedCleanupLogs()
      .then((recoveredCount) => {
        if (recoveredCount > 0) {
          serverLog.warn("Recovered interrupted cleanup logs", {
            count: recoveredCount,
          });
        }
      })
      .catch((error) => {
        serverLog.error("Failed to recover interrupted cleanup logs", {
          detail: error.message,
        });
      })
      .finally(() => {
        app.listen(PORT, () => {
          serverLog.info("Server listening", {
            port: PORT,
            env: process.env.NODE_ENV || "development",
          });
        });
      });
  })
  .catch((error) => {
    serverLog.error("Startup aborted — database unavailable", {
      detail: error.message,
    });
  });
