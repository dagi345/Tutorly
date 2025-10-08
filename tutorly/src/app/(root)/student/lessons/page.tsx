"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import LessonCard from "@/components/LessonCard";

export default function StudentLessons() {
  const { user } = useUser();
  const lessons = useQuery(
    api.lessons.listMyLessons,
    user ? {} : "skip"
  );


  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Lessons</h1>
      {lessons?.length ? (
        lessons.map((l) => <LessonCard key={l._id} lesson={l} role="student" />)
      ) : (
        <p> No lessons found. </p>
      )}
    </div>
  );

}

