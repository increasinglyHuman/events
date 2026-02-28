"use client";

import { cn } from "@/lib/utils";
import { Star, Calendar } from "lucide-react";
import type { OrganizerProfile } from "@/types/social";

interface OrganizerCardProps {
  organizer: OrganizerProfile;
  className?: string;
}

export function OrganizerCard({ organizer, className }: OrganizerCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border/30 bg-surface-0 p-3",
        className,
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-sm">
        {organizer.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-text-primary truncate">{organizer.name}</h4>
        <p className="text-[11px] text-text-muted line-clamp-1">{organizer.bio}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {organizer.eventCount} events
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            {organizer.rating}
          </span>
        </div>
      </div>
    </div>
  );
}
