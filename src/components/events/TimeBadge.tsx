"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeBadgeProps {
  startTime: string;
  durationMinutes: number;
  className?: string;
}

function formatDuration(mins: number): string {
  if (mins >= 1440) return `${Math.round(mins / 1440)}d`;
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  }
  return `${mins}m`;
}

export function TimeBadge({ startTime, durationMinutes, className }: TimeBadgeProps) {
  const dt = new Date(startTime);
  const time = dt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className={cn("flex items-center gap-1.5 text-xs text-text-secondary", className)}>
      <Clock className="h-3 w-3" />
      <span>{time}</span>
      <span className="text-text-muted">·</span>
      <span className="text-text-muted">{formatDuration(durationMinutes)}</span>
    </div>
  );
}
