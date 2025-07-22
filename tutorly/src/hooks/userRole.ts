import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function useRole() {
  const { user } = useUser();
  return useQuery(api.users.getUserByClerkId, { clerkId: user?.id ?? "" })?.role;
}