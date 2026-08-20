import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  logMessages: defineTable({
    logId: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_logId", ["logId"]),
});
