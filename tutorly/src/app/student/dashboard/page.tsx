"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion } from "framer-motion";
import TutorCard from "../../../components/TutorCard";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function StudentDashboardPage() {
  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<number[]>([]);

  const tutors = useQuery(api.tutorProfiles.listApprovedFiltered, {
    cursor: undefined,
    limit: 50,
    days: selectedDays.length ? selectedDays : undefined,
    hours: selectedHours.length ? selectedHours : undefined,
  });

  const filtered =
    tutors?.tutors.filter(
      (t) =>
        (!q ||
          t.subjects.some((s) => s.toLowerCase().includes(q.toLowerCase())) ||
          (t.user &&
            t.user.name &&
            t.user.name.toLowerCase().includes(q.toLowerCase()))) &&
        t.hourlyRate <= maxPrice
    ) ?? [];

  const clearFilters = () => {
    setSelectedDays([]);
    setSelectedHours([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Find your perfect 1:1 tutor
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              Personalised online tutoring for every subject, skill level, and
              schedule.
            </p>
            <Badge className="mt-4">2 000+ tutors • 4.9 ★ Trustpilot</Badge>
          </div>

          {/* 4-column grid filter bar */}
          <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-4 items-center">
            {/* Search (2 cols) */}
            <div className="md:col-span-2">
              <Label className="text-sm font-semibold">
                What do you want to learn?
              </Label>
              <Input
                placeholder="e.g. Chemistry, JavaScript"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Price (1 col) */}
            <div>
              <Label className="text-sm font-semibold">
                Max price ${maxPrice / 100}
              </Label>
              <Slider
                min={500}
                max={10000}
                step={100}
                value={[maxPrice]}
                onValueChange={(v) => setMaxPrice(v[0])}
                className="mt-1"
              />
            </div>

            {/* Availability accordion (1 col) */}
            <div className="w-full lg:w-auto">
              <Label className="text-sm font-semibold">Availability</Label>
              <Accordion type="single" collapsible>
                <AccordionItem value="availability">
                  <AccordionTrigger className="w-full flex justify-between items-center">
                    <Label className="text-sm font-semibold">
                      Availability
                    </Label>
                    {(selectedDays.length || selectedHours.length) && (
                      <Badge variant="outline">
                        {selectedDays.length}d • {selectedHours.length}h
                      </Badge>
                    )}
                  </AccordionTrigger>

                  <AccordionContent className="space-y-4 pt-2">
                    {/* Days */}
                    <Label className="block mb-2">Days</Label>
                    <ToggleGroup
                      type="multiple"
                      value={selectedDays}
                      onValueChange={setSelectedDays}
                      className="flex-wrap gap-1"
                    >
                      {DAYS.map((d) => (
                        <ToggleGroupItem
                          key={d}
                          value={d}
                          className="px-2 py-1 text-xs"
                        >
                          {d}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>

                    {/* Hours grid */}
                    <Label className="block mt-4 mb-2">Hours</Label>
                    <ToggleGroup
                      type="multiple"
                      value={selectedHours.map(String)}
                      onValueChange={(vals) =>
                        setSelectedHours(vals.map(Number))
                      }
                      className="grid grid-cols-6 gap-1"
                    >
                      {HOURS.map((h) => (
                        <ToggleGroupItem
                          key={h}
                          value={String(h)}
                          onClick={() =>
                            setSelectedHours((prev) =>
                              prev.includes(h)
                                ? prev.filter((x) => x !== h)
                                : [...prev, h]
                            )
                          }
                          className="h-8 text-xs"
                        >
                          {h.toString().padStart(2, "0")}:00
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full mt-3"
                    >
                      Clear
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">
                {filtered.length} tutors available
              </h3>
            </div>

            {filtered.length === 0 ? (
              <Card className="text-center py-10">
                <p className="text-muted-foreground">
                  No tutors match your criteria. Try adjusting the filters.
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 ">
                {filtered.map((tutor) => (
                  <TutorCard key={tutor._id} tutor={tutor} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
