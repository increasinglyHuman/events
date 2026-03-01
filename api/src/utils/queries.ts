/** Map a database event row to the frontend CalendarEvent shape (camelCase) */
export function mapEventRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    summary: row.short_description || "",
    category: row.category,
    startTime: row.starts_at,
    endTime: row.ends_at,
    timezone: row.timezone || "UTC",
    durationMinutes: row.duration_minutes,
    recurrence: row.recurrence_rule || null,
    seriesId: row.series_id || null,
    location: {
      regionName: row.region_name || row.location_name || "",
      coordinates: (row.location_coords as Record<string, number>) || { x: 128, y: 128, z: 25 },
      teleportUrl: row.teleport_url || "",
    },
    externalUrl: row.external_url || null,
    coverImage: row.cover_image_url || "",
    gallery: (row.gallery_urls as string[]) || [],
    organizerId: row.creator_id,
    organizerName: row.host_display_name || "",
    organizerAvatar: row.host_avatar_url || "",
    coHosts: (row.co_host_ids as string[])?.map((id) => ({ id, name: "", avatar: "" })) || [],
    capacity: row.max_attendees,
    attendeeCount: row.rsvp_count || 0,
    interestedCount: row.interested_count || 0,
    tickets: (row.tickets as unknown[]) || [],
    tags: (row.tags as string[]) || [],
    status: mapStatus(row.status as string),
    featured: row.featured || false,
    maturity: mapMaturity(row.maturity_rating as string),
    dressCode: row.dress_code || "none",
    dressCodeDetails: row.dress_code_details || "",
    entryFee: row.entry_fee || 0,
    viewCount: row.view_count || 0,
    bookmarkCount: row.bookmark_count || 0,
    trafficScore: row.traffic_score || 0,
    occupancy: row.occupancy || "empty",
    currentVisitors: row.current_visitors || 0,
    hostReputationScore: row.host_reputation_score || 0,
    hostEventsCompleted: row.host_events_completed || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Venue ID for joins
    venueId: row.venue_id || null,
  };
}

/** Map DB status to frontend status (in_progress stays as-is) */
function mapStatus(status: string): string {
  return status || "draft";
}

/** Map DB maturity (G/PG/R/X) to frontend maturity (G/M/A) */
function mapMaturity(rating: string): string {
  switch (rating) {
    case "G": return "G";
    case "PG": return "G";
    case "R": return "M";
    case "X": return "A";
    default: return "G";
  }
}

/** Map a database venue row to the frontend Venue shape */
export function mapVenueRow(row: Record<string, unknown>) {
  const loc = (row.location as Record<string, unknown>) || {};
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    coverImage: row.cover_image_url || "",
    gallery: (row.gallery_urls as string[]) || [],
    location: {
      regionName: (loc.regionName as string) || "",
      coordinates: (loc.coordinates as Record<string, number>) || { x: 128, y: 128, z: 25 },
      teleportUrl: (loc.teleportUrl as string) || "",
    },
    capacity: row.capacity,
    ownerId: row.owner_id,
    ownerName: "", // Join from users if needed
    rating: row.rating || 0,
    reviewCount: row.review_count || 0,
    tags: (row.tags as string[]) || [],
    category: row.category || "other",
    featured: row.featured || false,
    amenities: (row.amenities as string[]) || [],
    upcomingEventCount: row.upcoming_event_count || 0,
    pastEventCount: row.past_event_count || 0,
  };
}
