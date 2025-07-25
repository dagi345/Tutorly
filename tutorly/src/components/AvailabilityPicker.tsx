"use client";
import { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

type AvailabilityPickerProps = {
  onChange: (slots: string[]) => void;
};

export default function AvailabilityPicker({ onChange }: AvailabilityPickerProps) {
  const [selected, setSelected] = useState<Record<string, number[]>>({});

  // update parent whenever selection changes
  useEffect(() => {
    const flat = Object.entries(selected)
      .flatMap(([day, hrs]) =>
        hrs.map((h) =>
          new Date(new Date().setHours(h, 0, 0, 0))
            .toISOString()
            .slice(0, 16)
            .replace("T", "T" + h.toString().padStart(2, "0") + ":00")
        )
      );
    onChange(flat);
  }, [selected]);

  const handleDayToggle = (day: string, active: boolean) => {
    setSelected((prev) => {
      if (active) {
        return { ...prev, [day]: prev[day] ?? [] };
      } else {
        const { [day]: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const handleHourToggle = (day: string, hour: number, active: boolean) => {
    setSelected((prev) => {
      const daySlots = prev[day] ?? [];
      const newSlots = active
        ? [...daySlots, hour]
        : daySlots.filter((h) => h !== hour);
      return { ...prev, [day]: newSlots };
    });
  };

  return (
    <div className="space-y-4">
      <Label>Weekly Availability (click day → hours)</Label>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day) => (
          <div key={day} className="border rounded p-2">
            <ToggleGroup
              type="single"
              value={selected[day] ? day : ""}
              onValueChange={(v) => handleDayToggle(day, v === day)}
              className="w-full"
            >
              <ToggleGroupItem value={day} className="w-full text-xs">
                {day}
              </ToggleGroupItem>
            </ToggleGroup>
            {selected[day] && (
              <div className="mt-2 grid grid-cols-3 gap-1">
                {HOURS.map((h) => (
                  <ToggleGroupItem
                    key={h}
                    value={String(h)}
                    className={`h-8 text-xs ${
                      selected[day]?.includes(h) ? "bg-green-600 text-white" : ""
                    }`}
                    onClick={() => handleHourToggle(day, h, !selected[day]?.includes(h))}
                  >
                    {h.toString().padStart(2, "0")}:00
                  </ToggleGroupItem>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}