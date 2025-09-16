import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { now } from "./_utils";

/* -------------------------------------------------
   1.  HIGH-LEVEL KPI CARDS
--------------------------------------------------*/

export const getKPIs = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const tutors = users.filter((u) => u.role === "tutor");
    const students = users.filter((u) => u.role === "student");

    const lessons = await ctx.db.query("lessons").collect();
    const completed = lessons.filter((l) => l.status === "completed");

    const revenue = completed.reduce((sum, l) => sum + l.cost, 0);

    return {
      totalUsers: users.length,
      totalTutors: tutors.length,
      totalStudents: students.length,
      totalLessons: lessons.length,
      completedLessons: completed.length,
      totalRevenue: revenue, // cents
    };
  },
});

/* -------------------------------------------------
   2.  TUTOR APPROVAL QUEUE + QUICK ACTIONS
--------------------------------------------------*/

export const pendingApprovals = query({
  handler: async (ctx) => {
    const profiles = await ctx.db.query("tutorProfiles").collect();
    const pending = [];
    for (const p of profiles) {
      if (!p.isApproved) {
        const user = await ctx.db.get(p.userId);
        pending.push({ ...p, user });
      }
    }
    return pending;
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
    await ctx.db.patch(profile._id, {
      rating: 0,
      isApproved: true,
      updatedAt: now(),
    });
  },
});

export const rejectTutor = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const profile = await ctx.db
      .query("tutorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");
    await ctx.db.patch(profile._id, {
      isApproved: false,
      updatedAt: now(),
    });
  },
});

/* -------------------------------------------------
   3.  FINANCE & PAYOUTS
--------------------------------------------------*/

export const getPendingPayouts = query({
  handler: async (ctx) => {
    const completed = await ctx.db
      .query("lessons")
      .collect()
      .then((l) => l.filter((x) => x.status === "completed"));
    const payoutsMap = new Map<string, number>();
    for (const l of completed) {
      const current = payoutsMap.get(l.tutorId.toString()) ?? 0;
      payoutsMap.set(l.tutorId.toString(), current + l.cost);
    }
    const results = [];
    for (const [tutorId, amount] of payoutsMap) {
      const user = await ctx.db.get(tutorId as Id<"users">);
      results.push({ tutor: user, amount });
    }
    return results;
  },
});

export const markPayoutSent = mutation({
  args: { tutorId: v.id("users"), amount: v.number() },
  handler: async (ctx, { tutorId, amount }) => {
    /* In real life you'd call Stripe here.
       For now we just log it in a new table or audit log. */
    // TODO: create payout record
    return { success: true };
  },
});

/* -------------------------------------------------
   4.  CONTENT MODERATION
--------------------------------------------------*/

export const removeReview = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, { reviewId }) => {
    await ctx.db.delete(reviewId);
  },
});

export const hideTutor = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const profile = await ctx.db
      .query("tutorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");
    await ctx.db.patch(profile._id, { isApproved: false, updatedAt: now() });
  },
});

/* -------------------------------------------------
   5.  ANALYTICS CHARTS
--------------------------------------------------*/

export const revenueByMonth = query({
  handler: async (ctx) => {
    const completed = await ctx.db
      .query("lessons")
      .collect()
      .then((l) => l.filter((x) => x.status === "completed"));

    const buckets: Record<string, number> = {};
    for (const l of completed) {
      const month = l.datetime.slice(0, 7); // YYYY-MM
      buckets[month] = (buckets[month] ?? 0) + l.cost;
    }
    return Object.entries(buckets).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  },
});

export const topTutors = query({
  handler: async (ctx) => {
    const tutors = await ctx.db
      .query("tutorProfiles")
      .collect()
      .then((t) => t.filter((x) => x.isApproved));
    const lessons = await ctx.db.query("lessons").collect();
    const map = new Map<string, number>();
    for (const l of lessons) {
      if (l.status === "completed") {
        const current = map.get(l.tutorId.toString()) ?? 0;
        map.set(l.tutorId.toString(), current + 1);
      }
    }
    const result = [];
    for (const t of tutors) {
      const user = await ctx.db.get(t.userId);
      result.push({
        tutor: user,
        profile: t,
        completedLessons: map.get(t.userId.toString()) ?? 0,
      });
    }
    return result.sort((a, b) => b.completedLessons - a.completedLessons);
  },
});

/* -------------------------------------------------
   6.  NEW DASHBOARD WIDGETS
--------------------------------------------------*/

export const getTopTutors = query({
  handler: async (ctx) => {
    const tutors = await ctx.db.query("tutorProfiles")
      .collect()
      .then(tutors => tutors.filter(t => t.isApproved));

    const lessonCounts = await Promise.all(
      tutors.map(async (tutor) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_tutor", (q) => q.eq("tutorId", tutor.userId))
          .filter(q => q.eq("status", "completed"))
          .collect();
        const user = await ctx.db.get(tutor.userId);
        return {
          tutorName: user?.name,
          lessonCount: lessons.length
        };
      })
    );

    return lessonCounts.sort((a, b) => b.lessonCount - a.lessonCount).slice(0, 5);
  },
});

export const getRecentLessons = query({
  handler: async (ctx) => {
    const lessons = await ctx.db.query("lessons").order("desc").take(5);
    return Promise.all(
      lessons.map(async (lesson) => {
        const tutor = await ctx.db.get(lesson.tutorId);
        const student = await ctx.db.get(lesson.studentId);
        return {
          ...lesson,
          tutorName: tutor?.name,
          studentName: student?.name,
        };
      })
    );
  },
});

export const getNewUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").take(5);
  },
});
