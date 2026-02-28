"use client";

import { useCallback } from "react";
import type { CalendarEvent } from "@/types/events";

export function useCalendarExport() {
  const downloadICS = useCallback((event: CalendarEvent) => {
    const start = formatICSDate(event.startTime);
    const end = formatICSDate(event.endTime);
    const loc = event.location.regionName +
      (event.location.coordinates
        ? ` (${event.location.coordinates.x}, ${event.location.coordinates.y}, ${event.location.coordinates.z})`
        : "");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//poqpoq//Events//EN",
      "BEGIN:VEVENT",
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeICS(event.title)}`,
      `DESCRIPTION:${escapeICS(event.shortDescription ?? event.description)}`,
      `LOCATION:${escapeICS(loc)}`,
      `URL:https://poqpoq.com/events/${event.id}/`,
      `UID:${event.id}@poqpoq.com`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const googleCalendarUrl = useCallback((event: CalendarEvent) => {
    const start = formatGCalDate(event.startTime);
    const end = formatGCalDate(event.endTime);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${start}/${end}`,
      details: event.shortDescription ?? event.description.slice(0, 500),
      location: event.location.regionName,
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  }, []);

  return { downloadICS, googleCalendarUrl };
}

function formatICSDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
}

function formatGCalDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z/, "Z");
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,\n]/g, (c) =>
    c === "\n" ? "\\n" : `\\${c}`
  );
}
