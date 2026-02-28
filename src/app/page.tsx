"use client";

import { useMemo } from "react";
import { useEventsSearch } from "@/hooks/useEventsSearch";
import { FAKE_EVENTS } from "@/data/fake-events";
import { FAKE_VENUES } from "@/data/fake-venues";
import { EventsNav } from "@/components/events/EventsNav";
import { CategoryBar } from "@/components/events/CategoryBar";
import { SearchFilters } from "@/components/events/SearchFilters";
import { SearchResults } from "@/components/events/SearchResults";
import { FeaturedCarousel } from "@/components/events/FeaturedCarousel";
import { EventStrip } from "@/components/events/EventStrip";
import { VenueCard } from "@/components/events/VenueCard";
import type { CalendarEvent } from "@/types/events";

function isHappeningNow(e: CalendarEvent): boolean {
  const now = new Date().toISOString();
  return e.startTime <= now && e.endTime > now && e.status === "in_progress";
}

function isToday(e: CalendarEvent): boolean {
  const today = new Date();
  const start = new Date(e.startTime);
  return (
    start.getFullYear() === today.getFullYear() &&
    start.getMonth() === today.getMonth() &&
    start.getDate() === today.getDate() &&
    e.status !== "cancelled" &&
    e.status !== "completed"
  );
}

function isThisWeek(e: CalendarEvent): boolean {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const start = new Date(e.startTime);
  return start >= now && start <= weekEnd && e.status !== "cancelled" && e.status !== "completed";
}

export default function EventsLanding() {
  const search = useEventsSearch();

  const featured = useMemo(
    () => FAKE_EVENTS.filter((e) => e.featured && e.status === "published"),
    [],
  );

  const happeningNow = useMemo(
    () => FAKE_EVENTS.filter(isHappeningNow),
    [],
  );

  const todayEvents = useMemo(
    () => FAKE_EVENTS.filter(isToday).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [],
  );

  const thisWeek = useMemo(
    () => FAKE_EVENTS.filter(isThisWeek).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [],
  );

  const recurring = useMemo(
    () =>
      FAKE_EVENTS.filter(
        (e) => e.recurrence && e.status !== "cancelled" && e.status !== "completed",
      ),
    [],
  );

  const popularVenues = useMemo(
    () => [...FAKE_VENUES].sort((a, b) => b.rating - a.rating).slice(0, 10),
    [],
  );

  const showBrowse = !search.isSearchActive && !search.hasActiveFilters;

  return (
    <div className="min-h-screen flex flex-col">
      <EventsNav query={search.filters.query} onQueryChange={search.setQuery} />

      <main className="flex-1 px-4 py-4 space-y-6 max-w-[1400px] mx-auto w-full">
        {/* Category bar */}
        <CategoryBar
          selected={search.filters.categories}
          onToggle={search.toggleCategory}
          onClear={() => search.setCategories([])}
        />

        {/* Filters */}
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

        {/* Conditional: search results OR browse strips */}
        {!showBrowse ? (
          <SearchResults
            results={search.results}
            query={search.filters.query}
          />
        ) : (
          <div className="space-y-8">
            {/* Featured carousel */}
            {featured.length > 0 && (
              <FeaturedCarousel events={featured} />
            )}

            {/* Happening Now */}
            {happeningNow.length > 0 && (
              <EventStrip
                title="Happening Now"
                events={happeningNow}
                variant="featured"
              />
            )}

            {/* Today's Events */}
            {todayEvents.length > 0 && (
              <EventStrip title="Today's Events" events={todayEvents} />
            )}

            {/* This Week */}
            {thisWeek.length > 0 && (
              <EventStrip title="This Week" events={thisWeek} />
            )}

            {/* Popular Venues */}
            {popularVenues.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-3 px-1">
                  Popular Venues
                </h2>
                <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
                  {popularVenues.map((venue) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </div>
              </section>
            )}

            {/* Recurring Favorites */}
            {recurring.length > 0 && (
              <EventStrip title="Recurring Favorites" events={recurring} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 px-4 py-6 mt-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <span>poqpoq Events &middot; Part of the poqpoq ecosystem</span>
          <div className="flex items-center gap-4">
            <a href="https://poqpoq.com/world/" className="hover:text-text-secondary transition-colors">World</a>
            <a href="https://poqpoq.com/marketplace/" className="hover:text-text-secondary transition-colors">Marketplace</a>
            <a href="https://poqpoq.com" className="hover:text-text-secondary transition-colors">poqpoq.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
