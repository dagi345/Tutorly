import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const getTutorDashboardData = query({
  args: { tutorId: v.id("users") },
  handler: async (ctx, { tutorId }) => {
    const tutorProfile = await ctx.db
      .query("tutorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", tutorId))
      .unique();

    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }

    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_tutor", (q) => q.eq("tutorId", tutorId))
      .collect();

    const upcomingLessons = allLessons
      .filter((lesson) => {
        const lessonDate = new Date(lesson.datetime);
        return (
          lessonDate >= now &&
          lessonDate <= oneWeekFromNow &&
          lesson.status === "booked"
        );
      })
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    const lessonCount = allLessons.filter(
      (l) => l.status === "completed"
    ).length;

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyRevenue = allLessons
      .filter(
        (lesson) =>
          lesson.status === "completed" &&
          new Date(lesson.updatedAt) >= sevenDaysAgo
      )
      .reduce((total, lesson) => total + lesson.cost, 0);

    const activeBookings = allLessons.filter(
      (lesson) => lesson.status === "booked"
    ).length;

    const enrichedUpcomingLessons = await Promise.all(
      upcomingLessons.map(async (lesson) => {
        const student = await ctx.db.get(lesson.studentId);
        return {
          ...lesson,
          studentName: student?.name ?? "Unknown",
        };
      })
    );

    const recentReviews = await ctx.db
      .query("reviews")
      .withIndex("by_tutor", (q) => q.eq("tutorId", tutorId))
      .order("desc")
      .take(3);

    const enrichedRecentReviews = await Promise.all(
      recentReviews.map(async (review) => {
        const student = await ctx.db.get(review.studentId);
        return {
          ...review,
          studentName: student?.name ?? "Anonymous",
        };
      })
    );

    return {
      tutorName: (await ctx.db.get(tutorId))?.name,
      rating: tutorProfile.rating,
      hourlyRate: tutorProfile.hourlyRate,
      lessonCount,
      upcomingLessonCount: upcomingLessons.length,
      upcomingLessons: enrichedUpcomingLessons,
      weeklyRevenue,
      activeBookings,
      availability: tutorProfile.availability,
      recentReviews: enrichedRecentReviews,
    };
  },
});
