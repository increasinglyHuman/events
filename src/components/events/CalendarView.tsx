"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_META, type CalendarEvent } from "@/types/events";
import { EventCard } from "./EventCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  events: CalendarEvent[];
  className?: string;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarView({ events, className }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const event of events) {
      const start = new Date(event.startTime);
      if (start.getFullYear() === viewYear && start.getMonth() === viewMonth) {
        const day = start.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(event);
      }
    }
    return map;
  }, [events, viewYear, viewMonth]);

  const selectedEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : [];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDay(null);
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isToday = (day: number) =>
    isSameDay(new Date(viewYear, viewMonth, day), today);

  return (
    <div className={cn("", className)}>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded hover:bg-surface-1 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold text-text-primary">{monthLabel}</h3>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded hover:bg-surface-1 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[11px] text-text-muted font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = eventsByDay.get(day) ?? [];
          const hasEvents = dayEvents.length > 0;
          const isSelected = selectedDay === day;
          const todayHighlight = isToday(day);

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-sm transition-all relative",
                hasEvents
                  ? "hover:bg-surface-1 cursor-pointer"
                  : "text-text-muted cursor-default",
                isSelected && "bg-accent/15 ring-1 ring-accent/40",
                todayHighlight && !isSelected && "ring-1 ring-accent/30",
              )}
            >
              <span className={cn("font-medium", todayHighlight && "text-accent")}>
                {day}
              </span>
              {/* Event dots */}
              {hasEvents && (
                <div className="flex items-center gap-0.5">
                  {dayEvents.slice(0, 3).map((e, idx) => (
                    <div
                      key={idx}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_META[e.category].color }}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] text-text-muted">+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      {selectedDay !== null && (
        <div className="mt-4 border-t border-border/20 pt-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">
            {new Date(viewYear, viewMonth, selectedDay).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            {selectedEvents.length > 0 && (
              <span className="text-text-muted font-normal ml-2">
                ({selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""})
              </span>
            )}
          </h4>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-text-muted">No events on this day.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
              {selectedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
