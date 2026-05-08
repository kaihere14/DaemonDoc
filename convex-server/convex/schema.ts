import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  logs: defineTable({
    logId: v.string(),
    userId: v.string(),
    repoName: v.string(),
    action: v.string(),
    status: v.string(),
    updatedAt: v.number(),
  })
    .index("by_logId", ["logId"])
    .index("by_userId", ["userId"]),
  logMessages: defineTable({
    logId: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_logId", ["logId"]),
});
