import IORedis, { Redis } from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME || "default",
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  enableOfflineQueue: true,
});

export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME || "default",
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  enableOfflineQueue: true,
});
