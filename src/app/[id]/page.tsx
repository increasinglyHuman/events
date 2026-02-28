import { FAKE_EVENTS, getEvent, getEventsByOrganizer, getEventsBySeries } from "@/data/fake-events";
import { getVenue } from "@/data/fake-venues";
import { getOrganizer } from "@/data/fake-organizers";
import { EventDetailClient } from "./EventDetailClient";

export function generateStaticParams() {
  return FAKE_EVENTS.map((e) => ({ id: e.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-muted">Event not found.</p>
      </div>
    );
  }

  const venue = event.venueId ? getVenue(event.venueId) : undefined;
  const organizer = getOrganizer(event.organizerId);
  const moreByOrganizer = getEventsByOrganizer(event.organizerId)
    .filter((e) => e.id !== event.id && e.status === "published")
    .slice(0, 10);
  const seriesEvents = event.seriesId
    ? getEventsBySeries(event.seriesId).filter((e) => e.id !== event.id)
    : [];
  const similarEvents = FAKE_EVENTS.filter(
    (e) => e.category === event.category && e.id !== event.id && e.status === "published",
  ).slice(0, 10);

  return (
    <EventDetailClient
      event={event}
      venue={venue}
      organizer={organizer}
      moreByOrganizer={moreByOrganizer}
      seriesEvents={seriesEvents}
      similarEvents={similarEvents}
    />
  );
}
