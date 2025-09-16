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
    // ✅ normalize every slot to ISO
    const isoSlots = args.availability.map(d => new Date(d).toISOString());

    return ctx.db.insert("tutorProfiles", {
      userId: args.userId,
      subjects: args.subjects,
      hourlyRate: args.hourlyRate,
      bio: args.bio,
      availability: isoSlots, // <-- cleaned
      trialUsedCount: 0,
      rating: 0,
      isApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateTutorProfile = mutation({
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

    // ✅ if availability is being updated, sanitize it
    const cleanedUpdates = { ...updates };
    if (updates.availability) {
      cleanedUpdates.availability = updates.availability.map(d =>
        new Date(d).toISOString()
      );
    }

    await ctx.db.patch(profile._id, { ...cleanedUpdates, updatedAt: new Date().toISOString() });
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






export const getTutorByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("tutorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});



export const getByTutorProfileId = query({
  args: { tutorProfileId: v.id("tutorProfiles") },
  handler: async (ctx, { tutorProfileId }) => {
    // 1️⃣  get the tutor profile
    const profile = await ctx.db.get(tutorProfileId);
    if (!profile) return null;

    // 2️⃣  get the matching user row
    const user = await ctx.db.get(profile.userId);
    if (!user) return null;

    // 3️⃣  return a single object with everything
    return {
      ...profile,
      user, // the entire users row
    };
  },
});



export const getUnapprovedTutors = query({
  handler: async (ctx) => {
    const unapproved = await ctx.db
      .query("tutorProfiles")
      .collect();

    const enriched = [];
    for (const profile of unapproved) {
      if (!profile.isApproved) {
        const user = await ctx.db.get(profile.userId);
        enriched.push({ ...profile, user });
      }
    }
    return enriched;
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



// convex/tutorProfiles.ts
export const recalcRating = mutation({
  args: { tutorUserId: v.id("users") },
  handler: async (ctx, { tutorUserId }) => {
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
    if (!profile) return;

    await ctx.db.patch(profile._id, { rating: avg });
  },
});




export const setAvailability = mutation({
  args: {
    userId: v.id("users"),
    availability: v.array(v.string()),
  },
  handler: async (ctx, { userId, availability }) => {
    const profile = await ctx.db
      .query("tutorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Tutor profile not found");
    await ctx.db.patch(profile._id, { availability });
  },
});