// src/app/tutors/[id]/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { GenericId } from "convex/values";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { format, parseISO, isBefore, startOfDay, addDays } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function TutorDetailPage() {
  const params = useParams();
  const tutorProfileId = params.id as GenericId<"tutorProfiles">;

  const { user } = useUser();
  const tutor = useQuery(api.tutorProfiles.getByTutorProfileId, {
    tutorProfileId,
  });

  const lessons = useQuery(
    api.lessons.listByTutor,
    tutor?.user ? { tutorId: tutor.user._id } : "skip"
  );
  const reviews = useQuery(
  api.reviews.listByTutor,
  tutor?.user ? { tutorUserId: tutor.user._id } : "skip"
);

  const bookLesson = useMutation(api.lessons.book);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (!tutor) return <p className="p-8 text-center">Loading…</p>;

  /* ---------- helpers ---------- */
  const bookedSlots = new Set(
    (lessons || [])
      .filter((l) => l.status === "booked")
      .map((l) => l.datetime)
  );

  const now = new Date();

  /* ---------- build weekly timetable ---------- */
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timetable = DAYS.map((label, idx) => {
    const dayDate = addDays(startOfDay(now), idx - now.getDay() + 1); // Mon-Sun of current week
    const slots = (tutor.availability || [])
      .map((iso) => {
        const slot = parseISO(iso);
        if (isNaN(slot.getTime())) return null;
        const slotDay = slot.getDay();
        if (slotDay !== idx) return null; // not this weekday
        return iso;
      })
      .filter(Boolean) as string[];
    return { label, dayDate, slots };
  }).filter((d) => d.slots.length > 0);

  /* ---------- render ---------- */
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-lg md:flex-row"
      >
        <Avatar className="h-32 w-32">
          <AvatarImage src={tutor.user.avatarUrl} />
          <AvatarFallback>{tutor.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{tutor.user.name}</h1>
          <p className="text-slate-600">{tutor.bio}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400" />
              {tutor.rating.toFixed(1)}
            </span>
            <span>💰 ${tutor.hourlyRate / 100} / hr</span>
            <span>{tutor.subjects.join(", ")}</span>
          </div>
        </div>
      </motion.section>

      {/* AVAILABILITY TIMETABLE */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-10"
      >
        <h2 className="mb-4 text-2xl font-semibold">Weekly Availability</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
          {timetable.map(({ label, slots }) => (
            <div key={label} className="flex flex-col gap-2">
              <span className="text-center font-semibold text-slate-700">
                {label}
              </span>
              <div className="flex flex-col gap-2">
                {slots.map((iso) => {
                  const slotDate = parseISO(iso);
                  const booked = bookedSlots.has(iso);
                  const past = isBefore(slotDate, now);

                  return (
                    <motion.button
                      key={iso}
                      whileHover={!past && !booked ? { scale: 1.03 } : {}}
                      whileTap={!past && !booked ? { scale: 0.97 } : {}}
                      disabled={past || booked}
                      onClick={() => {
                        setSelectedSlot(iso);
                        setModalOpen(true);
                      }}
                      className={`w-full rounded-lg px-2 py-2 text-sm font-bold transition 
                        ${past
                          ? "cursor-not-allowed bg-gray-300 text-gray-500"
                          : booked
                          ? "cursor-not-allowed bg-gray-300 text-gray-700"
                          : "bg-emerald-500 text-white hover:bg-emerald-600" }`}
                    >
                      {format(slotDate, "HH:mm")}
                      {booked && <span className="block text-[10px]">Booked</span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* REVIEWS */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12"
      >
        <h2 className="mb-4 text-2xl font-semibold">Student Reviews</h2>
        <div className="space-y-4">
          {reviews?.length ? (
            reviews.map((r) => (
              <Card key={r._id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={r.student?.avatarUrl} />
                    <AvatarFallback>{r.student?.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{r.student?.name}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < r.rating ? "text-amber-400 " : "text-gray-300"
                          }`}
                          fill={i < r.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{r.comment}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-slate-500">No reviews yet.</p>
          )}
        </div>
      </motion.section>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-xl bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold">Confirm lesson</h3>
              <p className="my-2 text-sm">
                {format(parseISO(selectedSlot), "PPpp")} with {tutor.user.name}
              </p>
              <p className="mb-4 text-sm text-slate-600">
                Cost: ${tutor.hourlyRate / 100}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!user?.id) {
                      alert("Please sign in first");
                      return;
                    }
                    await bookLesson({
                      tutorUserId: tutor.user._id,
                      datetime: selectedSlot,
                      isTrial: false,
                    });
                    setModalOpen(false);
                  }}
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-white"
                >
                  Book
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}