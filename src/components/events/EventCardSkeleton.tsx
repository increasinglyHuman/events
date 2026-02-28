"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EventCardSkeletonProps {
  variant?: "featured" | "compact";
  className?: string;
}

export function EventCardSkeleton({ variant = "compact", className }: EventCardSkeletonProps) {
  const isFeatured = variant === "featured";

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg overflow-hidden border border-border/20 bg-surface-0",
        isFeatured ? "w-[280px] min-w-[280px]" : "w-[200px] min-w-[200px]",
        className,
      )}
    >
      <Skeleton className={cn(isFeatured ? "aspect-[16/9]" : "aspect-[4/3]")} />
      <div className="p-2.5 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
}

export function EventStripSkeleton({
  count = 6,
  variant = "compact",
}: {
  count?: number;
  variant?: "featured" | "compact";
}) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <EventCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    </div>
  );
}
