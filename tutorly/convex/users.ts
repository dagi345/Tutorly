import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { assertDoc, now } from "./_utils";
import { internalMutation } from "./_generated/server"; // <- note the import

// ---------- Mutations ----------
// export const createUser = mutation({
//   args: {
//     clerkId: v.string(),
//     role: v.union(v.literal("student"), v.literal("tutor")),
//     name: v.string(),
//     email: v.string(),
//     avatarUrl: v.string(),
//   },
//   handler: async (ctx, args) => {
//     return ctx.db.insert("users", { ...args, credits: 0, createdAt: now(), updatedAt: now() });
//   },
// });




export const createUser = internalMutation({   // <-- was mutation(...)
  args: {
    clerkId: v.string(),
    role: v.union(v.literal("student"), v.literal("tutor")),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const iso = new Date().toISOString();
    return ctx.db.insert("users", {
      ...args,
      credits: 0,
      createdAt: iso,
      updatedAt: iso,
    });
  },
});

export const ensureUserFromIdentity = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (existing) return existing._id;

    const iso = new Date().toISOString();
    const name =
      (identity.name as string | undefined) ||
      [identity.firstName, identity.lastName].filter(Boolean).join(" ") ||
      "Anonymous";
    const email = (identity.email as string | undefined) ?? "";
    const avatarUrl = (identity.pictureUrl as string | undefined) ?? "";

    const id = await ctx.db.insert("users", {
      clerkId: identity.subject,
      role: "student",
      name,
      email,
      avatarUrl,
      credits: 0,
      createdAt: iso,
      updatedAt: iso,
    });

    return id;
  },
});

export const addCredits = mutation({
  args: { userId: v.id("users"), amount: v.number() },
  handler: async (ctx, { userId, amount }) => {
    const user = assertDoc(await ctx.db.get(userId));
    await ctx.db.patch(userId, { credits: user.credits + amount, updatedAt: now() });
  },
});

export const deductCredits = mutation({
  args: { userId: v.id("users"), amount: v.number() },
  handler: async (ctx, { userId, amount }) => {
    const user = assertDoc(await ctx.db.get(userId));
    if (user.credits < amount) throw new Error("Insufficient credits");
    await ctx.db.patch(userId, { credits: user.credits - amount, updatedAt: now() });
    return user.credits - amount;
  },
});



// ---------- Queries ----------
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId)).unique();
  },
});

export const getUserWallet = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = assertDoc(await ctx.db.get(userId));
    return { credits: user.credits };
  },
});

export const changeRole = mutation({
  args: { userId: v.id("users"), newRole: v.union(v.literal("student"), v.literal("tutor")) },
  handler: async (ctx, { userId, newRole }) => {
    await ctx.db.patch(userId, { role: newRole, updatedAt: now() });
  },
});


export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, { userId, name, email, avatarUrl }) => {
    const updates = {
      name: name ?? undefined,
      email: email ?? undefined,
      avatarUrl: avatarUrl ?? undefined,
    };

    // If there are any updates, apply them
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates);
    }
  },
});




export const getUserRole = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    return user?.role ?? "student";
  },
});