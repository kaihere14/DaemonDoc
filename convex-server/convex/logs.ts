import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createLog = mutation({
  args: {
    logId: v.string(),
    userId: v.string(),
    repoName: v.string(),
    action: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("logs", {
      logId: args.logId,
      userId: args.userId,
      repoName: args.repoName,
      action: args.action,
      status: args.status,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const updateLog = mutation({
  args: {
    logId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("logs")
      .withIndex("by_logId", (q) => q.eq("logId", args.logId))
      .unique();

    if (!existing) {
      console.warn(`[Convex] updateLog: no log found for logId=${args.logId}`);
      return null;
    }

    await ctx.db.patch(existing._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return existing._id;
  },
});

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
