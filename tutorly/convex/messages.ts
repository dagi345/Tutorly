import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { now } from "./_utils";

export const addMessage = mutation({
  args: {
    channelId: v.string(),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("messages", {
      ...args,
      timestamp: now(),
      sentAtStream: false,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const syncFromStream = mutation({
  args: {
    channelId: v.string(),
    messages: v.array(
      v.object({
        senderId: v.id("users"),
        content: v.string(),
        timestamp: v.string(),
      })
    ),
  },
  handler: async (ctx, { channelId, messages }) => {
    for (const m of messages) {
      await ctx.db.insert("messages", {
        channelId,
        ...m,
        sentAtStream: true,
        createdAt: now(),
        updatedAt: now(),
      });
    }
  },
});

export const listByChannel = query({
  args: { channelId: v.string() },
  handler: async (ctx, { channelId }) => {
    return ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .order("asc")
      .collect();
  },
});