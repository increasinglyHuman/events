"use client";

import { useState } from "react";
import { useEventsSearch } from "@/hooks/useEventsSearch";
import { EventsNav } from "@/components/events/EventsNav";
import { CategoryBar } from "@/components/events/CategoryBar";
import { SearchFilters } from "@/components/events/SearchFilters";
import { SearchResults } from "@/components/events/SearchResults";
import { CalendarView } from "@/components/events/CalendarView";
import { Button } from "@/components/ui/button";
import { LayoutGrid, CalendarDays, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventCard } from "@/components/events/EventCard";

type ViewMode = "grid" | "list" | "calendar";

export default function ExplorePage() {
  const search = useEventsSearch({ hideCompleted: false, hideCancelled: false });
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <div className="min-h-screen flex flex-col">
      <EventsNav query={search.filters.query} onQueryChange={search.setQuery} />

      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-4">
        {/* Controls */}
        <div className="space-y-4 mb-6">
          <CategoryBar
            selected={search.filters.categories}
            onToggle={search.toggleCategory}
            onClear={() => search.setCategories([])}
          />

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <SearchFilters
              dateFilter={search.filters.dateFilter}
              onDateFilter={search.setDateFilter}
              priceFilter={search.filters.priceFilter}
              onPriceFilter={search.setPriceFilter}
              maturity={search.filters.maturity}
              onToggleMaturity={search.toggleMaturity}
              sortBy={search.filters.sortBy}
              onSortBy={search.setSortBy}
            />

            {/* View toggle */}
            <div className="flex items-center gap-1 border border-border/30 rounded-lg p-0.5">
              {([
                { mode: "grid" as const, icon: LayoutGrid },
                { mode: "list" as const, icon: List },
                { mode: "calendar" as const, icon: CalendarDays },
              ]).map(({ mode, icon: Icon }) => (
                <Button
                  key={mode}
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "h-7 w-7 p-0",
                    viewMode === mode
                      ? "bg-accent/15 text-accent"
                      : "text-text-muted hover:text-text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === "calendar" ? (
          <CalendarView events={search.results} />
        ) : viewMode === "list" ? (
          <div className="space-y-2">
            <p className="text-sm text-text-muted mb-4">
              {search.resultCount} event{search.resultCount !== 1 ? "s" : ""}
            </p>
            {search.results.map((event) => (
              <EventCard key={event.id} event={event} variant="featured" className="w-full min-w-0" />
            ))}
          </div>
        ) : (
          <SearchResults
            results={search.results}
            query={search.filters.query}
          />
        )}
      </div>
    </div>
  );
}
