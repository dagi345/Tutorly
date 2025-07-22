"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function TutorNav() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const profile = useQuery(
    api.tutorProfiles.getByUserId,
    { userId: user?.id ? ({ _id: user.id } as any) : undefined }
  );

  const updateProfile = useMutation(api.tutorProfiles.updateProfile);

  return (
    <nav className="flex gap-4 p-4 bg-slate-100">
      <Link href="/tutor/dashboard">Dashboard</Link>

      <Link href="/tutor/profile">Edit Profile</Link>

      <Link href="/tutor/lessons">My Lessons</Link>

      <Link href="/tutor/calendar">Calendar</Link>

      <button
        onClick={async () => {
          await updateProfile({
            userId: user?.id ? ({ _id: user.id } as any) : ("" as any),
            updates: { availability: ["2025-07-25T14:00"] },
          });
        }}
      >
        Quick Add Slot
      </button>

      <button
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
      >
        Sign Out
      </button>
    </nav>
  );
}