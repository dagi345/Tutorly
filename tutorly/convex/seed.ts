import { internalMutation } from "./_generated/server";
import { api } from "./_generated/api";

export const seedDummyTutors = internalMutation({
  handler: async (ctx) => {
    // 1️⃣  Insert users with fake Clerk IDs
    const userIds = [];
    for (let i = 1; i <= 7; i++) {
      const userId = await ctx.db.insert("users", {
        clerkId: `dummy-clerk-${i}`,
        role: "tutor",
        name: `Tutor ${i}`,
        email: `tutor${i}@dummy.com`,
        avatarUrl: "https://i.pravatar.cc/80",
        credits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      userIds.push(userId);
    }

    // 2️⃣  Insert profiles linked to those users
    for (let i = 0; i < userIds.length; i++) {
      await ctx.db.insert("tutorProfiles", {
  userId: userIds[i],
  subjects: ["English", "IELTS"],
  hourlyRate: 3500,
  availability: [new Date(Date.now() + 86400000 * (i + 1)).toISOString()],
  bio: `Certified IELTS coach #${i + 1}.`,
  rating: 4.9,
  isApproved: true,        // ← required
  trialUsedCount: 0,       // ← required
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
    }
  },
});