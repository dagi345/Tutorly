"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AdminNav() {
  const { signOut } = useClerk();
  const router = useRouter();

  const kpis = useQuery(api.admin.getKPIs);
  const pending = useQuery(api.admin.pendingApprovals);
  const payouts = useQuery(api.admin.getPendingPayouts);

  const approve = useMutation(api.admin.approveTutor);
  const markPayout = useMutation(api.admin.markPayoutSent);


  return (
    <nav className="flex gap-4 p-4 bg-slate-800 text-white">
      <Link href="/admin/dashboard">Dashboard</Link>

      <Link href="/admin/approvals">
        Approvals ({pending?.length ?? 0})
      </Link>

      <Link href="/admin/finance">
        Payouts ({payouts?.length ?? 0})
      </Link>

      <Link href="/admin/analytics">Analytics</Link>

      {/* <button
        onClick={async () => {
          await approve({ userId: pending?.[0]?.userId });
        }}
      >
        Approve First Tutor
      </button> */}

      {/* <button
        onClick={async () => {
          await markPayout({
            tutorId: payouts?.[0]?.tutor?._id,
            amount: payouts?.[0]?.amount,
          });
        }}
      >

        Mark First Payout Sent
      </button> */}

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