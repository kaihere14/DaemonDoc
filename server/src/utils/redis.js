import IORedis from "ioredis";

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME || "default",
  maxRetriesPerRequest: null,
};

// Analytics cache client
export const redis = new IORedis(REDIS_CONFIG);

// readme-generation + cleanup queues/workers
export const readmeConnection = new IORedis(REDIS_CONFIG);

// email-broadcast queue/worker
export const emailConnection = new IORedis(REDIS_CONFIG);
