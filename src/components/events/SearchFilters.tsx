"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { DateFilter, PriceFilter, SortBy } from "@/hooks/useEventsSearch";
import type { MaturityRating } from "@/types/events";

interface SearchFiltersProps {
  dateFilter: DateFilter;
  onDateFilter: (f: DateFilter) => void;
  priceFilter: PriceFilter;
  onPriceFilter: (f: PriceFilter) => void;
  maturity: MaturityRating[];
  onToggleMaturity: (m: MaturityRating) => void;
  sortBy: SortBy;
  onSortBy: (s: SortBy) => void;
  className?: string;
}

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "Any Time" },
  { value: "happening-now", label: "Now" },
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "this-weekend", label: "Weekend" },
  { value: "this-month", label: "This Month" },
];

const PRICE_OPTIONS: { value: PriceFilter; label: string }[] = [
  { value: "all", label: "Any" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "soonest", label: "Soonest" },
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
];

const MATURITY_OPTIONS: { value: MaturityRating; label: string; color: string }[] = [
  { value: "G", label: "G", color: "#4ecdc4" },
  { value: "M", label: "M", color: "#ffe66d" },
  { value: "A", label: "A", color: "#ff6b6b" },
];

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-7 px-2.5 text-[11px]",
            value === opt.value
              ? "bg-accent/15 text-accent"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

export function SearchFilters({
  dateFilter,
  onDateFilter,
  priceFilter,
  onPriceFilter,
  maturity,
  onToggleMaturity,
  sortBy,
  onSortBy,
  className,
}: SearchFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {/* Date filters */}
      <PillGroup options={DATE_OPTIONS} value={dateFilter} onChange={onDateFilter} />

      <div className="h-4 w-px bg-border/30" />

      {/* Price */}
      <PillGroup options={PRICE_OPTIONS} value={priceFilter} onChange={onPriceFilter} />

      <div className="h-4 w-px bg-border/30" />

      {/* Maturity toggles */}
      <div className="flex items-center gap-1">
        {MATURITY_OPTIONS.map((opt) => {
          const active = maturity.includes(opt.value);
          return (
            <Button
              key={opt.value}
              variant="ghost"
              size="sm"
              onClick={() => onToggleMaturity(opt.value)}
              className={cn("h-7 w-7 p-0 text-[11px] font-bold rounded", active ? "" : "text-text-muted")}
              style={
                active
                  ? { color: opt.color, backgroundColor: `${opt.color}15` }
                  : undefined
              }
            >
              {opt.label}
            </Button>
          );
        })}
      </div>

      <div className="h-4 w-px bg-border/30" />

      {/* Sort */}
      <PillGroup options={SORT_OPTIONS} value={sortBy} onChange={onSortBy} />
    </div>
  );
}
