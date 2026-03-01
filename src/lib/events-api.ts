/**
 * API client for poqpoq Events.
 * Attempts real API calls first, falls back to fake data if API is unreachable.
 */

import { FAKE_EVENTS, getEvent, getUpcomingEvents, getHappeningNow, getFeaturedEvents, getEventsByOrganizer, getEventsByVenue, getEventsBySeries } from "@/data/fake-events";
import { FAKE_VENUES, getVenue } from "@/data/fake-venues";
import { FAKE_ORGANIZERS, getOrganizer } from "@/data/fake-organizers";
import type { CalendarEvent } from "@/types/events";
import type { Venue } from "@/types/venues";
import type { OrganizerProfile, RSVPStatus } from "@/types/social";

/* ─── Config ──────────────────────────────────────────────── */

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3015"
    : "https://poqpoq.com/events-api";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

/* ─── Fetch wrapper with auth + fallback ──────────────────── */

async function apiFetch<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> ?? {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });

    if (!res.ok) {
      console.warn(`[events-api] ${res.status} from ${path}`);
      return fallback;
    }

    return await res.json();
  } catch {
    // API unreachable — use fake data
    return fallback;
  }
}

/* ─── Public API ──────────────────────────────────────────── */

export const eventsApi = {
  events: {
    list: async (params?: {
      category?: string;
      maturity?: string;
      search?: string;
      sort?: string;
      order?: string;
      limit?: number;
      offset?: number;
    }): Promise<CalendarEvent[]> => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set("category", params.category);
      if (params?.maturity) qs.set("maturity", params.maturity);
      if (params?.search) qs.set("search", params.search);
      if (params?.sort) qs.set("sort", params.sort);
      if (params?.order) qs.set("order", params.order);
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.offset) qs.set("offset", String(params.offset));
      const query = qs.toString();
      return apiFetch(`/api/events${query ? `?${query}` : ""}`, FAKE_EVENTS);
    },

    get: async (id: string): Promise<CalendarEvent | undefined> => {
      return apiFetch(`/api/events/${id}`, getEvent(id));
    },

    upcoming: async (): Promise<CalendarEvent[]> => {
      return apiFetch("/api/events/upcoming", getUpcomingEvents());
    },

    happeningNow: async (): Promise<CalendarEvent[]> => {
      return apiFetch("/api/events/happening-now", getHappeningNow());
    },

    featured: async (): Promise<CalendarEvent[]> => {
      return apiFetch("/api/events/featured", getFeaturedEvents());
    },

    byOrganizer: async (id: string): Promise<CalendarEvent[]> => {
      return apiFetch(`/api/events/by-organizer/${id}`, getEventsByOrganizer(id));
    },

    byVenue: async (id: string): Promise<CalendarEvent[]> => {
      return apiFetch(`/api/events/by-venue/${id}`, getEventsByVenue(id));
    },

    bySeries: async (id: string): Promise<CalendarEvent[]> => {
      return apiFetch(`/api/events/by-series/${id}`, getEventsBySeries(id));
    },

    create: async (data: Record<string, unknown>): Promise<CalendarEvent | null> => {
      return apiFetch("/api/events", null, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Record<string, unknown>): Promise<CalendarEvent | null> => {
      return apiFetch(`/api/events/${id}`, null, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    cancel: async (id: string): Promise<boolean> => {
      const result = await apiFetch<{ success?: boolean }>(`/api/events/${id}`, {}, {
        method: "DELETE",
      });
      return result?.success ?? false;
    },
  },

  venues: {
    list: async (): Promise<Venue[]> => {
      return apiFetch("/api/venues", FAKE_VENUES);
    },

    get: async (id: string): Promise<Venue | undefined> => {
      return apiFetch(`/api/venues/${id}`, getVenue(id));
    },

    create: async (data: Partial<Venue>): Promise<Venue | null> => {
      return apiFetch("/api/venues", null, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  organizers: {
    list: async (): Promise<OrganizerProfile[]> => {
      return apiFetch("/api/organizers", FAKE_ORGANIZERS);
    },

    get: async (id: string): Promise<OrganizerProfile | undefined> => {
      return apiFetch(`/api/organizers/${id}`, getOrganizer(id));
    },
  },

  rsvps: {
    set: async (eventId: string, status: RSVPStatus): Promise<boolean> => {
      const result = await apiFetch<{ success?: boolean }>(`/api/events/${eventId}/rsvp`, {}, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      return result?.success ?? false;
    },

    remove: async (eventId: string): Promise<boolean> => {
      const result = await apiFetch<{ success?: boolean }>(`/api/events/${eventId}/rsvp`, {}, {
        method: "DELETE",
      });
      return result?.success ?? false;
    },

    attendees: async (eventId: string): Promise<{ userId: string; userName: string; avatar: string; rsvpStatus: string }[]> => {
      return apiFetch(`/api/events/${eventId}/attendees`, []);
    },
  },

  ratings: {
    submit: async (eventId: string, data: {
      rating: number;
      reviewText?: string;
      ratingAtmosphere?: number;
      ratingHost?: number;
      ratingContent?: number;
    }): Promise<boolean> => {
      const result = await apiFetch<{ success?: boolean }>(`/api/events/${eventId}/rate`, {}, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result?.success ?? false;
    },

    list: async (eventId: string): Promise<unknown[]> => {
      return apiFetch(`/api/events/${eventId}/ratings`, []);
    },
  },
};
