import { FAKE_VENUES, getVenue } from "@/data/fake-venues";
import { getEventsByVenue } from "@/data/fake-events";
import { VenueDetailClient } from "./VenueDetailClient";

export function generateStaticParams() {
  return FAKE_VENUES.map((v) => ({ id: v.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VenueDetailPage({ params }: Props) {
  const { id } = await params;
  const venue = getVenue(id);
  if (!venue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-muted">Venue not found.</p>
      </div>
    );
  }

  const events = getEventsByVenue(id);
  const upcoming = events.filter(
    (e) => e.status === "published" || e.status === "in_progress",
  );
  const past = events.filter(
    (e) => e.status === "completed",
  );

  return <VenueDetailClient venue={venue} upcoming={upcoming} past={past} />;
}
