"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { MapPin, Star, Users } from "lucide-react";
import type { Venue } from "@/types/venues";

interface VenueCardProps {
  venue: Venue;
  className?: string;
}

export function VenueCard({ venue, className }: VenueCardProps) {
  return (
    <Link
      href={`/venue/${venue.id}`}
      className={cn(
        "group/venue flex flex-col rounded-lg overflow-hidden border border-border/30 bg-surface-0 w-[200px] min-w-[200px]",
        "hover:border-border/60 hover:bg-surface-1/50 transition-all duration-200",
        className,
      )}
    >
      <div className="aspect-[16/10] relative bg-gradient-to-br from-accent/10 to-transparent">
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="h-8 w-8 text-accent/30" />
        </div>
      </div>
      <div className="p-2.5 flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover/venue:text-accent transition-colors">
          {venue.name}
        </h3>
        <p className="text-[11px] text-text-muted line-clamp-1">{venue.location.regionName}</p>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="h-3 w-3 fill-current" />
            <span>{venue.rating}</span>
          </div>
          {venue.capacity && (
            <div className="flex items-center gap-1 text-text-muted">
              <Users className="h-3 w-3" />
              <span>{venue.capacity}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
