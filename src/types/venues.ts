import type { VirtualLocation } from "./events";

export const VENUE_CATEGORIES = [
  "club", "gallery", "arena", "theater", "classroom",
  "park", "beach", "skybox", "plaza", "other",
] as const;

export type VenueCategory = (typeof VENUE_CATEGORIES)[number];

export interface Venue {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  gallery: string[];

  location: VirtualLocation;
  capacity: number | null;

  ownerId: string;
  ownerName: string;

  rating: number;
  reviewCount: number;

  tags: string[];
  category: VenueCategory;
  featured: boolean;

  amenities: string[];

  upcomingEventCount: number;
  pastEventCount: number;
}
