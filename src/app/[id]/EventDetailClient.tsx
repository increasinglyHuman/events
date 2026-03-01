"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORY_META, OCCUPANCY_META, type CalendarEvent } from "@/types/events";
import { EventsNav } from "@/components/events/EventsNav";
import type { Venue } from "@/types/venues";
import type { OrganizerProfile } from "@/types/social";
import { DateBadge } from "@/components/events/DateBadge";
import { TimeBadge } from "@/components/events/TimeBadge";
import { CategoryBadge } from "@/components/events/CategoryBadge";
import { MaturityBadge } from "@/components/events/MaturityBadge";
import { RecurrenceBadge } from "@/components/events/RecurrenceBadge";
import { RSVPButton } from "@/components/events/RSVPButton";
import { TicketInfo } from "@/components/events/TicketInfo";
import { AttendeePreview } from "@/components/events/AttendeePreview";
import { ShareButton } from "@/components/events/ShareButton";
import { OrganizerCard } from "@/components/events/OrganizerCard";
import { EventStrip } from "@/components/events/EventStrip";
import { useCalendarExport } from "@/hooks/useCalendarExport";
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Calendar,
  Star,
  Users,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface EventDetailClientProps {
  event: CalendarEvent;
  venue?: Venue;
  organizer?: OrganizerProfile;
  moreByOrganizer: CalendarEvent[];
  seriesEvents: CalendarEvent[];
  similarEvents: CalendarEvent[];
}

export function EventDetailClient({
  event,
  venue,
  organizer,
  moreByOrganizer,
  seriesEvents,
  similarEvents,
}: EventDetailClientProps) {
  const router = useRouter();
  const [navQuery, setNavQuery] = useState("");
  const { downloadICS, googleCalendarUrl } = useCalendarExport();
  const catMeta = CATEGORY_META[event.category];
  const isLive = event.status === "in_progress";
  const isCancelled = event.status === "cancelled";

  function handleSearch(q: string) {
    if (q) {
      router.push(`/?q=${encodeURIComponent(q)}`);
    } else {
      setNavQuery("");
    }
  }

  return (
    <div className="min-h-screen">
      <EventsNav query={navQuery} onQueryChange={handleSearch} />
      {/* Hero */}
      <div className="relative min-h-[300px] sm:min-h-[360px]">
        {event.coverImage && (
          <img
            src={event.coverImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${catMeta.color}25 0%, transparent 50%), linear-gradient(to bottom, var(--color-bg-deep)/20 0%, var(--color-bg-deep) 80%)`,
          }}
        />
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 pt-6 pb-8 flex flex-col justify-end min-h-[300px] sm:min-h-[360px]">
          {/* Back */}
          <Link
            href="/"
            className="self-start flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <CategoryBadge category={event.category} />
            {event.maturity !== "G" && <MaturityBadge rating={event.maturity} />}
            {event.recurrence && <RecurrenceBadge recurrence={event.recurrence} />}
            {isLive && (
              <Badge className="bg-red-600/90 text-white gap-1">
                <Radio className="h-3 w-3 animate-pulse" />
                Live Now
              </Badge>
            )}
            {isCancelled && (
              <Badge variant="destructive">Cancelled</Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">{event.title}</h1>
          <p className="text-text-secondary text-sm mb-1">by {event.organizerName}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Left column */}
          <div className="space-y-6">
            {/* Description */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">About this event</h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </section>

            {/* Tags */}
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[11px] bg-surface-0 text-text-muted">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Attendees */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">Attendees</h2>
              <AttendeePreview
                attendeeCount={event.attendeeCount}
                interestedCount={event.interestedCount}
              />
            </section>

            {/* Dress code */}
            {event.dressCode !== "none" && (
              <section>
                <h2 className="text-sm font-semibold text-text-primary mb-1">Dress Code</h2>
                <p className="text-sm text-text-secondary capitalize">{event.dressCode}</p>
                {event.dressCodeDetails && (
                  <p className="text-xs text-text-muted mt-1">{event.dressCodeDetails}</p>
                )}
              </section>
            )}

            <Separator />

            {/* Organizer */}
            {organizer && (
              <section>
                <h2 className="text-lg font-semibold text-text-primary mb-3">Organizer</h2>
                <OrganizerCard organizer={organizer} />
              </section>
            )}
          </div>

          {/* Right column — sidebar */}
          <div className="space-y-4">
            {/* Date/Time card */}
            <div className="rounded-lg border border-border/30 bg-surface-0 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <DateBadge date={event.startTime} />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(event.startTime).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <TimeBadge startTime={event.startTime} durationMinutes={event.durationMinutes} />
                </div>
              </div>

              {/* Calendar export */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs border-border/40"
                  onClick={() => downloadICS(event)}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Add to Calendar
                </Button>
                <a
                  href={googleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-text-muted hover:text-accent transition-colors"
                >
                  Google Calendar
                </a>
              </div>
            </div>

            {/* Venue card */}
            {venue && (
              <Link
                href={`/venue/${venue.id}`}
                className="block rounded-lg border border-border/30 bg-surface-0 p-4 hover:border-border/60 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-sm font-semibold text-text-primary">{venue.name}</span>
                </div>
                <p className="text-xs text-text-muted mb-1">{venue.location.regionName}</p>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    {venue.rating}
                  </span>
                  {venue.capacity && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {venue.capacity} capacity
                    </span>
                  )}
                </div>
              </Link>
            )}

            {/* Location / teleport */}
            {event.location.teleportUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-accent border-accent/30 hover:bg-accent/10"
                onClick={() => {
                  window.open(event.location.teleportUrl, "_blank");
                }}
              >
                <MapPin className="h-4 w-4" />
                Teleport to Location
              </Button>
            )}

            {/* External URL */}
            {event.externalUrl && (
              <a
                href={event.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border/30 bg-surface-0 p-3 text-sm text-text-secondary hover:border-border/60 hover:text-accent transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                External Link
              </a>
            )}

            {/* Tickets */}
            <div className="rounded-lg border border-border/30 bg-surface-0 p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Tickets</h3>
              <TicketInfo entryFee={event.entryFee} tickets={event.tickets} />
              {event.tickets.length > 0 && (
                <div className="mt-3 space-y-2">
                  {event.tickets.map((tier) => (
                    <div key={tier.id} className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">{tier.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary font-medium">
                          {tier.price === 0 ? "Free" : `${tier.price} ${tier.currency}`}
                        </span>
                        <span className="text-text-muted">
                          {tier.available === 0 ? "Sold out" : `${tier.available} left`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Occupancy (live only) */}
            {isLive && event.occupancy && (
              <div className="rounded-lg border border-border/30 bg-surface-0 p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-2">Live Status</h3>
                <div className="flex items-center gap-2">
                  <span
                    className="text-lg"
                    style={{ color: OCCUPANCY_META[event.occupancy].color }}
                  >
                    {OCCUPANCY_META[event.occupancy].symbol}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: OCCUPANCY_META[event.occupancy].color }}
                  >
                    {OCCUPANCY_META[event.occupancy].label}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({event.currentVisitors} visitors)
                  </span>
                </div>
              </div>
            )}

            {/* RSVP */}
            <RSVPButton eventId={event.id} />

            {/* Share */}
            <ShareButton eventId={event.id} title={event.title} />
          </div>
        </div>

        {/* Related strips */}
        <div className="mt-12 space-y-8">
          {seriesEvents.length > 0 && (
            <EventStrip title="Upcoming in This Series" events={seriesEvents} />
          )}
          {moreByOrganizer.length > 0 && (
            <EventStrip title={`More from ${event.organizerName}`} events={moreByOrganizer} />
          )}
          {similarEvents.length > 0 && (
            <EventStrip title="Similar Events" events={similarEvents} />
          )}
        </div>
      </div>
    </div>
  );
}
