import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { assertDoc, now } from "./_utils";

// ---------- Mutations ----------
export const createProfile = mutation({
  args: {
    userId: v.id("users"),
    subjects: v.array(v.string()),
    hourlyRate: v.number(),
    availability: v.array(v.string()),
    bio: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("tutorProfiles", {
      ...args,
      trialUsedCount: 0,
      rating: 0,
      isApproved: false,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      subjects: v.optional(v.array(v.string())),
      hourlyRate: v.optional(v.number()),
      availability: v.optional(v.array(v.string())),
      bio: v.optional(v.string()),
      planTemplate: v.optional(
        v.object({ title: v.string(), lessonCount: v.number() })
      ),
    }),
  },
  handler: async (ctx, { userId, updates }) => {
    const profile = await ctx.db
      .query("tutorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");
    await ctx.db.patch(profile._id, { ...updates, updatedAt: now() });
  },
});

export const approveTutor = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const profile = await ctx.db
      .query("tutorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");
    await ctx.db.patch(profile._id, { rating: 0, updatedAt: now() });
  },
});

// ---------- Queries ----------
export const listApproved = query({
  handler: async (ctx) => {
    return ctx.db.query("tutorProfiles").collect(); // filter by rating !== undefined in UI
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("tutorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});