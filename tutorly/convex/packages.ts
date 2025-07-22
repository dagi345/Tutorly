import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const buyPackage = mutation({
  args: {
    userId: v.id("users"),
    packageId: v.union(
      v.literal("5-lesson"),
      v.literal("10-lesson"),
      v.literal("trial")
    ),
  },
  handler: async (
    ctx,
    { userId, packageId }
  ): Promise<void> => {
    const map: Record<string, number> = {
      "trial": 0,
      "5-lesson": 5,
      "10-lesson": 10,
    };
    const credits = map[packageId] * 1000; // 1 lesson = 1000 cents demo
    await ctx.runMutation(api.users.addCredits, { userId, amount: credits });
  },
});