"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
type DayOfWeek = typeof DAYS_OF_WEEK[number];

type Slot = { weekday: DayOfWeek; startHour: number; endHour: number };

const formatHour = (hour: number) => String(hour).padStart(2, '0') + ':00';

const calculateNextDate = (weekday: DayOfWeek, startHour: number) => {
    const dayIndexMap: Record<DayOfWeek, number> = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    const now = new Date();
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const currentUTCDay = date.getUTCDay();
    const targetUTCDay = dayIndexMap[weekday];
    
    date.setUTCDate(date.getUTCDate() - currentUTCDay + targetUTCDay);
    date.setUTCHours(startHour, 0, 0, 0);

  return date.toISOString();
};

const convertISOToSlots = (isoStrings: string[]): Slot[] => {
    const slotsByDay: Record<string, number[]> = {};
    if(isoStrings) {
        isoStrings.forEach(iso => {
            const d = new Date(iso);
            const day = DAYS_OF_WEEK[d.getUTCDay()];
            const hour = d.getUTCHours();
            if (!slotsByDay[day]) slotsByDay[day] = [];
            slotsByDay[day].push(hour);
        });
    }

    const newMergedSlots: Slot[] = [];
    Object.keys(slotsByDay).forEach(day => {
        slotsByDay[day].sort((a, b) => a - b);
        let currentBlock: Slot | null = null;
        slotsByDay[day].forEach(hour => {
            if (currentBlock && currentBlock.endHour === hour) {
                currentBlock.endHour = hour + 1;
            } else {
                if (currentBlock) newMergedSlots.push(currentBlock);
                currentBlock = { weekday: day as DayOfWeek, startHour: hour, endHour: hour + 1 };
            }
        });
        if (currentBlock) newMergedSlots.push(currentBlock);
    });

    newMergedSlots.sort((a, b) => DAYS_OF_WEEK.indexOf(a.weekday) - DAYS_OF_WEEK.indexOf(b.weekday));
    return newMergedSlots;
};

const convertSlotsToISO = (slots: Slot[]): string[] => {
    return slots.flatMap(slot => {
        const hours = [];
        for (let h = slot.startHour; h < slot.endHour; h++) {
            hours.push(calculateNextDate(slot.weekday, h));
        }
        return hours;
    });
};

interface AvailabilityPickerProps {
  value?: string[];
  onChange: (value: string[]) => void;
}

export default function AvailabilityPicker({ value = [], onChange }: AvailabilityPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<{ dayIndex: number; hour: number } | null>(null);
  const [dragCurrentCell, setDragCurrentCell] = useState<{ dayIndex: number; hour: number } | null>(null);
  const [initialDragAction, setInitialDragAction] = useState<boolean | null>(null);

  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    setAvailableSlots(convertISOToSlots(value));
  }, [value]);
  
  const handleSlotsChange = (newSlots: Slot[]) => {
    const newISO = convertSlotsToISO(newSlots);
    // Only call onChange if the value has actually changed.
    if (JSON.stringify(newISO.sort()) !== JSON.stringify(value.sort())) {
        onChange(newISO);
    }
    setAvailableSlots(newSlots);
  };

  const isSlotAvailable = useCallback((weekday: DayOfWeek, hour: number) => {
      return availableSlots.some(slot =>
        slot.weekday === weekday && hour >= slot.startHour && hour < slot.endHour
      );
  }, [availableSlots]);

  const handleCellMouseDown = useCallback((dayIndex: number, hour: number) => {
      setIsDragging(true);
      setDragStartCell({ dayIndex, hour });
      setDragCurrentCell({ dayIndex, hour });
      const isCurrentlyAvailable = isSlotAvailable(DAYS_OF_WEEK[dayIndex], hour);
      setInitialDragAction(!isCurrentlyAvailable);
  }, [isSlotAvailable]);

  const handleCellMouseEnter = useCallback((dayIndex: number, hour: number) => {
      if (isDragging) {
          setDragCurrentCell({ dayIndex, hour });
      }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
      if (!isDragging || !dragStartCell || !dragCurrentCell) {
          if (isDragging) setIsDragging(false);
          return;
      }

      const startDay = Math.min(dragStartCell.dayIndex, dragCurrentCell.dayIndex);
      const endDay = Math.max(dragStartCell.dayIndex, dragCurrentCell.dayIndex);
      const startHour = Math.min(dragStartCell.hour, dragCurrentCell.hour);
      const endHour = Math.max(dragStartCell.hour, dragCurrentCell.hour);

      let tempSlots = new Set<string>();
      availableSlots.forEach(slot => {
          for (let h = slot.startHour; h < slot.endHour; h++) {
              tempSlots.add(`${slot.weekday}-${h}`);
          }
      });

      for (let d = startDay; d <= endDay; d++) {
          for (let h = startHour; h <= endHour; h++) {
              const cellKey = `${DAYS_OF_WEEK[d]}-${h}`;
              if (initialDragAction) {
                  tempSlots.add(cellKey);
              } else {
                  tempSlots.delete(cellKey);
              }
          }
      }
      
      const newSlots = convertISOToSlots(Array.from(tempSlots).map(s => {
          const [day, hour] = s.split('-');
          return calculateNextDate(day as DayOfWeek, parseInt(hour, 10));
      }));

      handleSlotsChange(convertISOToSlots(convertSlotsToISO(newSlots)));

      setIsDragging(false);
      setDragStartCell(null);
      setDragCurrentCell(null);
      setInitialDragAction(null);
  }, [isDragging, dragStartCell, dragCurrentCell, initialDragAction, availableSlots, onChange]);

  useEffect(() => {
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [handleMouseUp]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 font-inter antialiased">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Set Your Weekly Availability
            </h1>
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 text-center">
                <p>
                    <span className="font-semibold">Instructions:</span> Click or click-and-drag to select/deselect your available hours.
                </p>
            </div>

            <div
                className="grid gap-px bg-gray-300 rounded-lg overflow-hidden border border-gray-300"
                style={{ gridTemplateColumns: `60px repeat(${DAYS_OF_WEEK.length}, minmax(0, 1fr))` }}
                onMouseLeave={handleMouseUp}
            >
                <div className="h-10 bg-gray-200 border-b border-r border-gray-300"></div>

                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="h-10 bg-gray-200 flex items-center justify-center font-semibold text-gray-800 text-sm border-b border-gray-300 capitalize">
                        {day.substring(0, 3)}
                    </div>
                ))}

                {hoursOfDay.map(hour => (
                    <React.Fragment key={hour}>
                        <div className="h-8 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 border-r border-gray-300">
                            {formatHour(hour)}
                        </div>
                        {DAYS_OF_WEEK.map((weekday, dayIndex) => {
                            const isUnderDrag = isDragging && dragStartCell && dragCurrentCell &&
                                dayIndex >= Math.min(dragStartCell.dayIndex, dragCurrentCell.dayIndex) &&
                                dayIndex <= Math.max(dragStartCell.dayIndex, dragCurrentCell.dayIndex) &&
                                hour >= Math.min(dragStartCell.hour, dragCurrentCell.hour) &&
                                hour <= Math.max(dragStartCell.hour, dragCurrentCell.hour);

                            let isHighlighted = isSlotAvailable(weekday, hour);
                            if (isUnderDrag) {
                                isHighlighted = initialDragAction ?? false;
                            }

                            return (
                                <div
                                    key={`${weekday}-${hour}`}
                                    className={`w-full h-8 flex items-center justify-center text-xs cursor-pointer ${isHighlighted ? 'bg-blue-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                                    onMouseDown={() => handleCellMouseDown(dayIndex, hour)}
                                    onMouseEnter={() => handleCellMouseEnter(dayIndex, hour)}
                                />
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    </div>
  );
}
