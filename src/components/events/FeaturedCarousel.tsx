"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORY_META, type CalendarEvent } from "@/types/events";
import { DateBadge } from "./DateBadge";
import { TimeBadge } from "./TimeBadge";
import { TicketInfo } from "./TicketInfo";
import { MapPin, ChevronLeft, ChevronRight, Users } from "lucide-react";

interface FeaturedCarouselProps {
  events: CalendarEvent[];
  className?: string;
}

export function FeaturedCarousel({ events, className }: FeaturedCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % events.length);
  }, [events.length]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + events.length) % events.length);
  }, [events.length]);

  useEffect(() => {
    if (paused || events.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, next, events.length]);

  if (events.length === 0) return null;

  const event = events[current];
  const catMeta = CATEGORY_META[event.category];

  return (
    <div
      className={cn("relative rounded-xl overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `linear-gradient(135deg, ${catMeta.color}18 0%, transparent 40%), linear-gradient(to right, var(--color-bg-deep) 0%, transparent 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end p-6 min-h-[280px] sm:min-h-[320px]">
        {/* Category pill */}
        <span
          className="self-start text-[11px] font-medium rounded-full px-2.5 py-0.5 mb-3 border"
          style={{
            color: catMeta.color,
            borderColor: `${catMeta.color}33`,
            backgroundColor: `${catMeta.color}11`,
          }}
        >
          {catMeta.label}
        </span>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 leading-tight">
          {event.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-2 mb-4 max-w-[600px]">
          {event.shortDescription || event.description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <DateBadge date={event.startTime} />
          <TimeBadge startTime={event.startTime} durationMinutes={event.durationMinutes} />
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <MapPin className="h-3.5 w-3.5" />
            {event.location.regionName}
          </div>
          <TicketInfo entryFee={event.entryFee} tickets={event.tickets} />
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Users className="h-3.5 w-3.5" />
            {event.attendeeCount} going
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/${event.id}`}
          className="self-start inline-flex items-center gap-2 rounded-lg bg-accent text-bg-deep px-5 py-2.5 text-sm font-bold hover:bg-accent/90 transition-colors"
        >
          View Event
        </Link>
      </div>

      {/* Nav arrows */}
      {events.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-bg-deep/60 text-text-secondary hover:bg-bg-deep/80 hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-bg-deep/60 text-text-secondary hover:bg-bg-deep/80 hover:text-text-primary transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {events.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current ? "w-6 bg-accent" : "w-1.5 bg-text-muted/40 hover:bg-text-muted/60",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
