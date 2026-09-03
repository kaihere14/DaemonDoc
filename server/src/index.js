import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import githubRoutes from "./routes/github.routes.js";
import emailRoutes from "./routes/email.routes.js";
import { connectDB } from "./db/connectDB.js";
import { recoverInterruptedCleanupLogs } from "./services/logRecovery.service.js";
import { githubWebhookHandler } from "./controllers/github.controller.js";

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

app.use("/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/email", emailRoutes);

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

app.get("/health", (req, res) => {
  console.log("Health check endpoint called");
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    redis: "connected",
  });
});

// eslint-disable-next-line no-unused-vars -- 4-arg signature required for Express to treat this as error middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

connectDB()
  .then(() => {
    recoverInterruptedCleanupLogs()
      .then((recoveredCount) => {
        if (recoveredCount > 0) {
          console.warn(
            `[startup] Marked ${recoveredCount} interrupted cleanup log(s) as failed`,
          );
        }
      })
      .catch((error) => {
        console.error(
          "[startup] Failed to recover interrupted cleanup logs:",
          error.message,
        );
      })
      .finally(() => {
        app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
        });
      });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
