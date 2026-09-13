import { Queue, Worker } from "bullmq";
import User from "../schema/user.schema.js";
import { sendEmail } from "./email.service.js";
import { emailConnection } from "../utils/redis.js";
import { sendFailureEmail, sendSuccessEmail } from "../email/email.js";
import { emailLog } from "../utils/logger.js";

const MAX_CONCURRENCY = 2;
const EMAIL_QUEUE_NAME = "email-broadcast";

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: emailConnection,
});

new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    let jobData = job.data;
    switch (job.name) {
      case "send-feature-update":
        await sendEmail(jobData.subject, jobData.content, jobData.to);
        emailLog.info("Feature update email sent", { to: jobData.to });
        break;
      case "send-readme-success":
        await sendSuccessEmail(
          jobData.to,
          jobData.repoOwner,
          jobData.repoName,
          jobData.mode,
          jobData.commitSha,
          jobData.repoUrl,
        );
        emailLog.info("Readme success email sent", {
          to: jobData.to,
          repo: `${jobData.repoOwner}/${jobData.repoName}`,
        });
        break;
      case "send-readme-failure":
        await sendFailureEmail(
          jobData.to,
          jobData.repoOwner,
          jobData.repoName,
          jobData.mode,
          jobData.errorMessage,
          jobData.repoUrl,
        );
        emailLog.info("Readme failure email sent", {
          to: jobData.to,
          repo: `${jobData.repoOwner}/${jobData.repoName}`,
        });
        break;
    }
  },
  {
    connection: emailConnection,
    concurrency: MAX_CONCURRENCY,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
);

const makeBroadcastId = () => `broadcast_${Date.now()}`;

const ELIGIBLE_RECIPIENT_FILTER = {
  emailNotificationsEnabled: { $ne: false },
  email: { $exists: true, $nin: [null, ""] },
};

const RECIPIENT_LIST_PROJECTION = {
  _id: 1,
  githubUsername: 1,
  email: 1,
  avatarUrl: 1,
};

const normalizeRecipientIds = (recipientUserIds = []) => [
  ...new Set(recipientUserIds.map((recipientId) => recipientId.trim())),
];

export const getFeatureUpdateRecipientsList = async () => {
  const [recipients, skippedNoEmail, skippedNotificationsDisabled] =
    await Promise.all([
      User.find(ELIGIBLE_RECIPIENT_FILTER, RECIPIENT_LIST_PROJECTION)
        .sort({ githubUsername: 1, email: 1 })
        .lean(),
      User.countDocuments({
        emailNotificationsEnabled: { $ne: false },
        $or: [{ email: { $exists: false } }, { email: null }, { email: "" }],
      }),
      User.countDocuments({ emailNotificationsEnabled: false }),
    ]);

  return {
    recipients: recipients.map((recipient) => ({
      id: String(recipient._id),
      githubUsername: recipient.githubUsername || "",
      email: recipient.email,
      avatarUrl: recipient.avatarUrl || "",
    })),
    stats: {
      selectableRecipients: recipients.length,
      skippedNoEmail,
      skippedNotificationsDisabled,
    },
  };
};

export const enqueueFeatureUpdateBroadcast = async ({
  subject,
  content,
  recipientUserIds,
}) => {
  const broadcastId = makeBroadcastId();
  const recipientSelectionProvided = Array.isArray(recipientUserIds);
  const normalizedRecipientIds = recipientSelectionProvided
    ? normalizeRecipientIds(recipientUserIds)
    : null;
  const recipientFilter = normalizedRecipientIds
    ? { _id: { $in: normalizedRecipientIds } }
    : {};

  const recipients = await User.find(
    { ...ELIGIBLE_RECIPIENT_FILTER, ...recipientFilter },
    { _id: 1, email: 1 },
  ).lean();

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
    audience: recipientSelectionProvided ? "selected" : "all",
    requestedRecipients: normalizedRecipientIds?.length ?? null,
    enqueued: recipients.length,
    skippedSelectedRecipients: normalizedRecipientIds
      ? normalizedRecipientIds.length - recipients.length
      : 0,
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
