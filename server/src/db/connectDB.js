import mongoose from "mongoose";
import { dbLog as log } from "../utils/logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    log.info("MongoDB connected");
  } catch (error) {
    log.error("MongoDB connection failed", { detail: error.message });
    throw error;
  }
};
