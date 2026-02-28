"use client";

import { cn } from "@/lib/utils";
import { EventCard } from "./EventCard";
import { Search } from "lucide-react";
import type { CalendarEvent } from "@/types/events";

interface SearchResultsProps {
  results: CalendarEvent[];
  query: string;
  className?: string;
}

export function SearchResults({ results, query, className }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
        <Search className="h-12 w-12 text-text-muted/30 mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-1">No events found</h3>
        <p className="text-sm text-text-muted max-w-sm">
          {query
            ? `No results for "${query}". Try different keywords or adjust your filters.`
            : "No events match your current filters. Try broadening your search."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      <p className="text-sm text-text-muted mb-4">
        {results.length} event{results.length !== 1 ? "s" : ""} found
        {query && <> for &ldquo;{query}&rdquo;</>}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {results.map((event) => (
          <EventCard key={event.id} event={event} className="w-full min-w-0" />
        ))}
      </div>
    </div>
  );
}
