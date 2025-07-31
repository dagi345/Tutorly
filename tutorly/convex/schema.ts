import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /* ==========  USERS  ========== */
  users: defineTable({
    clerkId: v.string(),
    role: v.union(v.literal("student"), v.literal("tutor"), v.literal("admin")), // ← you already had roles
    name: v.string(),
    email: v.string(),
    avatarUrl: v.string(),
    credits: v.number(), // wallet in cents (0 by default)
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_role", ["role"]),

  /* ==========  TUTOR PROFILE  ========== */
  tutorProfiles: defineTable({
    userId: v.id("users"),
    subjects: v.array(v.string()),
    hourlyRate: v.number(), // cents
    availability: v.array(
      // store as ISO strings like "2025-07-19T10:00" or split later
      v.string()
    ),
    bio: v.string(),
    rating: v.number(),
    isApproved: v.boolean(),
    trialUsedCount: v.number(),
    createdAt: v.string(),
    updatedAt: v.string()
  })
    .index("by_userId", ["userId"]),

  /* ==========  LESSONS (BOOKINGS)  ========== */
lessons: defineTable({
  tutorId: v.id("users"),
  studentId: v.id("users"),
  datetime: v.string(),
  status: v.union(v.literal("booked"), v.literal("started"), v.literal("completed"), v.literal("cancelled")),
  durationMinutes: v.number(),
  cost: v.number(),
  isTrial: v.boolean(),
  isRecurring: v.optional(v.boolean()),
  callId: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
})
  .index("by_tutor", ["tutorId"])
  .index("by_student", ["studentId"])
  .index("by_status", ["status"]),

  
  /* ==========  REVIEWS  ========== */
  reviews: defineTable({
    tutorId: v.id("users"),
    studentId: v.id("users"),
    lessonId: v.id("lessons"),
    rating: v.number(), // 1–5
    comment: v.string(),
    createdAt: v.string(),
  })
    .index("by_tutor", ["tutorId"])
    .index("by_lesson", ["lessonId"]),

  /* ==========  CHAT  ========== */
  messages: defineTable({
    channelId: v.string(),          // Stream channel id
    senderId: v.id("users"),
    content: v.string(),
    timestamp: v.string(),
    sentAtStream: v.boolean(),      // true = synced from Stream
    createdAt: v.string(),
    updatedAt: v.string()
  })
  .index("by_channel", ["channelId"]),

});