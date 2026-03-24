import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";
import User from "../schema/user.schema.js";
import { sendEmail } from "./email.service.js";

const MAX_CONCURRENCY = 2;
const EMAIL_QUEUE_NAME = "email-broadcast";

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME || "default",
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  enableOfflineQueue: true,
});

redisConnection.on("error", (err) => {
  console.error("Email queue Redis error:", err.message);
});

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
});

new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    const { subject, content, to } = job.data;
    await sendEmail(subject, content, to);
  },
  {
    connection: redisConnection,
    concurrency: MAX_CONCURRENCY,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
);

const makeBroadcastId = () => `broadcast_${Date.now()}`;

export const enqueueFeatureUpdateBroadcast = async ({ subject, content }) => {
  const broadcastId = makeBroadcastId();

  const recipients = await User.find(
    {
      emailNotificationsEnabled: { $ne: false },
      email: { $exists: true, $nin: [null, ""] },
    },
    { _id: 1, email: 1 },
  ).lean();

  const skippedNoEmail = await User.countDocuments({
    emailNotificationsEnabled: { $ne: false },
    $or: [{ email: { $exists: false } }, { email: null }, { email: "" }],
  });

  if (recipients.length > 0) {
    await emailQueue.addBulk(
      recipients.map((recipient) => ({
        name: "send-feature-update",
        data: {
          broadcastId,
          userId: String(recipient._id),
          to: recipient.email,
          subject,
          content,
        },
        opts: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        },
      })),
    );
  }

  const counts = await emailQueue.getJobCounts(
    "waiting",
    "active",
    "completed",
    "failed",
    "delayed",
    "paused",
  );

  return {
    broadcastId,
    enqueued: recipients.length,
    skippedNoEmail,
    workerConcurrency: MAX_CONCURRENCY,
    queueDepth: (counts.waiting || 0) + (counts.delayed || 0),
  };
};

export const getEmailQueueStats = async () => {
  const counts = await emailQueue.getJobCounts(
    "waiting",
    "active",
    "completed",
    "failed",
    "delayed",
    "paused",
  );

  return {
    queued: (counts.waiting || 0) + (counts.delayed || 0),
    processing: counts.active || 0,
    completed: counts.completed || 0,
    failed: counts.failed || 0,
    paused: counts.paused || 0,
    workerConcurrency: MAX_CONCURRENCY,
  };
};
