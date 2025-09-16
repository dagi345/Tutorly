import { query } from "../_generated/server";
import { v } from "convex/values";

export const getLandingPageStats = query({
  handler: async (ctx) => {
    const activeTutors = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "tutor"))
      .collect();

    const studentsEnrolled = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();

    const sessionsCompleted = await ctx.db
      .query("lessons")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();

    return {
      activeTutors: activeTutors.length,
      studentsEnrolled: studentsEnrolled.length,
      sessionsCompleted: sessionsCompleted.length,
    };
  },
});