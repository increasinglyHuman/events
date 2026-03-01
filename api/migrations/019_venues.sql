-- ============================================================
-- Migration 019: Venues System
-- Date: 2026-02-28
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ownership
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Core Details
    name VARCHAR(120) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL DEFAULT 'other' CHECK (category IN (
        'club', 'gallery', 'arena', 'theater', 'classroom',
        'park', 'beach', 'skybox', 'plaza', 'other'
    )),

    -- Location
    location JSONB NOT NULL DEFAULT '{}',
    -- { regionName, coordinates: {x, y, z}, teleportUrl }

    -- Instance link (optional — venue may map to an instance)
    instance_id UUID REFERENCES instances(id) ON DELETE SET NULL,

    -- Capacity
    capacity INTEGER,

    -- Media
    cover_image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',

    -- Tags & Amenities
    tags TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    -- e.g. ['voice', 'stream', 'adult-friendly', 'parking']

    -- Ratings (denormalized)
    rating FLOAT DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,

    -- Counts (denormalized)
    upcoming_event_count INTEGER DEFAULT 0,
    past_event_count INTEGER DEFAULT 0,

    -- Flags
    featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_owner ON venues (owner_id);
CREATE INDEX IF NOT EXISTS idx_venues_category ON venues (category) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_venues_featured ON venues (created_at DESC) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_venues_rating ON venues (rating DESC) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_venues_search ON venues USING GIN (
    to_tsvector('english', COALESCE(name,'') || ' ' || COALESCE(description,''))
);
CREATE INDEX IF NOT EXISTS idx_venues_tags ON venues USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_venues_amenities ON venues USING GIN (amenities);

-- Add venue_id foreign key to events table
ALTER TABLE events
    ADD CONSTRAINT fk_events_venue
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL;

-- Venue ratings
CREATE TABLE IF NOT EXISTS venue_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,

    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(venue_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_venue_ratings_venue ON venue_ratings (venue_id, rating DESC);

-- Trigger to update venue rating averages
CREATE OR REPLACE FUNCTION update_venue_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE venues SET
        rating = COALESCE((
            SELECT AVG(rating)::FLOAT FROM venue_ratings
            WHERE venue_id = COALESCE(NEW.venue_id, OLD.venue_id) AND is_visible = TRUE
        ), 0),
        review_count = (
            SELECT COUNT(*) FROM venue_ratings
            WHERE venue_id = COALESCE(NEW.venue_id, OLD.venue_id) AND is_visible = TRUE
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.venue_id, OLD.venue_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_venue_rating_update ON venue_ratings;
CREATE TRIGGER trg_venue_rating_update
    AFTER INSERT OR UPDATE OR DELETE ON venue_ratings
    FOR EACH ROW EXECUTE FUNCTION update_venue_rating();

-- Auto-update updated_at
DROP TRIGGER IF EXISTS trg_venues_updated_at ON venues;
CREATE TRIGGER trg_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_events_updated_at();

COMMIT;
