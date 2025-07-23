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

// export const approveTutor = mutation({
//   args: { userId: v.id("users") },
//   handler: async (ctx, { userId }) => {
//     const profile = await ctx.db
//       .query("tutorProfiles")
//       .withIndex("by_userId", (q) => q.eq("userId", userId))
//       .unique();
//     if (!profile) throw new Error("Profile not found");
//     await ctx.db.patch(profile._id, { rating: 0, updatedAt: now() });
//   },
// });

// ---------- Queries ----------
// export const listApproved = query({
//   handler: async (ctx) => {
//     return ctx.db.query("tutorProfiles").collect(); // filter by rating !== undefined in UI
//   },
// });






export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("tutorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});




// convex/tutorProfiles.ts






// convex/tutorProfiles.ts


// Existing queries...

// convex/tutorProfiles.ts


export const listApprovedFiltered = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.number(),
    days: v.optional(v.array(v.string())),      // ["Mon","Tue"]
    hours: v.optional(v.array(v.number())),     // [8,14,19]
  },
  handler: async (ctx, { cursor, limit, days, hours }) => {
    let start = cursor ? new Date(cursor).getTime() : 0;

    const rows = await ctx.db.query("tutorProfiles").collect();
    let approved = rows
      .filter((t) => t.isApproved)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // multi-day & multi-hour filter
    if (days?.length || hours?.length) {
      approved = approved.filter((t) =>
        t.availability.some((slot) => {
          const d = new Date(slot);
          const dayOk = !days?.length || days.includes(d.toLocaleDateString("en-US", { weekday: "short" }));
          const hourOk = !hours?.length || hours.includes(d.getHours());
          return dayOk && hourOk;
        })
      );
    }

    const idx = cursor ? approved.findIndex((t) => new Date(t.createdAt).getTime() > start) : 0;
    const page = approved.slice(idx, idx + limit);
    const nextCursor =
      page.length === limit && idx + limit < approved.length
        ? page[page.length - 1].createdAt
        : null;

    const enriched = await Promise.all(
      page.map(async (t) => {
        const user = await ctx.db.get(t.userId);
        return { ...t, user };
      })
    );

    return { tutors: enriched, nextCursor };
  },
});




export const searchApproved = query({
  args: { q: v.string() },
  handler: async (ctx, { q }) => {
    const rows = await ctx.db.query("tutorProfiles").collect();
    const hits = rows
      .filter((t) => t.isApproved)
      .filter(
        (t) =>
          (t.subjects ?? []).some((s) =>
            s.toLowerCase().includes(q.toLowerCase())
          )
      );

    const enriched = await Promise.all(
      hits.map(async (t) => {
        const user = await ctx.db.get(t.userId);
        return { ...t, user };
      })
    );

    return { tutors: enriched, nextCursor: null };
  },
});


export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) =>
    ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId)).unique(),
});

export const getLessonCount = query({
  args: { tutorId: v.id("users") },
  handler: async (ctx, { tutorId }) =>
    ctx.db
      .query("lessons")
      .withIndex("by_tutor", (q) => q.eq("tutorId", tutorId))
      .collect()
      .then((rows) => rows.filter((l) => l.status === "completed").length),
});

export const hasBooked = query({
  args: { tutorId: v.id("users"), studentId: v.id("users") },
  handler: async (ctx, { tutorId, studentId }) =>
    !!(await ctx.db
      .query("lessons")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .collect()).find((l) => l.tutorId === tutorId),
});