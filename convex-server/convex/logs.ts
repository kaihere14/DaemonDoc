import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const addLogMessage = mutation({
  args: {
    logId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("logMessages", {
      logId: args.logId,
      message: args.message,
      createdAt: Date.now(),
    });
  },
});

export const getLogMessages = query({
  args: { logId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("logMessages")
      .withIndex("by_logId", (q) => q.eq("logId", args.logId))
      .order("asc")
      .take(200);
  },
});
