"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRSVP } from "@/hooks/useRSVP";
import { Button } from "@/components/ui/button";
import { Check, Star, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RSVPStatus } from "@/types/social";

interface RSVPButtonProps {
  eventId: string;
  className?: string;
}

const RSVP_OPTIONS: { status: RSVPStatus; label: string; icon: typeof Check; activeClass: string }[] = [
  { status: "going", label: "Going", icon: Check, activeClass: "border-[var(--color-rsvp-going)] text-[var(--color-rsvp-going)] bg-[var(--color-rsvp-going)]/10" },
  { status: "interested", label: "Interested", icon: Star, activeClass: "border-[var(--color-rsvp-interested)] text-[var(--color-rsvp-interested)] bg-[var(--color-rsvp-interested)]/10" },
  { status: "maybe", label: "Maybe", icon: HelpCircle, activeClass: "border-[var(--color-rsvp-maybe)] text-[var(--color-rsvp-maybe)] bg-[var(--color-rsvp-maybe)]/10" },
];

export function RSVPButton({ eventId, className }: RSVPButtonProps) {
  const { isAuthenticated } = useAuth();
  const { getRSVP, toggleRSVP } = useRSVP();
  const current = getRSVP(eventId);

  if (!isAuthenticated) {
    return (
      <p className={cn("text-xs text-text-muted italic", className)}>
        Sign in to RSVP
      </p>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {RSVP_OPTIONS.map(({ status, label, icon: Icon, activeClass }) => {
        const active = current === status;
        return (
          <Button
            key={status}
            variant="outline"
            size="sm"
            onClick={() => toggleRSVP(eventId, status)}
            className={cn(
              "gap-1.5 text-xs h-8 border-border/40",
              active && activeClass,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
