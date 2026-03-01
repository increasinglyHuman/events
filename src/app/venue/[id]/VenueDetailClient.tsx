"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Venue } from "@/types/venues";
import { EventsNav } from "@/components/events/EventsNav";
import type { CalendarEvent } from "@/types/events";
import { EventStrip } from "@/components/events/EventStrip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Star, Users, ExternalLink } from "lucide-react";

interface VenueDetailClientProps {
  venue: Venue;
  upcoming: CalendarEvent[];
  past: CalendarEvent[];
}

export function VenueDetailClient({ venue, upcoming, past }: VenueDetailClientProps) {
  const router = useRouter();
  const [navQuery, setNavQuery] = useState("");

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
      <div className="relative min-h-[240px]">
        {venue.coverImage && (
          <img
            src={venue.coverImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/8 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/30 via-bg-deep/60 to-bg-deep" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 pt-6 pb-8 flex flex-col justify-end min-h-[240px]">
          <Link
            href="/"
            className="self-start flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-accent" />
            <Badge variant="secondary" className="text-[11px] capitalize">{venue.category}</Badge>
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-1">{venue.name}</h1>
          <p className="text-sm text-text-muted">{venue.location.regionName}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Left */}
          <div className="space-y-6">
            <p className="text-sm text-text-secondary leading-relaxed">
              {venue.description}
            </p>

            {/* Amenities */}
            {venue.amenities.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-text-primary mb-2">Amenities</h2>
                <div className="flex flex-wrap gap-1.5">
                  {venue.amenities.map((a) => (
                    <Badge key={a} variant="secondary" className="text-[11px] capitalize bg-surface-0">
                      {a.replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {venue.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {venue.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[11px] bg-surface-0 text-text-muted">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Upcoming events */}
            {upcoming.length > 0 && (
              <EventStrip title="Upcoming Events" events={upcoming} />
            )}

            {/* Past events */}
            {past.length > 0 && (
              <details className="mt-4">
                <summary className="text-sm font-semibold text-text-secondary cursor-pointer hover:text-text-primary">
                  Past Events ({past.length})
                </summary>
                <div className="mt-3">
                  <EventStrip title="" events={past} />
                </div>
              </details>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="rounded-lg border border-border/30 bg-surface-0 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-lg font-bold text-text-primary">{venue.rating}</span>
                <span className="text-xs text-text-muted">({venue.reviewCount} reviews)</span>
              </div>
              {venue.capacity && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Users className="h-4 w-4" />
                  Capacity: {venue.capacity}
                </div>
              )}
              <div className="text-xs text-text-muted">
                Owner: {venue.ownerName}
              </div>
            </div>

            {/* Teleport */}
            {venue.location.teleportUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-accent border-accent/30 hover:bg-accent/10"
                onClick={() => {
                  window.open(venue.location.teleportUrl, "_blank");
                }}
              >
                <MapPin className="h-4 w-4" />
                Teleport to Venue
              </Button>
            )}

            {/* Event counts */}
            <div className="rounded-lg border border-border/30 bg-surface-0 p-4 text-xs text-text-secondary space-y-2">
              <div className="flex justify-between">
                <span>Upcoming Events</span>
                <span className="font-medium text-text-primary">{venue.upcomingEventCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Past Events</span>
                <span className="font-medium text-text-primary">{venue.pastEventCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
