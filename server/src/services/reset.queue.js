import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";
import User from "../schema/user.schema.js";
import ActiveRepo from "../schema/activeRepo.js";
import { decrypt } from "../controllers/oauthcontroller.js";
import { GITHUB_API_BASE, githubDelete } from "../utils/githubApiClient.js";
import { redisConnection } from "../utils/redis.js";

export const RESET_QUEUE_NAME = "reset-broadcast";
const MAX_CONCURRENCY = 4;

export const resetQueue = new Queue(RESET_QUEUE_NAME, {
  connection: redisConnection,
});

new Worker(
  RESET_QUEUE_NAME,
  async (job) => {
    const users = job.data.users;
    console.log(
      `[Reset Queue] Started job ${job.id} to reset ${users?.length || 0} users.`,
    );

    if (!users || !users.length) {
      console.log(`[Reset Queue] No users to process in this job.`);
      return;
    }

    for (const [idx, data] of users.entries()) {
      const dateNow = new Date();

      console.log(
        `[Reset Queue] Processing user ${idx + 1}/${users.length} (ID: ${data._id})`,
      );

      if (
        (data.planInterval === "monthly" || data.planInterval === "yearly") &&
        new Date(data.planExpiry) < dateNow
      ) {
        console.log(
          `[Reset Queue] User ${data._id} has an expired plan. Moving to free plan.`,
        );
        const userId = data._id;
        const activeRepos = await ActiveRepo.find({ userId, active: true })
          .sort({ createdAt: 1, _id: 1 })
          .select("_id repoOwner repoName webhookId");

        const reposToDeactivate = activeRepos.slice(5);

        if (reposToDeactivate.length > 0 && data.githubAccessToken) {
          console.log(
            `[Reset Queue] Deactivating ${reposToDeactivate.length} GitHub webhooks for user ${userId}.`,
          );
          const accessToken = decrypt(data.githubAccessToken);

          for (const repo of reposToDeactivate) {
            try {
              await githubDelete(
                `${GITHUB_API_BASE}/repos/${repo.repoOwner}/${repo.repoName}/hooks/${repo.webhookId}`,
                accessToken,
              );
              console.log(
                `[Reset Queue] Successfully deleted webhook for ${repo.repoOwner}/${repo.repoName}`,
              );
            } catch (error) {
              if (error.response?.status !== 404) {
                console.warn(
                  `[Reset Queue] Failed to delete webhook for ${repo.repoOwner}/${repo.repoName}:`,
                  error.message,
                );
              }
            }
          }
        }

        if (reposToDeactivate.length > 0) {
          await ActiveRepo.updateMany(
            { _id: { $in: reposToDeactivate.map((repo) => repo._id) } },
            { $set: { active: false } },
          );
        }

        await User.findByIdAndUpdate(data._id, {
          $set: {
            plan: "free",
            planInterval: "free",
            reviewLimit: 1,
            competitorLimit: 1,
            activeRepoLimit: 5,
            planExpiry: null,
            reviewsUsed: 0,
            competitorAnalysesUsed: 0,
            usagePeriodStart: null,
            reposDeactivatedNotification: reposToDeactivate.length > 0,
          },
        });
        console.log(`[Reset Queue] User ${data._id} successfully downgraded.`);
      } else if (
        data.planInterval === "yearly" &&
        data.usagePeriodStart &&
        new Date(data.usagePeriodStart).getTime() + 30 * 24 * 60 * 60 * 1000 <=
          dateNow.getTime()
      ) {
        console.log(
          `[Reset Queue] User ${data._id} yearly plan has completed a month. Resetting usage counters.`,
        );

        const periodStartMs = new Date(data.usagePeriodStart).getTime();
        const periodLengthMs = 30 * 24 * 60 * 60 * 1000;
        const periodsElapsed = Math.floor(
          (dateNow.getTime() - periodStartMs) / periodLengthMs,
        );
        const newPeriodStart = new Date(
          periodStartMs + periodsElapsed * periodLengthMs,
        );

        await User.findByIdAndUpdate(data._id, {
          $set: {
            reviewsUsed: 0,
            competitorAnalysesUsed: 0,
            reviewLimit: 20,
            competitorLimit: 10,
            usagePeriodStart: newPeriodStart,
          },
        });
        console.log(
          `[Reset Queue] User ${data._id} successfully got usage tokens reset.`,
        );
      } else {
        console.log(
          `[Reset Queue] User ${data._id} skipped. Conditions: Interval=${data.planInterval}, Expiry=${data.planExpiry}`,
        );
      }
    }

    console.log(`[Reset Queue] Completed job ${job.id}`);
  },
  {
    connection: redisConnection,
    concurrency: MAX_CONCURRENCY,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
);
