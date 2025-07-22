// convex/clerkWebhook.ts
import { v } from "convex/values";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const handleClerkUserCreated = httpAction(async (ctx, req) => {
  const payload = await req.json();
  const { type, data } = payload;

  if (type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = data;

    await ctx.runMutation(internal.users.createUser, {
      clerkId: id,
      role: "student",
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim() || "Anonymous",
      email: email_addresses[0]?.email_address ?? "",
      avatarUrl: image_url ?? "",
    });
  }

  return new Response("ok", { status: 200 });
});