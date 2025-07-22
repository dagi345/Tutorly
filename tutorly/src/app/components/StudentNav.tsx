"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api"; // Adjust the path as needed

export function StudentNav() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });

  return (
    <nav className="bg-white shadow-md p-4 flex gap-4 p-5">
      <Link href="/student/dashboard" className="text-blue-500 hover:underline">Dashboard</Link>
      <Link href="/student/browse-tutors" className="text-blue-500 hover:underline">Browse Tutors</Link>
      <Link href="/student/become-tutor" className="text-blue-500 hover:underline">Become a Tutor</Link>
      {/* only show if role === student */}
    </nav>
  );
}