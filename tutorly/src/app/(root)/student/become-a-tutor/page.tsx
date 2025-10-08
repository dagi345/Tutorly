"use client";
import { motion } from "framer-motion";
import { CheckCircle, Eye, Clock, UserCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const formSchema = z.object({
  subjects: z.string().min(1, "At least one subject"),
  hourlyRate: z.number().min(5).max(1000),
  bio: z.string().min(20, "Tell us a bit about yourself"),
  availability: z.array(z.string()),
  planTemplateTitle: z.string().optional(),
  planTemplateCount: z.number().min(1).optional(),
});
type FormValues = z.infer<typeof formSchema>;

// ---------- Availability picker ----------
function AvailabilityPicker({ onChange }: { onChange: (slots: string[]) => void }) {
  const [selected, setSelected] = useState<Record<string, number[]>>({});
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
  const isoSlots = Object.entries(selected).flatMap(([day, hrs]) => {
    const base = new Date();                 // today
    const dayIndex = DAYS.indexOf(day);      // 0-6
    const diff = (dayIndex + 7 - base.getDay()) % 7;
    const date = new Date(base);
    date.setDate(base.getDate() + diff);     // move to correct weekday
    return hrs.map(h => {
      date.setHours(h, 0, 0, 0);
      return date.toISOString();             // ✅ full ISO
    });
  });
  onChange(isoSlots);
}, [selected, onChange]);

  const toggleDay = (day: string, active: boolean) =>
    setSelected(prev => {
      if (active) {
        return { ...prev, [day]: prev[day] ?? [] };
      } else {
        const { [day]: _, ...rest } = prev;
        return rest;
      }
    });

  const toggleHour = (day: string, hour: number, active: boolean) =>
    setSelected(prev => {
      const list = prev[day] ?? [];
      return { ...prev, [day]: active ? [...list, hour] : list.filter(h => h !== hour) };
    });

  return (
    <div className="space-y-4">
      <Label>Weekly Availability (click day → hours)</Label>
      <div className="flex gap-4  p-2 overflow-x-auto">
        {DAYS.map(day => (
          <div key={day} className="border rounded p-2 w-[180px] ">
            <Badge
              variant={selected[day] ? "default" : "outline"}
              className="w-full cursor-pointer"
              onClick={() => toggleDay(day, !selected[day])}
            >
              {day}
            </Badge>
            {selected[day] && (
              <div className="mt-2 grid grid-cols-3 gap-1 w-[160px]">
                {HOURS.map(h => (
                  <Badge
                    key={h}
                    variant={selected[day]?.includes(h) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleHour(day, h, !selected[day]?.includes(h))}
                  >
                    {h.toString().padStart(2, "0")}:00
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}



// ---------- become-tutor page ----------
export default function BecomeTutorPage() {
  const { user } = useUser();
  const router = useRouter();
  const createProfile = useMutation(api.tutorProfiles.createProfile);
  const updateProfile = useMutation(api.tutorProfiles.updateTutorProfile);
  const changeRole = useMutation(api.users.changeRole);
  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id ?? "" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjects: "",
      hourlyRate: 25,
      bio: "",
      availability: [],
      planTemplateTitle: "",
      planTemplateCount: 5,
    },
  });

  if (!user) return <p className="p-4 h-screen flex items-center justify-center">Please sign in to become a tutor.</p>;
  if (!convexUser) return <p className="p-4 h-screen flex items-center justify-center">Loading…</p>;

 async function onSubmit(values: FormValues) {
  if (!convexUser) return;

  if (convexUser.role === "tutor") {
    toast.error("You are already a tutor!");
    return;
  }

  await createProfile({
    userId: convexUser._id,
    subjects: values.subjects.split(",").map(s => s.trim()),
    hourlyRate: values.hourlyRate,
    availability: values.availability,
    bio: values.bio,
  });

  if (values.planTemplateTitle) {
    await updateProfile({
      userId: convexUser._id,
      updates: {
        planTemplate: { title: values.planTemplateTitle, lessonCount: values.planTemplateCount! },
      },
    });
  }

  await changeRole({ userId: convexUser._id, newRole: "tutor" });

  toast.success("Profile created! You are now a tutor.");
  router.push(`/tutor/dashboard`);
}

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Hero + stats (unchanged) */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Share your knowledge, earn on your schedule.
            </h1>
            <p className="text-lg text-slate-600">
              Join thousands of tutors helping students worldwide. Set your own rates, choose your timetable, and grow your brand.
            </p>
            <div className="flex justify-center gap-8">
              <div>
                <p className="text-2xl font-bold text-sky-600">15 000+</p>
                <p className="text-sm text-slate-500">Students helped</p>
              </div>
              <Separator orientation="vertical" />
              <div>
                <p className="text-2xl font-bold text-sky-600">4.9 ★</p>
                <p className="text-sm text-slate-500">Average rating</p>
              </div>
            </div>
          </div>

          {/* Wider form card */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Complete your tutor profile</CardTitle>
              <p className="text-sm text-slate-500">Fill every required field below</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="subjects"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subjects (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="English, Math, Coding" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly rate (USD)</FormLabel>
                        <Slider
                          min={5}
                          max={200}
                          step={5}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                        <p className="text-sm">${field.value}</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Bio</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AvailabilityPicker onChange={(slots) => form.setValue("availability", slots)} />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="planTemplateTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Learning plan title (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="IELTS Crash Course" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="planTemplateCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lessons in plan</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Submit & Become Tutor
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}