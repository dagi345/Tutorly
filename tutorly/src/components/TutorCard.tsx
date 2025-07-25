"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Star } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasBooked } from "../../convex/tutorProfiles";

type TutorCardProps = {
  tutor: {
    _id: string;
    user: { name: string; avatarUrl?: string } | null;
    hourlyRate: number;
    rating: number;
    bio: string;
    subjects: string[];
    userId: string;
    createdAt: string;
    isApproved: boolean;
  };
};

export default function TutorCard({ tutor }: TutorCardProps) {
  const { user } = useUser();

  
  // 1️⃣  fetch once
  
  const lessonCount = useQuery(api.tutorProfiles.getLessonCount, {
    tutorId: tutor.userId as Id<"users">,
  });
  
 const currentUser = useQuery(api.users.getCurrentUser, { clerkId: user?.id ?? "" });
const hasPrevious = useQuery(
  api.tutorProfiles.hasBooked,
  currentUser ? { tutorId: tutor.userId as Id<"users">, studentId: currentUser._id } : "skip"
);

console.log("blalaaaaaaaaaaaaaaaaaaaaaaaaaaaa", hasPrevious);

  // helper
  const yearsOnPlatform = Math.round(
    (Date.now() - new Date(tutor.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)
  );

  const buttonText = hasPrevious ? "Book Lesson" : "Book Free Trial";


  console.log(tutor)


  

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col border-2 px-4">
      <div className="flex p-4 gap-4">
        <Image
          src={tutor.user?.avatarUrl || "/placeholder.png"}
          alt={tutor.user?.name ?? ""}
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
        <div className="flex-1">

          <div className="flex justify-between">
              <h3 className="font-bold text-lg">{tutor.user?.name}</h3>
              <div className="">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star size={14} className="fill-amber-400" />
                  {tutor.rating?.toFixed(1)} Avg rating
                </div>
                <p className="text-sm">{tutor.hourlyRate / 100} USD / lesson</p>
              </div>
          </div>
         

          {/* badges */}
          <div className="flex gap-2 mt-2">
            {tutor.isApproved && (

              <Badge className="bg-green-100 text-green-800">
                <CheckCircle size={12} className="mr-1" />
                Approved
              </Badge>
            )}
            <Badge className="bg-green-100 text-green-800">Available this week</Badge>

          </div>
        </div>
      </div>

      <CardContent className="flex-grow space-y-2 px-4 pb-4">
        <p className="text-sm text-slate-700 line-clamp-3">{tutor.bio}</p>
        <p className="text-sm">Subjects: {tutor.subjects.join(", ")}</p>
        <p className="text-xs">
          {lessonCount ?? 0} lessons taught •  in {yearsOnPlatform}+ years on Tutorly
        </p>

        <div className="w-full  flex justify-end ">
          <Link href={`/tutor/${tutor._id}`}>
          <Button size="lg" className="text-md">
            {buttonText}
          </Button>
        </Link>
        </div>
      </CardContent>
    </Card>
  );
}