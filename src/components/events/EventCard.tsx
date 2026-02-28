"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORY_META, OCCUPANCY_META, type CalendarEvent } from "@/types/events";
import { DateBadge } from "./DateBadge";
import { MaturityBadge } from "./MaturityBadge";
import { TimeBadge } from "./TimeBadge";
import { RecurrenceBadge } from "./RecurrenceBadge";
import { TicketInfo } from "./TicketInfo";
import { OrganizerAvatar } from "./OrganizerAvatar";
import { MapPin, Users, Radio } from "lucide-react";

interface EventCardProps {
  event: CalendarEvent;
  variant?: "featured" | "compact";
  className?: string;
}

export function EventCard({ event, variant = "compact", className }: EventCardProps) {
  const catMeta = CATEGORY_META[event.category];
  const isFeatured = variant === "featured";
  const isLive = event.status === "in_progress";
  const isCancelled = event.status === "cancelled";

  return (
    <Link
      href={`/${event.id}`}
      className={cn(
        "group/card relative flex flex-col rounded-lg overflow-hidden border border-border/30 bg-surface-0 transition-all duration-200",
        "hover:border-border/60 hover:bg-surface-1/50",
        isFeatured ? "w-[280px] min-w-[280px]" : "w-[200px] min-w-[200px]",
        isCancelled && "opacity-50",
        className,
      )}
    >
      {/* Cover image area */}
      <div
        className={cn(
          "relative overflow-hidden",
          isFeatured ? "aspect-[16/9]" : "aspect-[4/3]",
        )}
      >
        {/* Cover image or gradient fallback */}
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${catMeta.color}22 0%, ${catMeta.color}08 50%, transparent 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-deep/80" />

        {/* Category color stripe (top edge) */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ backgroundColor: catMeta.color }}
        />

        {/* Top-left: Date badge */}
        <div className="absolute top-2 left-2">
          <DateBadge date={event.startTime} />
        </div>

        {/* Top-right: Maturity badge */}
        {event.maturity !== "G" && (
          <div className="absolute top-2 right-2">
            <MaturityBadge rating={event.maturity} />
          </div>
        )}

        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600/90 backdrop-blur-sm rounded px-1.5 py-0.5">
            <Radio className="h-3 w-3 text-white animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase">Live</span>
          </div>
        )}

        {/* Cancelled overlay */}
        {isCancelled && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-deep/60">
            <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Cancelled</span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-bg-deep via-bg-deep/80 to-transparent",
            "translate-y-full group-hover/card:translate-y-0 transition-transform duration-300",
          )}
        >
          <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-3">
            {event.shortDescription || event.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <TimeBadge startTime={event.startTime} durationMinutes={event.durationMinutes} />
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-text-muted">
            <MapPin className="h-3 w-3" />
            {event.location.regionName}
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex flex-col gap-1.5 p-2.5">
        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary leading-tight line-clamp-1 group-hover/card:text-accent transition-colors">
          {event.title}
        </h3>

        {/* Organizer */}
        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <OrganizerAvatar name={event.organizerName} avatar={event.organizerAvatar} size="sm" />
          <span className="truncate">{event.organizerName}</span>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2">
          <TicketInfo entryFee={event.entryFee} tickets={event.tickets} className="text-xs" />

          {isLive && event.occupancy && (
            <div className="flex items-center gap-1 text-[10px]" style={{ color: OCCUPANCY_META[event.occupancy].color }}>
              <span>{OCCUPANCY_META[event.occupancy].symbol}</span>
              <span>{event.currentVisitors}</span>
            </div>
          )}

          {!isLive && (
            <div className="flex items-center gap-1 text-[10px] text-text-muted">
              <Users className="h-3 w-3" />
              <span>{event.attendeeCount}</span>
            </div>
          )}
        </div>

        {/* Recurrence badge */}
        {event.recurrence && (
          <RecurrenceBadge recurrence={event.recurrence} className="self-start" />
        )}
      </div>
    </Link>
  );
}
