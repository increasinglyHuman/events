"use client";

import { Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecurrenceRule } from "@/types/events";

interface RecurrenceBadgeProps {
  recurrence: RecurrenceRule;
  className?: string;
}

function recurrenceLabel(r: RecurrenceRule): string {
  switch (r.frequency) {
    case "daily":
      return r.interval === 1 ? "Daily" : `Every ${r.interval} days`;
    case "weekly":
      return r.interval === 1 ? "Weekly" : `Every ${r.interval} weeks`;
    case "biweekly":
      return "Biweekly";
    case "monthly":
      return r.interval === 1 ? "Monthly" : `Every ${r.interval} months`;
    default:
      return "Recurring";
  }
}

export function RecurrenceBadge({ recurrence, className }: RecurrenceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-surface-1/80 px-2 py-0.5 text-[11px] text-text-secondary",
        className,
      )}
    >
      <Repeat className="h-3 w-3" />
      {recurrenceLabel(recurrence)}
    </span>
  );
}
