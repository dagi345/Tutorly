import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { now } from "./_utils";

export const createReview = mutation({
  args: {
    lessonId: v.id("lessons"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, { lessonId, rating, comment }) => {
    const lesson = await ctx.db.get(lessonId);
    if (!lesson) throw new Error("Lesson not found");
    if (lesson.status !== "completed")
      throw new Error("Can only review completed lessons");

    return ctx.db.insert("reviews", {
      lessonId,
      tutorId: lesson.tutorId,
      studentId: lesson.studentId,
      rating,
      comment,
      createdAt: now(),
    });
  },
});

export const listByTutor = query({
  args: { tutorId: v.id("users") },
  handler: async (ctx, { tutorId }) => {
    return ctx.db
      .query("reviews")
      .withIndex("by_tutor", (q) => q.eq("tutorId", tutorId))
      .order("desc")
      .collect();
  },
});

export const getByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, { lessonId }) => {
    return ctx.db
      .query("reviews")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .unique();
  },
});