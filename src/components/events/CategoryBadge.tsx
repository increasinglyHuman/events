"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_META, type EventCategory } from "@/types/events";

interface CategoryBadgeProps {
  category: EventCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const meta = CATEGORY_META[category];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-tight border",
        className,
      )}
      style={{
        color: meta.color,
        borderColor: `${meta.color}33`,
        backgroundColor: `${meta.color}11`,
      }}
    >
      {meta.label}
    </span>
  );
}
