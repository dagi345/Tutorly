"use client";
import Link from "next/link";
import { useUser, useClerk, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api"; // Adjust the path as needed
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function NavBar() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    { clerkId: user?.id ?? "" }
  );

  const role = convexUser?.role;

  if (!role) return null; // still loading

  /* ---------- NAV LINKS BY ROLE ---------- */
  const links: Record<string, { label: string; href: string }[]> = {
    student: [
      
      { label: "Browse-Tutors", href: "/student/dashboard" },
      { label: "Become-a-Tutor", href: "/student/become-a-tutor" },
      { label: "Upcoming-Lessons", href: "/student/lessons"},
    ],
    tutor: [
      { label: "Dashboard", href: "/tutors/dashboard" },
      { label: "Profile", href: "/tutors/profile" },
      { label: "Schedules", href: "/tutors/schedule" },
    ],
    admin: [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Approvals", href: "/admin/approvals" },
      { label: "Payouts", href: "/admin/finance" },
    ],
  };

  const roleLinks = links[role] ?? [];

  return (
    <nav className="flex items-center gap-4 p-4 bg-slate-100 shadow px-[150px]">

        <Image src="/tutorly-logo.png" alt="Logo" width={150} height={150} />

        <div className="ml-auto flex items-center gap-6 ">
            {roleLinks.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-md font-medium hover:text-blue-600"
        >
          {l.label}
        </Link>
      ))}
            <UserButton />
            {/* <Button variant="outline" onClick={() => signOut()}>
            Sign Out
            </Button> */}
        </div>
    </nav>
  );
}