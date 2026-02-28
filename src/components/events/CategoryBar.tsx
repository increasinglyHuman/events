"use client";

import { cn } from "@/lib/utils";
import { EVENT_CATEGORIES, CATEGORY_META, type EventCategory } from "@/types/events";
import { X } from "lucide-react";

interface CategoryBarProps {
  selected: EventCategory[];
  onToggle: (category: EventCategory) => void;
  onClear: () => void;
  className?: string;
}

export function CategoryBar({ selected, onToggle, onClear, className }: CategoryBarProps) {
  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto scrollbar-none pb-1", className)}>
      {selected.length > 0 && (
        <button
          onClick={onClear}
          className="flex shrink-0 items-center gap-1 rounded-full border border-border/40 bg-surface-0 px-2.5 py-1 text-[11px] text-text-secondary hover:bg-surface-1 hover:text-text-primary transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
      {EVENT_CATEGORIES.map((cat) => {
        const meta = CATEGORY_META[cat];
        const active = selected.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all border",
              active
                ? "border-current"
                : "border-transparent bg-surface-0 text-text-secondary hover:bg-surface-1 hover:text-text-primary",
            )}
            style={
              active
                ? { color: meta.color, backgroundColor: `${meta.color}15`, borderColor: `${meta.color}44` }
                : undefined
            }
          >
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
