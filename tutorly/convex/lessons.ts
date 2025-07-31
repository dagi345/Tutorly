import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { now } from "./_utils";
import { api, internal } from "./_generated/api";
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
    isRecurring: v.optional(v.boolean()),
  },
  handler: async (ctx, { tutorUserId, datetime, isTrial, isRecurring }) => {
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
      isRecurring,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});




export const updateStatus = mutation({
  args: {
    lessonId: v.id("lessons"),
    status: v.union(
      v.literal("booked"),
      v.literal("started"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, { lessonId, status }) => {
    const lesson = await ctx.db.get(lessonId);
    if (!lesson) throw new Error("Lesson not found");

    // update status
    await ctx.db.patch(lessonId, { status, updatedAt: now() });
    // if cancelled, refund credits
    // if (status === "cancelled") {
    //   await ctx.runMutation(api.users.addCredits, {
    //     userId: lesson.studentId,
    //     amount: lesson.cost,
    //   });
    // }
  },
})

export const setCallId = mutation({
  args: { lessonId: v.id("lessons"), callId: v.string() },
  handler: async (ctx, { lessonId, callId }) => {
    await ctx.db.patch(lessonId, { callId });
  },
});


export const listByTutor = query({
  args: { tutorId: v.id("users") },
  handler: async (ctx, { tutorId }) =>
    await ctx.db.query("lessons").withIndex("by_tutor", (q) => q.eq("tutorId", tutorId)).collect(),
});


/* Student joins existing call (read-only) */ 


export const getCallInfo = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, { lessonId }) => {
    const lesson = await ctx.db.get(lessonId);
    return lesson;
  },
});


export const listMyBookedLessons = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_status", (q) => q.eq("status", "booked"))
      .collect();

    return await Promise.all(
      lessons
        .filter((l) => l.tutorId === user._id || l.studentId === user._id)
        .map(async (l) => ({
          ...l,
          tutor: await ctx.db.get(l.tutorId),
          student: await ctx.db.get(l.studentId),
        }))
    );
  },
});


export const listMyLessons = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db.query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Fetch lessons that are "booked"
    const bookedLessons = await ctx.db.query("lessons")
      .withIndex("by_status", q => q.eq("status", "booked"))
      .collect();

    // Fetch lessons that are "started"
    const startedLessons = await ctx.db.query("lessons")
      .withIndex("by_status", q => q.eq("status", "started"))
      .collect();

    // Filter "started" lessons to only include those started within the last hour 
    const now = new Date();
    const oneHour = 60 * 60 * 1000;
    const recentStartedLessons = startedLessons.filter(lesson => {
      const lessonStartTime = new Date(lesson.updatedAt);
      return now.getTime() - lessonStartTime.getTime() < oneHour;
    });

    const allLessons = [...bookedLessons, ...recentStartedLessons];
    const userLessons = allLessons.filter((l) => l.tutorId === user._id || l.studentId === user._id);

    return await Promise.all(
      userLessons.map(async (l) => ({
        ...l,
        tutor: await ctx.db.get(l.tutorId),
        student: await ctx.db.get(l.studentId),
      }))
    );
  },
});








export const listMyJoinableLessons = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db.query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const lessons = await ctx.db
      .query("lessons")
      .filter(q => q.or(
        q.eq("status", "booked"),
        q.eq("status", "started")
      ))
      .collect();

    return await Promise.all(
      lessons
        .filter((l) => l.studentId === user._id)
        .map(async (l) => ({
          ...l,
          tutor: await ctx.db.get(l.tutorId),
        }))
    );
  },
});



export const cancelStaleBookedLessons = internalMutation({
  handler: async (ctx) => {
    const now = new Date();

    const bookedLessons = await ctx.db
      .query("lessons")
      .withIndex("by_status", (q) => q.eq("status", "booked"))
      .collect();

    const lessonsToCancel = bookedLessons.filter(lesson => {
        const tenMinutes = 10 * 60 * 1000;
        const lessonStartTime = new Date(lesson.datetime);
        return now.getTime() - lessonStartTime.getTime() > tenMinutes;
    });

    for (const lesson of lessonsToCancel) {
      await ctx.db.patch(lesson._id, { 
        status: "cancelled", 
        updatedAt: new Date().toISOString() 
      });

      if (lesson.cost > 0) {
        await ctx.runMutation(api.users.addCredits, {
            userId: lesson.studentId,
            amount: lesson.cost,
        });
      }
    }
  }
});







