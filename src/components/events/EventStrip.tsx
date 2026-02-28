"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventCard } from "./EventCard";
import type { CalendarEvent } from "@/types/events";

interface EventStripProps {
  title: string;
  events: CalendarEvent[];
  variant?: "featured" | "compact";
  className?: string;
}

export function EventStrip({ title, events, variant = "compact", className }: EventStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rafRef = useRef<number>(0);
  const dirRef = useRef<"left" | "right" | null>(null);

  const updateScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScroll, { passive: true });
    const ro = new ResizeObserver(updateScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScroll);
      ro.disconnect();
    };
  }, [updateScroll, events]);

  const startScroll = useCallback((dir: "left" | "right") => {
    dirRef.current = dir;
    const step = () => {
      const el = scrollRef.current;
      if (!el || !dirRef.current) return;
      el.scrollLeft += dirRef.current === "right" ? 4 : -4;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const stopScroll = useCallback(() => {
    dirRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const scrollBy = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = dir === "right" ? 300 : -300;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  if (events.length === 0) return null;

  return (
    <section className={cn("relative group/strip", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        <div className="flex items-center gap-1 opacity-0 group-hover/strip:opacity-100 transition-opacity">
          <button
            onClick={() => scrollBy("left")}
            disabled={!canScrollLeft}
            className="p-1 rounded hover:bg-surface-1 disabled:opacity-20 text-text-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollBy("right")}
            disabled={!canScrollRight}
            className="p-1 rounded hover:bg-surface-1 disabled:opacity-20 text-text-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div className="relative">
        {/* Left edge hover zone */}
        {canScrollLeft && (
          <div
            className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-bg-deep/80 to-transparent opacity-0 group-hover/strip:opacity-100 transition-opacity cursor-pointer"
            onMouseEnter={() => startScroll("left")}
            onMouseLeave={stopScroll}
          />
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-none pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} variant={variant} />
          ))}
        </div>

        {/* Right edge hover zone */}
        {canScrollRight && (
          <div
            className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-bg-deep/80 to-transparent opacity-0 group-hover/strip:opacity-100 transition-opacity cursor-pointer"
            onMouseEnter={() => startScroll("right")}
            onMouseLeave={stopScroll}
          />
        )}
      </div>
    </section>
  );
}
