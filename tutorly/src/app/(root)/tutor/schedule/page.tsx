"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import LessonCard from "@/components/LessonCard";

export default function TutorSchedules() {
  const { user } = useUser();
  const lessons = useQuery(
    api.lessons.listMyBookedLessons,
    user ? {} : "skip"
  );

  console.log(lessons)

  const futureBooked = lessons?.filter(
    (l) => l.status === "booked" && new Date(l.datetime) >= new Date()
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Schedule</h1>
      {futureBooked?.length ? (
        futureBooked.map((l) => <LessonCard key={l._id} lesson={l} role="tutor"/>)
      ) : (
        <p>No upcoming lessons.</p>
      )}
    </div>
  );
}
