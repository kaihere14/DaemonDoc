import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import githubRoutes from "./routes/github.routes.js";
import { connectDB } from "./db/connectDB.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/github", githubRoutes);

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

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
