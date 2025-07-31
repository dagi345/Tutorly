"use client";
import React from "react";
import { format } from "date-fns";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
type DayOfWeek = typeof DAYS_OF_WEEK[number];

const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

interface AvailabilityCalendarProps {
  availability: string[];
  bookedSlots: string[];
  readOnly?: boolean;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availability,
  bookedSlots,
  readOnly = false,
}) => {
  const availableSlots = new Set(
    availability.map((iso) => {
      const d = new Date(iso);
      return `${DAYS_OF_WEEK[d.getUTCDay()]}-${d.getUTCHours()}`;
    })
  );

  const upcomingSlots = new Set(
    bookedSlots.map((iso) => {
      const d = new
 
Date(iso);
      return `${DAYS_OF_WEEK[d.getUTCDay()]}-${d.getUTCHours()}`;
    })
  );

  return (
    <div className="grid grid-cols-8 gap-1 text-xs">
      <div></div>
      {DAYS_OF_WEEK.map((day) => (
        <div key={day} className="text-center font-semibold">
          {day.slice(0, 3)}
        </div>
      ))}

      {hoursOfDay.map((hour) => (
        <React.Fragment key={hour}>
          <div className="text-center text-gray-500">
            {format(new Date(0, 0, 0, hour), "ha")}
          </div>
          {DAYS_OF_WEEK.map((day) => {
            const slotId = `${day}-${hour}`;
            const isAvailable = availableSlots.has(slotId);
            const isBooked = upcomingSlots.has(slotId);

            return (
              <div
                key={slotId}
                className={`h-8 w-full rounded-sm ${
                  isBooked
                    ? "bg-red-400"
                    : isAvailable
                    ? "bg-green-300"
                    : "bg-gray-200"
                } ${!readOnly && "cursor-pointer"}`}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default AvailabilityCalendar;
