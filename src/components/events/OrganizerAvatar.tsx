"use client";

import { cn } from "@/lib/utils";

function colorFromName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return `hsl(${Math.abs(h) % 360}, 55%, 45%)`;
}

function initials(name: string): string {
  const words = name.replace(/([A-Z])/g, " $1").trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const SIZES = {
  sm: { px: 20, text: "text-[9px]" },
  md: { px: 32, text: "text-xs" },
  lg: { px: 48, text: "text-base" },
} as const;

interface OrganizerAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function OrganizerAvatar({ name, avatar, size = "sm", className }: OrganizerAvatarProps) {
  const { px, text } = SIZES[size];

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={cn("rounded-full object-cover border border-border/30", className)}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold shrink-0",
        text,
        className,
      )}
      style={{
        width: px,
        height: px,
        backgroundColor: colorFromName(name),
        color: "#fff",
      }}
    >
      {initials(name)}
    </span>
  );
}
