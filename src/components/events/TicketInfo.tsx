"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";
import type { TicketTier } from "@/types/events";

interface TicketInfoProps {
  entryFee: number;
  tickets: TicketTier[];
  className?: string;
}

export function TicketInfo({ entryFee, tickets, className }: TicketInfoProps) {
  if (entryFee === 0 && tickets.length === 0) {
    return (
      <Badge variant="secondary" className={cn("bg-accent/10 text-accent border-accent/20", className)}>
        Free
      </Badge>
    );
  }

  const cheapest = tickets.length > 0
    ? Math.min(...tickets.map((t) => t.price))
    : entryFee;

  const allSoldOut = tickets.length > 0 && tickets.every((t) => t.available === 0);
  const limitedAvailable = tickets.some((t) => t.available > 0 && t.available <= 5);

  if (allSoldOut) {
    return (
      <Badge variant="destructive" className={cn("", className)}>
        Sold Out
      </Badge>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Ticket className="h-3.5 w-3.5 text-text-muted" />
      <span className="text-sm font-medium text-text-primary">
        {cheapest === 0 ? "Free" : `${cheapest} PKN`}
        {tickets.length > 1 && cheapest > 0 && "+"}
      </span>
      {limitedAvailable && (
        <span className="text-[10px] text-amber-400 font-medium">Limited</span>
      )}
    </div>
  );
}
