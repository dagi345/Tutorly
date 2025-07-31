"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Loader from "@/components/Loader";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { Button } from "@/components/ui/button";

const TutorDashboard = () => {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "skip",
  });

  const dashboardData = useQuery(
    api.dashboard.getTutorDashboardData,
    convexUser?._id ? { tutorId: convexUser._id } : "skip"
  );

  if (!dashboardData || !convexUser) {
    return <Loader />;
  }

  const {
    tutorName,
    rating,
    hourlyRate,
    lessonCount,
    upcomingLessonCount,
    upcomingLessons,
    weeklyRevenue,
    activeBookings,
    availability,
    recentReviews,
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {tutorName}
          </h1>
          <div className="flex items-center space-x-6 mt-2 text-gray-600">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">⭐</span>
              <span>{rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-1">💰</span>
              <span>${hourlyRate} / hr</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-500 mr-1">📚</span>
              <span>{lessonCount} lessons taught</span>
            </div>
            <div className="flex items-center">
              <span className="text-purple-500 mr-1">🔄</span>
              <span>{upcomingLessonCount} upcoming</span>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Lessons</CardTitle>
                <CardDescription>
                  Your lessons for the next 7 days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingLessons.length > 0 ? (
                    upcomingLessons.map((lesson) => (
                      <div
                        key={lesson._id}
                        className="flex items-center justify-between p-3 bg-gray-100 rounded-md"
                      >
                        <div>
                          <p className="font-semibold">
                            {format(new Date(lesson.datetime), "eee, hh:mm a")}
                          </p>
                          <p className="text-sm text-gray-500">
                            Student: {lesson.studentName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              lesson.status === "booked"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {lesson.status}
                          </Badge>
                          <Link href={`/lesson/${lesson.callId}`} passHref>
                            <Button size="sm">Join Room</Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No upcoming lessons in the next 7 days.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${weeklyRevenue}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{activeBookings}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{rating.toFixed(1)}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {recentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {recentReviews.map((review: Doc<"reviews"> & { studentName: string }) => (
                      <div key={review._id} className="border-b pb-2">
                        <div className="flex justify-between">
                          <p className="font-semibold">
                            {review.studentName}
                          </p>
                          <p className="text-yellow-500">
                            {"⭐".repeat(review.rating)}
                          </p>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No reviews yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>This Week's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <AvailabilityCalendar
                  availability={availability}
                  bookedSlots={upcomingLessons.map((l) => l.datetime)}
                  readOnly
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Link href="/tutors/profile" passHref>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/tutors/schedule" passHref>
                  <Button variant="outline" className="w-full">
                    My Schedule
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Teaching Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-blue-600">
                  <li>
                    <a
                      href="#"
                      className="hover:underline"
                    >
                      Best Practices for Online Tutoring
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:underline"
                    >
                      How to Keep Students Engaged
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:underline"
                    >
                      Using Virtual Whiteboards Effectively
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TutorDashboard;
