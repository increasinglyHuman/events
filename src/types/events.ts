/**
 * Event data types for poqpoq Events.
 *
 * 13 primary categories (mutually exclusive).
 * Maturity: G / M / A (matching Marketplace).
 * Locations: virtual (region + coords + teleport) + optional external URL.
 */

export const EVENT_CATEGORIES = [
  "social",
  "music",
  "art",
  "education",
  "roleplay",
  "quest",
  "ceremony",
  "commerce",
  "exploration",
  "performance",
  "community",
  "competition",
  "special",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; icon: string; color: string }
> = {
  social: { label: "Social & Hangouts", icon: "Users", color: "#00ff88" },
  music: { label: "Music & DJs", icon: "Music", color: "#a78bfa" },
  art: { label: "Art & Exhibitions", icon: "Palette", color: "#f472b6" },
  education: { label: "Education & Talks", icon: "BookOpen", color: "#38bdf8" },
  roleplay: { label: "Roleplay & Story", icon: "Theater", color: "#c084fc" },
  quest: { label: "Quests & Games", icon: "Swords", color: "#fb923c" },
  ceremony: { label: "Ceremonies & Rituals", icon: "Flame", color: "#f59e0b" },
  commerce: { label: "Commerce & Markets", icon: "Store", color: "#fbbf24" },
  exploration: { label: "Exploration & Tours", icon: "Compass", color: "#2dd4bf" },
  performance: { label: "Theater & Performance", icon: "Clapperboard", color: "#f87171" },
  community: { label: "Community & Governance", icon: "Landmark", color: "#4ecdc4" },
  competition: { label: "Contests & Competitions", icon: "Trophy", color: "#fbbf24" },
  special: { label: "Special & Seasonal", icon: "Sparkles", color: "#e879f9" },
};

export type MaturityRating = "G" | "M" | "A";

export type EventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "completed"
  | "in_progress";

export type PopularityTier =
  | "hidden-gem"
  | "rising"
  | "popular"
  | "trending"
  | "legendary";

export type OccupancyStatus =
  | "empty"
  | "quiet"
  | "gathering"
  | "lively"
  | "packed"
  | "full";

export const OCCUPANCY_META: Record<
  OccupancyStatus,
  { label: string; color: string; symbol: string }
> = {
  empty: { label: "Empty", color: "#6B7280", symbol: "○" },
  quiet: { label: "Quiet", color: "#64748B", symbol: "◔" },
  gathering: { label: "Gathering", color: "#14B8A6", symbol: "◑" },
  lively: { label: "Lively", color: "#22C55E", symbol: "◕" },
  packed: { label: "Packed!", color: "#F59E0B", symbol: "●" },
  full: { label: "Full", color: "#EF4444", symbol: "🚫" },
};

export const DRESS_CODES = [
  "none", "casual", "formal", "themed", "roleplay", "fantasy",
  "modern", "historical", "uniform", "creative", "minimal", "furry", "human",
] as const;

export type DressCode = (typeof DRESS_CODES)[number];

export interface VirtualLocation {
  regionName: string;
  coordinates?: { x: number; y: number; z: number };
  teleportUrl?: string;
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  interval: number;
  daysOfWeek?: number[];
  endsAt?: string;
  seriesId: string;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  available: number;
  total: number;
}

export interface EventCoHost {
  id: string;
  name: string;
  avatar?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;

  category: EventCategory;
  tags: string[];

  startTime: string;
  endTime: string;
  timezone: string;
  durationMinutes: number;

  recurrence: RecurrenceRule | null;
  seriesId: string | null;

  location: VirtualLocation;
  externalUrl: string | null;

  coverImage: string;
  gallery: string[];

  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  coHosts: EventCoHost[];

  capacity: number | null;
  attendeeCount: number;
  interestedCount: number;

  tickets: TicketTier[];
  entryFee: number;

  maturity: MaturityRating;
  dressCode: DressCode;
  dressCodeDetails?: string;

  status: EventStatus;
  featured: boolean;
  popularityTier: PopularityTier;
  trafficScore: number;

  occupancy: OccupancyStatus | null;
  currentVisitors: number;

  viewCount: number;
  bookmarkCount: number;

  hostReputationScore: number;
  hostEventsCompleted: number;

  createdAt: string;
  updatedAt: string;

  venueId?: string;
}
