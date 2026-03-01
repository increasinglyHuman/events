-- ============================================================
-- Migration 018: Events Calendar System
-- Schema Version: 1.4.0
-- Date: 2026-02-28
-- Source: POQPOQ_EVENTS_CALENDAR_ARCHITECTURE.md
-- ============================================================

BEGIN;

-- --------------------------------------------------------
-- TABLE: events
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ownership
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    co_host_ids UUID[] DEFAULT '{}',

    -- Core Details
    title VARCHAR(120) NOT NULL,
    subtitle VARCHAR(200),
    description TEXT NOT NULL,
    short_description VARCHAR(300),

    -- Classification
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'social', 'music', 'art', 'education', 'roleplay',
        'quest', 'ceremony', 'commerce', 'exploration',
        'performance', 'community', 'competition', 'special'
    )),
    tags TEXT[] DEFAULT '{}',

    -- Dress Code
    dress_code VARCHAR(20) DEFAULT 'none' CHECK (dress_code IN (
        'none', 'casual', 'formal', 'themed', 'roleplay',
        'fantasy', 'modern', 'historical', 'uniform',
        'creative', 'minimal', 'furry', 'human'
    )),
    dress_code_details VARCHAR(500),
    dress_code_strict BOOLEAN DEFAULT FALSE,

    -- Maturity
    maturity_rating VARCHAR(2) NOT NULL DEFAULT 'G'
        CHECK (maturity_rating IN ('G', 'PG', 'R', 'X')),
    adult_only BOOLEAN DEFAULT FALSE,

    -- Location (instance-anchored)
    instance_id UUID REFERENCES instances(id) ON DELETE SET NULL,
    location_name VARCHAR(100),
    location_coords JSONB,
    region_name VARCHAR(100),
    teleport_url TEXT,
    external_url TEXT,

    -- Timing
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    duration_minutes INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (ends_at - starts_at)) / 60
    ) STORED,

    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule JSONB,
    parent_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    series_id VARCHAR(50),

    -- Capacity & Access
    max_attendees INTEGER,
    rsvp_required BOOLEAN DEFAULT FALSE,
    rsvp_opens_at TIMESTAMPTZ,
    rsvp_closes_at TIMESTAMPTZ,
    entry_fee INTEGER DEFAULT 0,
    entry_fee_currency VARCHAR(10) DEFAULT 'PQT',
    invite_only BOOLEAN DEFAULT FALSE,

    -- Tickets (JSONB array of ticket tiers)
    tickets JSONB DEFAULT '[]',

    -- Media
    cover_image_url TEXT,
    thumbnail_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',

    -- Denormalized Counters (trigger-maintained)
    rsvp_count INTEGER DEFAULT 0,
    attendance_count INTEGER DEFAULT 0,
    interested_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,

    -- Traffic & Popularity
    traffic_score FLOAT DEFAULT 0.0,
    popularity_tier VARCHAR(20) DEFAULT 'hidden-gem' CHECK (
        popularity_tier IN ('hidden-gem','rising','popular','trending','legendary')
    ),

    -- Occupancy (updated by NEXUS WebSocket)
    occupancy VARCHAR(20) DEFAULT 'empty' CHECK (
        occupancy IN ('empty','quiet','moderate','busy','packed','full')
    ),
    current_visitors INTEGER DEFAULT 0,

    -- Host Context (denormalized for fast display)
    host_display_name VARCHAR(100),
    host_avatar_url TEXT,
    host_reputation_score FLOAT DEFAULT 0.0,
    host_events_completed INTEGER DEFAULT 0,

    -- Venue reference (optional — not all events are at a formal venue)
    venue_id UUID,

    -- Status & Lifecycle
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft','published','cancelled','completed','in_progress','postponed'
    )),
    featured BOOLEAN DEFAULT FALSE,
    featured_at TIMESTAMPTZ,
    pinned BOOLEAN DEFAULT FALSE,
    pinned_until TIMESTAMPTZ,

    -- Akashic Integration
    akashic_rewards JSONB DEFAULT '{}',
    linked_quest_id UUID,

    -- Moderation
    auto_approved BOOLEAN DEFAULT TRUE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    report_count INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_notes TEXT,

    -- Metadata (flexible future features)
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT chk_event_timing CHECK (ends_at > starts_at),
    CONSTRAINT chk_event_duration CHECK (
        EXTRACT(EPOCH FROM (ends_at - starts_at)) <= 604800
    ),
    CONSTRAINT chk_rsvp_window CHECK (
        rsvp_opens_at IS NULL OR rsvp_closes_at IS NULL
        OR rsvp_closes_at > rsvp_opens_at
    ),
    CONSTRAINT chk_tags_limit CHECK (
        array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 5
    ),
    CONSTRAINT chk_gallery_limit CHECK (
        array_length(gallery_urls, 1) IS NULL OR array_length(gallery_urls, 1) <= 6
    ),
    CONSTRAINT chk_maturity_adult CHECK (
        NOT (maturity_rating = 'G' AND adult_only = TRUE)
    )
);

-- Primary listing queries
CREATE INDEX IF NOT EXISTS idx_events_upcoming ON events (starts_at ASC)
    WHERE status = 'published' AND starts_at > NOW();
CREATE INDEX IF NOT EXISTS idx_events_category_starts ON events (category, starts_at ASC)
    WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_events_maturity_starts ON events (maturity_rating, starts_at ASC)
    WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_events_creator ON events (creator_id, starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_instance ON events (instance_id, starts_at ASC)
    WHERE status = 'published' AND instance_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_venue ON events (venue_id, starts_at ASC)
    WHERE venue_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_popularity ON events (traffic_score DESC, starts_at ASC)
    WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_events_featured ON events (featured_at DESC)
    WHERE featured = TRUE AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_events_parent ON events (parent_event_id)
    WHERE parent_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_series ON events (series_id)
    WHERE series_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_search ON events USING GIN (
    to_tsvector('english', COALESCE(title,'') || ' ' || COALESCE(description,''))
);
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_events_status ON events (status, starts_at);
CREATE INDEX IF NOT EXISTS idx_events_in_progress ON events (starts_at ASC)
    WHERE status = 'in_progress';


-- --------------------------------------------------------
-- TABLE: event_rsvps
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    rsvp_status VARCHAR(20) NOT NULL DEFAULT 'going' CHECK (rsvp_status IN (
        'going', 'interested', 'maybe', 'not_going', 'waitlisted'
    )),

    attended BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    time_spent_minutes INTEGER DEFAULT 0,

    invited_by UUID REFERENCES users(id),
    plus_count INTEGER DEFAULT 0,

    notify_before_minutes INTEGER DEFAULT 30,
    notify_on_changes BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rsvps_event_status ON event_rsvps (event_id, rsvp_status);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_upcoming ON event_rsvps (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_attendance ON event_rsvps (event_id) WHERE attended = TRUE;
CREATE INDEX IF NOT EXISTS idx_rsvps_waitlist ON event_rsvps (event_id, created_at ASC)
    WHERE rsvp_status = 'waitlisted';


-- --------------------------------------------------------
-- TABLE: event_ratings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    rating_atmosphere INTEGER CHECK (rating_atmosphere BETWEEN 1 AND 5),
    rating_host INTEGER CHECK (rating_host BETWEEN 1 AND 5),
    rating_content INTEGER CHECK (rating_content BETWEEN 1 AND 5),

    is_flagged BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_event ON event_ratings (event_id, rating DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON event_ratings (user_id, created_at DESC);


-- --------------------------------------------------------
-- TABLE: event_reports
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    report_type VARCHAR(30) NOT NULL CHECK (report_type IN (
        'spam','misleading','inappropriate_content',
        'wrong_maturity','harassment','scam','copyright','other'
    )),
    description TEXT,
    evidence_urls TEXT[],

    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending','reviewing','resolved','dismissed'
    )),
    moderator_id UUID REFERENCES users(id),
    moderator_notes TEXT,
    action_taken VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,

    UNIQUE(event_id, reporter_id)
);


-- --------------------------------------------------------
-- TABLE: event_bookmarks
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_bookmarks (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON event_bookmarks (user_id, created_at DESC);


-- --------------------------------------------------------
-- TABLE: event_comments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    text TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_event ON event_comments (event_id, created_at DESC);


-- --------------------------------------------------------
-- MATERIALIZED VIEW: event_traffic_scores
-- Refresh: every 5 minutes
-- --------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS event_traffic_scores AS
SELECT
    e.id AS event_id,
    e.creator_id,
    e.starts_at,
    e.maturity_rating,
    COALESCE(rg.cnt, 0) AS rsvp_going_count,
    COALESCE(ri.cnt, 0) AS rsvp_interested_count,
    COALESCE(att.cnt, 0) AS attendance_count,
    COALESCE(rat.avg_rating, 0) AS avg_rating,
    COALESCE(rat.rating_count, 0) AS rating_count,
    e.view_count,
    (
        (COALESCE(rg.cnt, 0) * 3.0) +
        (COALESCE(ri.cnt, 0) * 1.0) +
        (COALESCE(att.cnt, 0) * 4.0) +
        (COALESCE(rat.avg_rating, 0) * 10.0) +
        (e.view_count * 0.1) +
        CASE
            WHEN e.starts_at BETWEEN NOW() AND NOW() + INTERVAL '24 hours' THEN 15.0
            WHEN e.starts_at BETWEEN NOW() AND NOW() + INTERVAL '7 days' THEN 8.0
            WHEN e.starts_at < NOW() AND e.ends_at > NOW() THEN 20.0
            ELSE 0.0
        END
    ) * CASE e.maturity_rating
        WHEN 'G' THEN 1.0  WHEN 'PG' THEN 0.95
        WHEN 'R' THEN 0.8  WHEN 'X' THEN 0.6
    END AS traffic_score
FROM events e
LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM event_rsvps
    WHERE event_id = e.id AND rsvp_status = 'going'
) rg ON TRUE
LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM event_rsvps
    WHERE event_id = e.id AND rsvp_status = 'interested'
) ri ON TRUE
LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM event_rsvps
    WHERE event_id = e.id AND attended = TRUE
) att ON TRUE
LEFT JOIN LATERAL (
    SELECT AVG(rating)::FLOAT AS avg_rating, COUNT(*) AS rating_count
    FROM event_ratings WHERE event_id = e.id AND is_visible = TRUE
) rat ON TRUE
WHERE e.status IN ('published', 'in_progress')
    AND e.starts_at > NOW() - INTERVAL '30 days';

CREATE UNIQUE INDEX IF NOT EXISTS idx_ets_event_id ON event_traffic_scores (event_id);
CREATE INDEX IF NOT EXISTS idx_ets_traffic ON event_traffic_scores (traffic_score DESC);


-- --------------------------------------------------------
-- FUNCTIONS & TRIGGERS
-- --------------------------------------------------------

-- Auto-update RSVP counters
CREATE OR REPLACE FUNCTION update_event_rsvp_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE events SET
        rsvp_count = (SELECT COUNT(*) FROM event_rsvps
            WHERE event_id = COALESCE(NEW.event_id, OLD.event_id) AND rsvp_status = 'going'),
        interested_count = (SELECT COUNT(*) FROM event_rsvps
            WHERE event_id = COALESCE(NEW.event_id, OLD.event_id) AND rsvp_status = 'interested'),
        attendance_count = (SELECT COUNT(*) FROM event_rsvps
            WHERE event_id = COALESCE(NEW.event_id, OLD.event_id) AND attended = TRUE),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rsvp_count_update ON event_rsvps;
CREATE TRIGGER trg_rsvp_count_update
    AFTER INSERT OR UPDATE OR DELETE ON event_rsvps
    FOR EACH ROW EXECUTE FUNCTION update_event_rsvp_counts();

-- Auto-transition event statuses (called by scheduler every 1 min)
CREATE OR REPLACE FUNCTION transition_event_statuses()
RETURNS INTEGER AS $$
DECLARE affected INTEGER := 0; rows_changed INTEGER;
BEGIN
    UPDATE events SET status = 'in_progress', updated_at = NOW()
    WHERE status = 'published' AND starts_at <= NOW() AND ends_at > NOW();
    GET DIAGNOSTICS rows_changed = ROW_COUNT;
    affected := affected + rows_changed;

    UPDATE events SET status = 'completed', completed_at = NOW(), updated_at = NOW()
    WHERE status = 'in_progress' AND ends_at <= NOW();
    GET DIAGNOSTICS rows_changed = ROW_COUNT;
    affected := affected + rows_changed;

    RETURN affected;
END;
$$ LANGUAGE plpgsql;

-- Refresh traffic scores + sync popularity tiers (called every 5 min)
CREATE OR REPLACE FUNCTION refresh_event_traffic()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY event_traffic_scores;
    UPDATE events e SET
        traffic_score = ets.traffic_score,
        popularity_tier = CASE
            WHEN ets.pct >= 95 THEN 'legendary'
            WHEN ets.pct >= 80 THEN 'trending'
            WHEN ets.pct >= 50 THEN 'popular'
            WHEN ets.pct >= 20 THEN 'rising'
            ELSE 'hidden-gem'
        END,
        updated_at = NOW()
    FROM (
        SELECT event_id, traffic_score,
            PERCENT_RANK() OVER (ORDER BY traffic_score) * 100 AS pct
        FROM event_traffic_scores
    ) ets
    WHERE e.id = ets.event_id
        AND (e.traffic_score IS DISTINCT FROM ets.traffic_score);
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_events_updated_at();

COMMIT;
