"use client";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../convex/_generated/api";

export default function Stats() {
  const stats = useQuery(api.stats.queries.getLandingPageStats);

  return (
    <div className="bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-[100px] py-8">
        <div className="flex flex-wrap justify-center gap-6">
          <div className="rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats?.activeTutors ?? "1,200+"}
            </h3>
            <p className="text-gray-500 dark:text-gray-300">Active Tutors</p>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats?.studentsEnrolled ?? "5,000+"}
            </h3>
            <p className="text-gray-500 dark:text-gray-300">
              Students Enrolled
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats?.sessionsCompleted ?? "10,000+"}
            </h3>
            <p className="text-gray-500 dark:text-gray-300">
              Sessions Completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}