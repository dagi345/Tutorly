import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { now } from "./_utils";
import { api } from "./_generated/api";


export const getByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, { lessonId }) => {
    return ctx.db
      .query("reviews")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .unique();
  },
});

// convex/reviews.ts
export const createReview = mutation({

  args: {
    lessonId: v.id("lessons"),
    rating: v.number(),
    comment: v.string(),
  },



  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    await ctx.db.insert("reviews", {
      tutorId: lesson.tutorId,
      studentId: lesson.studentId,
      lessonId: args.lessonId,
      rating: args.rating,
      comment: args.comment,
      createdAt: new Date().toISOString(),
    });

    // keep rating in sync
    await ctx.runMutation(api.tutorProfiles.recalcRating, {
      tutorUserId: lesson.tutorId,
    });

  },
});

export const listByTutor = query({
  args: { tutorUserId: v.id("users") },
  handler: async (ctx, { tutorUserId }) => {
    const rows = await ctx.db
      .query("reviews")
      .withIndex("by_tutor", (q) => q.eq("tutorId", tutorUserId))
      .collect();

    // JOIN the student row
    return Promise.all(
      rows.map(async (r) => ({
        ...r,
        student: await ctx.db.get(r.studentId),
      }))
    );
  },
});