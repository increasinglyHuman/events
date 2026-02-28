"use client";

import { cn } from "@/lib/utils";

interface DateBadgeProps {
  date: string;
  className?: string;
}

export function DateBadge({ date, className }: DateBadgeProps) {
  const dt = new Date(date);
  const month = dt.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = dt.getDate();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md bg-bg-deep/90 backdrop-blur-sm px-2 py-1 min-w-[42px]",
        className,
      )}
    >
      <span className="text-[10px] font-bold leading-none tracking-wider text-accent">
        {month}
      </span>
      <span className="text-lg font-bold leading-tight text-text-primary">
        {day}
      </span>
    </div>
  );
}
