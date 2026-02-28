"use client";

import { cn } from "@/lib/utils";
import type { MaturityRating } from "@/types/events";

const MATURITY_STYLES: Record<MaturityRating, { bg: string; text: string; label: string }> = {
  G: { bg: "bg-[#4ecdc4]/20", text: "text-[#4ecdc4]", label: "G" },
  M: { bg: "bg-[#ffe66d]/20", text: "text-[#ffe66d]", label: "M" },
  A: { bg: "bg-[#ff6b6b]/20", text: "text-[#ff6b6b]", label: "A" },
};

interface MaturityBadgeProps {
  rating: MaturityRating;
  className?: string;
}

export function MaturityBadge({ rating, className }: MaturityBadgeProps) {
  const style = MATURITY_STYLES[rating];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold leading-none",
        style.bg,
        style.text,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
