
import { internalMutation } from "./_generated/server";
import { v } from "convex/values"; // only for runtime validators
import type { Id } from "./_generated/dataModel";

export const seedFull = internalMutation({
  handler: async (ctx) => {
    /* ---------- 1. Tutor users ---------- */
    const tutorUserIds: Id<"users">[] = [];
    for (let i = 1; i <= 7; i++) {
      const id = (await ctx.db.insert("users", {
        clerkId: `tutor-clerk-${i}`,
        role: "tutor",
        name: `Tutor ${i}`,
        email: `tutor${i}@demo.com`,
        avatarUrl: `https://i.pravatar.cc/80?img=${i + 20}`,
        credits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })) as Id<"users">;
      tutorUserIds.push(id);
    }

    /* ---------- 2. TutorProfiles ---------- */
    const profileIds: Id<"tutorProfiles">[] = [];
    for (const tutorUserId of tutorUserIds) {
      const pId = (await ctx.db.insert("tutorProfiles", {
        userId: tutorUserId,
        subjects: ["English", "IELTS"],
        hourlyRate: 3500,
        availability: [
          new Date(Date.now() + 86400000).toISOString(),
          new Date(Date.now() + 86400000 * 2).toISOString(),
        ],
        bio: `Certified IELTS coach.`,
        rating: 0,
        isApproved: true,
        trialUsedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })) as Id<"tutorProfiles">;
      profileIds.push(pId);
    }

    /* ---------- 3. Student users ---------- */
    const studentUserIds: Id<"users">[] = [];
    for (let i = 1; i <= 7; i++) {
      const id = (await ctx.db.insert("users", {
        clerkId: `student-clerk-${i}`,
        role: "student",
        name: `Student ${i}`,
        email: `student${i}@demo.com`,
        avatarUrl: `https://i.pravatar.cc/80?img=${i}`,
        credits: 100 * 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })) as Id<"users">;
      studentUserIds.push(id);
    }

    /* ---------- 4. Dummy lessons & reviews ---------- */
    const comments = [
      "Great first session, very clear explanations!",
      "Helped me jump from 6.0 to 7.5 in two weeks.",
      "Patient and structured approach.",
      "Could use a bit more homework feedback.",
      "Fantastic speaking practice.",
      "Explains grammar rules effortlessly.",
      "Highly recommend for IELTS writing.",
    ];

    for (const tutorUserId of tutorUserIds) {
      const reviewCount = 2 + Math.floor(Math.random() * 2); // 2-3 reviews
      for (let j = 0; j < reviewCount; j++) {
        const studentId = studentUserIds[j % studentUserIds.length] as Id<"users">;
        const rating = 3 + Math.floor(Math.random() * 3); // 3-5 stars
        const comment = comments[Math.floor(Math.random() * comments.length)];

        const lessonId = (await ctx.db.insert("lessons", {
          tutorId: tutorUserId,
          studentId,
          datetime: new Date(Date.now() + 86400000 * (j + 1)).toISOString(),
          status: "completed",
          durationMinutes: 60,
          cost: 3500,
          isTrial: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })) as Id<"lessons">;

        await ctx.db.insert("reviews", {
          tutorId: tutorUserId,
          studentId,
          lessonId,
          rating,
          comment,
          createdAt: new Date().toISOString(),
        });
      }

      /* ---------- 5. Recalc tutor rating ---------- */
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_tutor", (q) => q.eq("tutorId", tutorUserId))
        .collect();

      const avg =
        reviews.length === 0
          ? 0
          : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      const profile = await ctx.db
        .query("tutorProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", tutorUserId))
        .unique();
      if (profile) {
        await ctx.db.patch(profile._id, { rating: avg });
      }
    }
  },
});


