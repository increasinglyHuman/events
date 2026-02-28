/**
 * API client stub. Returns fake data now — swap for real fetch calls later.
 */

import { FAKE_EVENTS, getEvent, getUpcomingEvents, getHappeningNow, getFeaturedEvents, getEventsByOrganizer, getEventsByVenue, getEventsBySeries } from "@/data/fake-events";
import { FAKE_VENUES, getVenue } from "@/data/fake-venues";
import { FAKE_ORGANIZERS, getOrganizer } from "@/data/fake-organizers";
import type { CalendarEvent } from "@/types/events";
import type { Venue } from "@/types/venues";
import type { OrganizerProfile } from "@/types/social";

export const eventsApi = {
  events: {
    list: async (): Promise<CalendarEvent[]> => FAKE_EVENTS,
    get: async (id: string): Promise<CalendarEvent | undefined> => getEvent(id),
    upcoming: async (): Promise<CalendarEvent[]> => getUpcomingEvents(),
    happeningNow: async (): Promise<CalendarEvent[]> => getHappeningNow(),
    featured: async (): Promise<CalendarEvent[]> => getFeaturedEvents(),
    byOrganizer: async (id: string): Promise<CalendarEvent[]> => getEventsByOrganizer(id),
    byVenue: async (id: string): Promise<CalendarEvent[]> => getEventsByVenue(id),
    bySeries: async (id: string): Promise<CalendarEvent[]> => getEventsBySeries(id),
  },
  venues: {
    list: async (): Promise<Venue[]> => FAKE_VENUES,
    get: async (id: string): Promise<Venue | undefined> => getVenue(id),
  },
  organizers: {
    list: async (): Promise<OrganizerProfile[]> => FAKE_ORGANIZERS,
    get: async (id: string): Promise<OrganizerProfile | undefined> => getOrganizer(id),
  },
};
