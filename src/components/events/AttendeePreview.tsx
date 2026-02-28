"use client";

import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface AttendeePreviewProps {
  attendeeCount: number;
  interestedCount: number;
  className?: string;
}

export function AttendeePreview({ attendeeCount, interestedCount, className }: AttendeePreviewProps) {
  return (
    <div className={cn("flex items-center gap-3 text-xs text-text-secondary", className)}>
      <div className="flex items-center gap-1">
        <Users className="h-3.5 w-3.5" />
        <span>
          <span className="font-medium text-text-primary">{attendeeCount}</span> going
        </span>
      </div>
      {interestedCount > 0 && (
        <span className="text-text-muted">
          {interestedCount} interested
        </span>
      )}
    </div>
  );
}
