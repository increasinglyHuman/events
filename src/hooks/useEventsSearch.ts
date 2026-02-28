"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { CalendarEvent, EventCategory, MaturityRating } from "@/types/events";
import { FAKE_EVENTS } from "@/data/fake-events";

/* ─── Filter types ──────────────────────────────────────── */

export type DateFilter =
  | "all"
  | "happening-now"
  | "today"
  | "this-week"
  | "this-weekend"
  | "this-month";

export type PriceFilter = "all" | "free" | "paid";
export type SortBy = "soonest" | "popular" | "newest" | "rating";

export interface SearchFilters {
  query: string;
  categories: EventCategory[];
  maturity: MaturityRating[];
  dateFilter: DateFilter;
  priceFilter: PriceFilter;
  sortBy: SortBy;
  hideCompleted: boolean;
  hideCancelled: boolean;
}

export const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  categories: [],
  maturity: ["G"],
  dateFilter: "all",
  priceFilter: "all",
  sortBy: "soonest",
  hideCompleted: true,
  hideCancelled: true,
};

export interface SearchResult {
  event: CalendarEvent;
  score: number;
}

export interface UseEventsSearchReturn {
  filters: SearchFilters;
  setQuery: (q: string) => void;
  toggleCategory: (c: EventCategory) => void;
  setCategories: (c: EventCategory[]) => void;
  toggleMaturity: (m: MaturityRating) => void;
  setMaturity: (m: MaturityRating[]) => void;
  setDateFilter: (f: DateFilter) => void;
  setPriceFilter: (f: PriceFilter) => void;
  setSortBy: (s: SortBy) => void;
  setHideCompleted: (h: boolean) => void;
  setHideCancelled: (h: boolean) => void;
  resetFilters: () => void;
  results: CalendarEvent[];
  resultCount: number;
  isSearchActive: boolean;
  hasActiveFilters: boolean;
}

/* ─── Debounce helper ───────────────────────────────────── */

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebounced(value), delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debounced;
}

/* ─── Date helpers ──────────────────────────────────────── */

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

function getDateRange(filter: DateFilter): [Date, Date] | null {
  if (filter === "all") return null;

  const now = new Date();

  if (filter === "happening-now") {
    return [now, now];
  }

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  if (filter === "today") return [todayStart, todayEnd];

  if (filter === "this-week") {
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
    return [todayStart, endOfDay(weekEnd)];
  }

  if (filter === "this-weekend") {
    const dayOfWeek = now.getDay();
    const daysUntilSat = dayOfWeek <= 5 ? 6 - dayOfWeek : 0;
    const satStart = new Date(todayStart);
    satStart.setDate(satStart.getDate() + daysUntilSat);
    const sunEnd = new Date(satStart);
    sunEnd.setDate(sunEnd.getDate() + 1);
    return [startOfDay(satStart), endOfDay(sunEnd)];
  }

  // this-month
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return [todayStart, endOfDay(monthEnd)];
}

/* ─── Relevance scoring ─────────────────────────────────── */

function scoreEvent(event: CalendarEvent, q: string): number {
  if (!q) return 0;
  const lower = q.toLowerCase();
  const terms = lower.split(/\s+/).filter(Boolean);
  let score = 0;

  for (const term of terms) {
    if (event.title.toLowerCase().includes(term)) score += 5;
    if (event.location.regionName.toLowerCase().includes(term)) score += 3;
    if (event.organizerName.toLowerCase().includes(term)) score += 3;
    if (event.category.toLowerCase().includes(term)) score += 2;
    if (event.description.toLowerCase().includes(term)) score += 1;
    if (event.tags.some((t) => t.toLowerCase().includes(term))) score += 1;
  }

  return score;
}

/* ─── Hook ──────────────────────────────────────────────── */

export function useEventsSearch(
  initialFilters?: Partial<SearchFilters>,
): UseEventsSearchReturn {
  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const debouncedQuery = useDebounce(filters.query, 150);

  const setQuery = useCallback((q: string) => {
    setFilters((f) => ({ ...f, query: q }));
  }, []);

  const toggleCategory = useCallback((c: EventCategory) => {
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }));
  }, []);

  const setCategories = useCallback((c: EventCategory[]) => {
    setFilters((f) => ({ ...f, categories: c }));
  }, []);

  const toggleMaturity = useCallback((m: MaturityRating) => {
    setFilters((f) => ({
      ...f,
      maturity: f.maturity.includes(m)
        ? f.maturity.filter((x) => x !== m)
        : [...f.maturity, m],
    }));
  }, []);

  const setMaturity = useCallback((m: MaturityRating[]) => {
    setFilters((f) => ({ ...f, maturity: m }));
  }, []);

  const setDateFilter = useCallback((dateFilter: DateFilter) => {
    setFilters((f) => ({ ...f, dateFilter }));
  }, []);

  const setPriceFilter = useCallback((priceFilter: PriceFilter) => {
    setFilters((f) => ({ ...f, priceFilter }));
  }, []);

  const setSortBy = useCallback((sortBy: SortBy) => {
    setFilters((f) => ({ ...f, sortBy }));
  }, []);

  const setHideCompleted = useCallback((hideCompleted: boolean) => {
    setFilters((f) => ({ ...f, hideCompleted }));
  }, []);

  const setHideCancelled = useCallback((hideCancelled: boolean) => {
    setFilters((f) => ({ ...f, hideCancelled }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
  }, [initialFilters]);

  const isSearchActive = debouncedQuery.length > 0;

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.maturity.length !== 1 ||
    filters.maturity[0] !== "G" ||
    filters.dateFilter !== "all" ||
    filters.priceFilter !== "all" ||
    isSearchActive;

  const results = useMemo(() => {
    let items = [...FAKE_EVENTS];

    // Status filters
    if (filters.hideCompleted) {
      items = items.filter((e) => e.status !== "completed");
    }
    if (filters.hideCancelled) {
      items = items.filter((e) => e.status !== "cancelled");
    }

    // Maturity filter
    if (filters.maturity.length > 0) {
      items = items.filter((e) => filters.maturity.includes(e.maturity));
    }

    // Category filter
    if (filters.categories.length > 0) {
      items = items.filter((e) => filters.categories.includes(e.category));
    }

    // Date filter
    const dateRange = getDateRange(filters.dateFilter);
    if (dateRange) {
      const [rangeStart, rangeEnd] = dateRange;
      if (filters.dateFilter === "happening-now") {
        const now = rangeStart.toISOString();
        items = items.filter((e) => e.startTime <= now && e.endTime > now);
      } else {
        const start = rangeStart.toISOString();
        const end = rangeEnd.toISOString();
        items = items.filter(
          (e) => e.startTime <= end && e.endTime >= start,
        );
      }
    }

    // Price filter
    if (filters.priceFilter === "free") {
      items = items.filter((e) => e.entryFee === 0);
    } else if (filters.priceFilter === "paid") {
      items = items.filter((e) => e.entryFee > 0);
    }

    // Search query + scoring
    if (debouncedQuery) {
      const scored: SearchResult[] = items.map((event) => ({
        event,
        score: scoreEvent(event, debouncedQuery),
      }));
      items = scored
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.event);
    } else {
      // Sort
      switch (filters.sortBy) {
        case "soonest":
          items.sort((a, b) => a.startTime.localeCompare(b.startTime));
          break;
        case "popular":
          items.sort((a, b) => b.trafficScore - a.trafficScore);
          break;
        case "newest":
          items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          break;
        case "rating":
          items.sort((a, b) => b.hostReputationScore - a.hostReputationScore);
          break;
      }
    }

    return items;
  }, [debouncedQuery, filters]);

  return {
    filters,
    setQuery,
    toggleCategory,
    setCategories,
    toggleMaturity,
    setMaturity,
    setDateFilter,
    setPriceFilter,
    setSortBy,
    setHideCompleted,
    setHideCancelled,
    resetFilters,
    results,
    resultCount: results.length,
    isSearchActive,
    hasActiveFilters,
  };
}
