import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { now } from "./_utils";
import { api } from "./_generated/api";
import { StreamClient } from "@stream-io/node-sdk";

// // ---------- Mutations ----------
// export const bookLesson = mutation({
//   args: {
//     tutorId: v.id("users"),
//     studentId: v.id("users"),
//     datetime: v.string(),
//     durationMinutes: v.number(),
//     isTrial: v.boolean(),
//     packageId: v.optional(v.string()),
//   },
//   handler: async (
//     ctx,
//     args
//   ): Promise<Id<"lessons">> => {
//     const tutor = await ctx.db.get(args.tutorId);
//     if (!tutor || tutor.role !== "tutor") throw new Error("Invalid tutor");

//     // cost = hourlyRate * (duration/60)
//     const profile = await ctx.runQuery(api.tutorProfiles.getByUserId, {
//       userId: args.tutorId,
//     });
//     if (!profile) throw new Error("Tutor profile missing");
//     const cost = Math.round(
//       (profile.hourlyRate * args.durationMinutes) / 60
//     );

//     // lock credits
//     await ctx.runMutation(api.users.deductCredits, {
//       userId: args.studentId,
//       amount: cost,
//     });

//     return ctx.db.insert("lessons", {
//       ...args,
//       cost,
//       status: "booked",
//       createdAt: now(),
//       updatedAt: now(),
//     });
//   },
// });

// export const markCompleted = mutation({
//   args: { lessonId: v.id("lessons") },
//   handler: async (
//     ctx,
//     { lessonId }
//   ): Promise<void> => {
//     await ctx.db.patch(lessonId, { status: "completed", updatedAt: now() });
//   },
// });

// export const cancelLesson = mutation({
//   args: { lessonId: v.id("lessons") },
//   handler: async (
//     ctx,
//     { lessonId }
//   ): Promise<void> => {
//     const lesson = await ctx.db.get(lessonId);
//     if (!lesson) throw new Error("Lesson not found");
//     await ctx.db.patch(lessonId, { status: "cancelled", updatedAt: now() });

//     // refund credits
//     await ctx.runMutation(api.users.addCredits, {
//       userId: lesson.studentId,
//       amount: lesson.cost,
//     });
//   },
// });

// // ---------- Queries ----------
// export const listByStudent = query({
//   args: { studentId: v.id("users") },
//   handler: async (
//     ctx,
//     { studentId }
//   ): Promise<Doc<"lessons">[]> => {
//     return ctx.db
//       .query("lessons")
//       .withIndex("by_student", (q) => q.eq("studentId", studentId))
//       .order("desc")
//       .collect();
//   },
// });

// export const listByTutor = query({
//   args: { tutorId: v.id("users") },
//   handler: async (
//     ctx,
//     { tutorId }
//   ): Promise<Doc<"lessons">[]> => {
//     return ctx.db
//       .query("lessons")
//       .withIndex("by_tutor", (q) => q.eq("tutorId", tutorId))
//       .order("desc")
//       .collect();
//   },
// });


export const book = mutation({
  args: {
    tutorUserId: v.id("users"),
    datetime: v.string(),
    isTrial: v.boolean(),
  },
  handler: async (ctx, { tutorUserId, datetime, isTrial }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const student = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!student) throw new Error("Student not found");

    // insert lesson
    await ctx.db.insert("lessons", {
      tutorId: tutorUserId,
      studentId: student._id,
      datetime,
      status: "booked",
      durationMinutes: 60,
      cost: isTrial ? 0 : 0, // plug in real tutor.hourlyRate
      isTrial,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

export const listByTutor = query({
  args: { tutorId: v.id("users") },
  handler: async (ctx, { tutorId }) =>
    await ctx.db.query("lessons").withIndex("by_tutor", (q) => q.eq("tutorId", tutorId)).collect(),
});




