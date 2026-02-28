# poqpoq Events Calendar — Complete Architecture
## "The Gathering" — Public Events System for poqpoq World

**Version:** 1.0.0  
**Date:** February 27, 2026  
**Status:** Design Complete — Ready for Implementation  
**Database Target:** `bbworlds_nexus` (PostgreSQL 16.9)  
**API Target:** NEXUS Server (Node.js/Express)  
**Migration:** 016 — `migration_016_events_calendar.sql`  
**Schema Version:** 1.4.0

---

## 1. Design Philosophy

The poqpoq events calendar is the **social heartbeat** of the metaverse. Every gathering, performance, quest marathon, deity ceremony, and impromptu dance party pulses through this system. It lives in every user's side-panel Life Space as a first-class citizen — its own dedicated shelf panel, not buried in some menu.

### Core Principles

1. **Speed above all** — Sub-50ms API responses via materialized views, Redis caching, and denormalized hot paths. The calendar must feel instant.
2. **Good Neighbor compliant** — Rate-limited writes, batched reads, no N+1 queries, connection pooling respected. Every query justified.
3. **Subscriber-gated creation** — You must hold at least a free-tier subscription to list events. Alpha/beta testers exempted through June 30, 2026.
4. **Public-first consumption** — Anyone can browse, filter, and RSVP (if logged in). The calendar is a showcase, not a walled garden.
5. **Instance-native** — Events are anchored to instances. Clicking "Attend" can teleport you there. The 3D world and the calendar are one system.
6. **Akashic-integrated** — Hosting events earns Akashic essences. Attending and completing event quests feeds your progression.
7. **Real-time signals** — Sim occupancy, traffic trends, popularity scores — the calendar is alive, not a static bulletin board.

### What We Learned from Second Life (and What We're Leaving Behind)

**Keep:** Categories, maturity ratings, map integration, community-driven listings, recurring events.  
**Kill:** Stale UI, no real-time updates, terrible search, no social layer, no progression hooks, no mobile-first design, no RSVP/attendance tracking, no host reputation, no occupancy signals, no dress codes, no popularity scoring.

---

## 2. Event Classification Taxonomy

This is the backbone. Clean classifications make the calendar navigable at any scale — from 50 events to 50,000. The goal: a user scanning 200 events should be able to find what they want in under 3 clicks.

### 2.1 Design Rationale

**Why mutually exclusive primary categories?**  
Multi-select categories sound user-friendly but create chaos at scale. If "Music Night + Social + Roleplay" is one event, which filter bucket does it live in? You get combinatorial explosion, inconsistent listings, and useless filters. Instead: one primary category tells you what the event *fundamentally is*. Tags handle the nuance.

**Why not freeform categories?**  
Because "DJ Set", "dj night", "Music - DJ", and "DJ/Music" are all the same thing. User-defined categories devolve into noise within weeks. We curate the primary set and let tags handle organic discovery.

**Boundary rules (published in host docs):**  
- A DJ playing at a social hangout → `social` (music is backdrop, not the point)
- A DJ performing a set as the main event → `music`  
- A fashion show with prizes → `competition` (not `commerce`)
- A marketplace with live music → `commerce` (music is ambiance)
- A deity ritual with a quest component → `ceremony` (quests are secondary)
- A quest that happens during a ceremony → `quest` (if the quest is the main draw)
- A town hall with voting → `community` (governance is the substance)
- A guided world tour → `exploration` (even if educational)
- A building workshop → `education` (learning is the verb)

When in doubt: what would someone SEARCHING for this event type as?

### 2.1 Primary Event Categories

These are mutually exclusive. Every event gets exactly one.

| Category Slug | Display Name | Icon | Description |
|---|---|---|---|
| `social` | Social & Hangouts | 🫂 | Casual meetups, open hangouts, welcome parties, newbie orientations |
| `music` | Music & DJs | 🎵 | Live performances, DJ sets, music festivals, open mic nights |
| `art` | Art & Exhibitions | 🎨 | Gallery openings, art shows, build tours, photography events |
| `education` | Education & Talks | 📚 | Workshops, tutorials, lectures, panels, Q&A sessions |
| `roleplay` | Roleplay & Story | 🎭 | RP sessions, narrative events, LARP, tabletop adaptations |
| `quest` | Quests & Games | ⚔️ | Quest marathons, treasure hunts, competitions, puzzle events |
| `ceremony` | Ceremonies & Rituals | 🕯️ | Deity ceremonies, akashic rituals, community celebrations, weddings |
| `commerce` | Commerce & Markets | 🏪 | Marketplace events, auctions, trade fairs, creator showcases |
| `exploration` | Exploration & Tours | 🧭 | Guided tours, world exploration, build showcases, historical walks |
| `performance` | Theater & Performance | 🎬 | Theater productions, improv, poetry readings, storytelling |
| `community` | Community & Governance | 🏛️ | Town halls, community meetings, volunteer events, governance votes |
| `competition` | Contests & Competitions | 🏆 | Build contests, fashion shows, avatar contests, speed runs |
| `special` | Special & Seasonal | ✨ | Holidays, anniversaries, platform milestones, one-time spectacles |

### 2.2 Event Tags (Multi-select, max 5)

Tags supplement the primary category — searchable, filterable, combinable. We ship with a curated starter set and let the community propose new ones through moderation.

**Starter tag set:**

```
beginner-friendly, adults-only, family-friendly, live-music, pre-recorded,
interactive, spectator, competitive, collaborative, free-entry, paid-entry,
recurring, one-time, outdoor, indoor, underwater, aerial, deity-themed,
akashic-quest, building, scripting, animation, avatar-design, photography,
poetry, dance, combat, puzzle, trivia, meditation, charity, newcomer-welcome,
late-night, early-bird, multi-day, flash-event, companion-friendly
```

### 2.3 Dress Codes

Dress codes matter in a virtual world where your avatar IS your outfit. They set expectations, create atmosphere, and prevent the "naked newbie at a formal gala" problem.

| Code Slug | Display Name | Description | Enforcement |
|---|---|---|---|
| `none` | Come As You Are | No dress code — wear whatever you want | None |
| `casual` | Casual | Relaxed attire, everyday avatars | Soft (info only) |
| `formal` | Formal / Black Tie | Elegant attire, gowns, suits, refined avatars | Soft |
| `themed` | Themed Costume | Specific theme in `dress_code_details` | Soft to Strict |
| `roleplay` | In-Character | Must be in RP-appropriate character/outfit | Strict (host can eject) |
| `fantasy` | Fantasy / Mythical | Dragons, elves, magical creatures, deity forms | Soft |
| `modern` | Modern / Contemporary | Real-world modern fashion | Soft |
| `historical` | Historical / Period | Specific era in `dress_code_details` | Soft |
| `uniform` | Uniform / Team | Group uniform or faction colors | Strict |
| `creative` | Creative / Experimental | Avant-garde, experimental, surprise us | None |
| `minimal` | Minimal / Default | Default avatars welcome, no customization pressure | None |
| `furry` | Furry / Anthro | Anthropomorphic or animal-based avatars encouraged | Soft |
| `human` | Human-Presenting | Human-form avatars only | Soft |

**Enforcement Levels:**
- **None:** Informational only. No mechanics.
- **Soft:** Dress code displayed prominently on RSVP confirmation and event detail. Gentle toast on teleport-in: "This event has a Formal dress code — looking sharp helps the vibe!"
- **Strict:** Host can flag `dress_code_strict: true` in metadata. On entry, users see a modal: "This event requires [dress code]. The host may ask non-compliant attendees to change or leave." Hosts with moderator permissions on the instance can soft-eject (teleport to lobby).

**`dress_code_details`** is a free-text field (max 500 chars) for specifics: "1920s Gatsby — think flapper dresses, pinstripe suits, feathered headbands" or "Cyberpunk — neon, chrome, augmented".

**Multiple Dress Codes:** v1 supports a single primary dress code. If hosts need flexibility (e.g., "formal OR themed"), they use `dress_code_details` to explain. Future: array support.

### 2.4 Maturity Ratings

Aligned with existing `content_ratings` system: G, PG, R, X. This is non-negotiable — the same rating system that governs instances governs events.

| Rating | Label | Who Can See | Who Can List |
|---|---|---|---|
| `G` | General | Everyone | Any subscriber |
| `PG` | Parental Guidance | Users with PG+ maturity preference | Any subscriber |
| `R` | Restricted | Age-verified users with R+ preference | Age-verified subscribers |
| `X` | Adult | Age-verified users with X preference | Age-verified subscribers on adult_only instances |

**Critical constraint:** Events inherit a **maturity floor** from their host instance. An event in an R-rated instance cannot be listed as G or PG. Enforced at API layer:

```javascript
if (MATURITY_ORDER[event.maturity_rating] < MATURITY_ORDER[instance.maturity_rating]) {
    throw new ValidationError(
        `Event maturity (${event.maturity_rating}) cannot be lower than ` +
        `instance maturity (${instance.maturity_rating})`
    );
}
```

Where `MATURITY_ORDER = { G: 0, PG: 1, R: 2, X: 3 }`.

**User-side filtering:** The calendar respects `users.preferred_maturity_level`. If a user has `PG` preference, they never see R or X events in browse results. This is applied server-side, not client-side — no leakage.

---

## 3. Traffic, Popularity & Real-Time Signals

This is what separates a 2026 calendar from a 2006 bulletin board. When someone scans the events list, they should *feel* which sims are alive, which are ghost towns, and which are about to pop off — before they ever teleport.

### 3.1 Instance Occupancy (Real-Time, WebSocket-Fed)

NEXUS WebSocket server already tracks connected users per instance via the `instance_visitors` table and in-memory session maps. We tap this directly — no new data collection needed.

**API Response:**

```
GET /api/events/:eventId/occupancy
→ {
    current_visitors: 12,
    max_visitors: 25,             // from instances.max_visitors
    percentage: 48,
    status: "active",
    is_host_present: true,        // creator_id is currently in-instance
    avg_session_minutes: 22,      // rolling avg from instance_visitors.total_time_minutes
    trend: "rising"               // "rising" | "stable" | "declining" (5-min slope)
}
```

**Occupancy Status Labels (displayed on every event card):**

| Status | Condition | Display | Color | Emoji |
|---|---|---|---|---|
| `empty` | 0 visitors | "Empty" | Gray (#6B7280) | ○ |
| `quiet` | 1-25% capacity | "Quiet" | Slate blue (#64748B) | ◔ |
| `gathering` | 26-50% capacity | "Gathering" | Teal (#14B8A6) | ◑ |
| `lively` | 51-75% capacity | "Lively" | Green (#22C55E) | ◕ |
| `packed` | 76-95% capacity | "Packed!" | Amber (#F59E0B) | ● |
| `full` | 96-100% capacity | "Full" | Red (#EF4444) | 🚫 |

**Critical UX rule:** An event showing "Empty" 15 minutes past its start time should be visually deprioritized (dimmed card, moved down in default sort). This prevents the "I teleported to a dead event" problem that plagued SL for 20 years.

**Empty Sim Detection Logic:**
```
is_ghost_event = (
    event.status = 'in_progress'
    AND current_visitors = 0
    AND (NOW() - event.starts_at) > INTERVAL '15 minutes'
)
```
Ghost events get a subtle "No one here yet" overlay. After 30 minutes empty, they drop to bottom of lists. After 60 minutes empty with no host present, auto-flag for review.

**Redis Caching:**
- Key: `events:occupancy:{instance_id}`
- TTL: 10 seconds
- Source: NEXUS WebSocket server pushes on every join/leave
- Fallback: Direct `instance_visitors` query (< 5ms with index)

### 3.2 Sim Traffic & Popularity Score

Composite metric from *actual behavior*, not just RSVP promises. Updated every 5 minutes by background job.

**Traffic Score Formula:**

```
traffic_score = (
    -- Commitment signals (pre-event)
    (rsvp_going       * 3.0)  +
    (rsvp_interested  * 1.0)  +
    
    -- Reality signals (during/post-event)
    (actual_attendance * 4.0)  +     // from event_rsvps.attended = true
    (avg_time_spent_min * 0.5) +     // people staying > people bouncing
    
    -- Quality signals
    (avg_rating        * 10.0) +
    (rating_count      * 1.0)  +     // more ratings = more confidence
    
    -- Discovery signals
    (view_count        * 0.1)  +
    (bookmark_count    * 2.0)  +
    
    -- Temporal boost
    freshness_boost
) * maturity_reach_factor * host_reliability_factor
```

**Freshness Boost:**

| Condition | Bonus |
|---|---|
| Happening right now (`in_progress`) | +25.0 |
| Starts within 1 hour | +20.0 |
| Starts within 24 hours | +15.0 |
| Starts within 7 days | +8.0 |
| Past event (completed) | +0.0 |

**Maturity Reach Factor** (reflects audience size, not quality judgment):

| Rating | Factor | Rationale |
|---|---|---|
| G | 1.0 | Broadest audience |
| PG | 0.95 | Slightly narrowed |
| R | 0.8 | Age-verified subset |
| X | 0.6 | Smallest eligible pool |

**Host Reliability Factor:**

| Host Reputation Tier | Factor |
|---|---|
| Excellent (80+) | 1.1 (boost) |
| Good (50-79) | 1.0 (neutral) |
| New (no history) | 0.9 (slight penalty) |
| Unreliable (< 30) | 0.7 (significant penalty) |

### 3.3 Popularity Tiers (Computed from Percentile Rank)

| Tier | Percentile | Badge | Card Treatment |
|---|---|---|---|
| `hidden-gem` | Bottom 20% (score > 0) | 💎 Hidden Gem | Standard card |
| `rising` | 20th–50th | 📈 Rising | Standard card |
| `popular` | 50th–80th | 🔥 Popular | Subtle glow border |
| `trending` | 80th–95th | ⚡ Trending | Animated border pulse |
| `legendary` | Top 5% | 🌟 Legendary | Gold border, featured row |

### 3.4 Sim Popularity (Historical, Instance-Level)

Beyond single-event metrics, we track *instance-level* health to answer "is this sim generally popular or a wasteland?"

Derived from existing `instance_visitors` data:

```sql
-- Sim Popularity Score (not a new table — computed view)
SELECT
    i.id,
    i.name,
    COUNT(DISTINCT iv.user_id) AS unique_visitors_30d,
    AVG(iv.total_time_minutes) AS avg_visit_duration,
    SUM(iv.visit_count) AS total_visits_30d,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'completed') AS events_hosted_30d,
    -- Sim Health Score
    (
        COUNT(DISTINCT iv.user_id) * 2.0 +
        AVG(iv.total_time_minutes) * 0.5 +
        SUM(iv.visit_count) * 0.3 +
        COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'completed') * 5.0
    ) AS sim_health_score
FROM instances i
LEFT JOIN instance_visitors iv ON iv.instance_id = i.id
    AND iv.joined_at > NOW() - INTERVAL '30 days'
LEFT JOIN events e ON e.instance_id = i.id
GROUP BY i.id, i.name;
```

Displayed on event cards as a small "Sim Popularity" indicator: 🟢 Active Sim, 🟡 Moderate, 🔴 Low Traffic, ⚪ New/Unknown.

### 3.5 Host Reputation Score

Answers the question: "Is this host reliable? Will this event actually happen?"

```
host_reputation = (
    (events_completed      * 3)   +  // completed, not just created
    (avg_attendance_rate    * 30)  +  // what % of RSVPs showed up
    (avg_event_rating       * 10)  +
    (repeat_attendee_ratio  * 20)  +  // people come back = trust signal
    (host_present_ratio     * 15)  -  // was host actually AT their events?
    (cancelled_events       * 10)  -
    (no_show_events         * 15)  -  // scheduled but never showed up
    (reported_events        * 25)
)
```

**Host Presence Tracking:** When an event is `in_progress`, we check whether `creator_id` is in the `instance_visitors` for that instance. A host who no-shows their own event tanks their reliability score fast. This is the single biggest quality signal we can track.

Displayed on event cards and the host's `user_contact_cards` profile.

---

## 4. Database Schema — Migration 016

**New tables:** 5 (`events`, `event_rsvps`, `event_ratings`, `event_reports`, `event_bookmarks`)  
**New indexes:** 22  
**New materialized view:** 1 (`event_traffic_scores`)  
**New functions:** 3  
**Impact on existing tables:** Zero modifications.

```sql
-- ============================================================
-- Migration 016: Events Calendar System
-- Schema Version: 1.4.0
-- Date: 2026-02-27
-- ============================================================

BEGIN;

INSERT INTO schema_version (version, description, migration_file)
VALUES ('1.4.0', 'Events Calendar System', 'migration_016_events_calendar.sql');

-- --------------------------------------------------------
-- TABLE: events
-- --------------------------------------------------------
CREATE TABLE events (
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

    -- Capacity & Access
    max_attendees INTEGER,
    rsvp_required BOOLEAN DEFAULT FALSE,
    rsvp_opens_at TIMESTAMPTZ,
    rsvp_closes_at TIMESTAMPTZ,
    entry_fee INTEGER DEFAULT 0,
    invite_only BOOLEAN DEFAULT FALSE,

    -- Media
    cover_image_url TEXT,
    thumbnail_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',

    -- Denormalized Counters (trigger-maintained)
    rsvp_count INTEGER DEFAULT 0,
    attendance_count INTEGER DEFAULT 0,
    interested_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,

    -- Traffic & Popularity
    traffic_score FLOAT DEFAULT 0.0,
    popularity_tier VARCHAR(20) DEFAULT 'hidden-gem' CHECK (
        popularity_tier IN ('hidden-gem','rising','popular','trending','legendary')
    ),

    -- Host Context (denormalized for fast display)
    host_display_name VARCHAR(100),
    host_avatar_url TEXT,
    host_reputation_score FLOAT DEFAULT 0.0,
    host_events_completed INTEGER DEFAULT 0,

    -- Sim Health (denormalized from instance stats, refreshed with traffic)
    sim_visitor_count_30d INTEGER DEFAULT 0,
    sim_avg_visit_minutes FLOAT DEFAULT 0.0,
    sim_health_tier VARCHAR(10) DEFAULT 'unknown'
        CHECK (sim_health_tier IN ('active','moderate','low','new','unknown')),

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
    linked_quest_id UUID REFERENCES quests(id) ON DELETE SET NULL,

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
CREATE INDEX idx_events_upcoming ON events (starts_at ASC)
    WHERE status = 'published' AND starts_at > NOW();
CREATE INDEX idx_events_category_starts ON events (category, starts_at ASC)
    WHERE status = 'published';
CREATE INDEX idx_events_maturity_starts ON events (maturity_rating, starts_at ASC)
    WHERE status = 'published';
CREATE INDEX idx_events_creator ON events (creator_id, starts_at DESC);
CREATE INDEX idx_events_instance ON events (instance_id, starts_at ASC)
    WHERE status = 'published' AND instance_id IS NOT NULL;
CREATE INDEX idx_events_popularity ON events (traffic_score DESC, starts_at ASC)
    WHERE status = 'published';
CREATE INDEX idx_events_featured ON events (featured_at DESC)
    WHERE featured = TRUE AND status = 'published';
CREATE INDEX idx_events_parent ON events (parent_event_id)
    WHERE parent_event_id IS NOT NULL;
CREATE INDEX idx_events_search ON events USING GIN (
    to_tsvector('english', COALESCE(title,'') || ' ' || COALESCE(description,''))
);
CREATE INDEX idx_events_tags ON events USING GIN (tags);
CREATE INDEX idx_events_status ON events (status, starts_at);
CREATE INDEX idx_events_in_progress ON events (starts_at ASC)
    WHERE status = 'in_progress';


-- --------------------------------------------------------
-- TABLE: event_rsvps
-- --------------------------------------------------------
CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    rsvp_status VARCHAR(20) NOT NULL DEFAULT 'going' CHECK (rsvp_status IN (
        'going', 'interested', 'not_going', 'waitlisted'
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

CREATE INDEX idx_rsvps_event_status ON event_rsvps (event_id, rsvp_status);
CREATE INDEX idx_rsvps_user_upcoming ON event_rsvps (user_id, created_at DESC);
CREATE INDEX idx_rsvps_attendance ON event_rsvps (event_id) WHERE attended = TRUE;
CREATE INDEX idx_rsvps_waitlist ON event_rsvps (event_id, created_at ASC)
    WHERE rsvp_status = 'waitlisted';


-- --------------------------------------------------------
-- TABLE: event_ratings
-- --------------------------------------------------------
CREATE TABLE event_ratings (
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

CREATE INDEX idx_ratings_event ON event_ratings (event_id, rating DESC);
CREATE INDEX idx_ratings_user ON event_ratings (user_id, created_at DESC);


-- --------------------------------------------------------
-- TABLE: event_reports
-- --------------------------------------------------------
CREATE TABLE event_reports (
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
CREATE TABLE event_bookmarks (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, event_id)
);

CREATE INDEX idx_bookmarks_user ON event_bookmarks (user_id, created_at DESC);


-- --------------------------------------------------------
-- MATERIALIZED VIEW: event_traffic_scores
-- Refresh: every 5 minutes
-- --------------------------------------------------------
CREATE MATERIALIZED VIEW event_traffic_scores AS
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

CREATE UNIQUE INDEX idx_ets_event_id ON event_traffic_scores (event_id);
CREATE INDEX idx_ets_traffic ON event_traffic_scores (traffic_score DESC);


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

COMMIT;
```

---

## 5. API Design

All endpoints follow Good Neighbor Policy: connection pooling via `pg` Pool (max 20), parameterized queries, express-rate-limit.

### 5.1 Rate Limits

| Tier | Read/min | Write/min | Search/min |
|---|---|---|---|
| Anonymous | 60 | 0 | 20 |
| Free subscriber | 120 | 10 | 40 |
| Premium subscriber | 300 | 30 | 100 |
| Alpha/Beta tester | 300 | 30 | 100 |

### 5.2 Endpoints

**Public (No Auth)**

| Method | Path | Description |
|---|---|---|
| GET | `/api/events` | Browse/filter events |
| GET | `/api/events/happening-now` | In-progress events |
| GET | `/api/events/trending` | Top by traffic_score |
| GET | `/api/events/featured` | Staff-picked |
| GET | `/api/events/:id` | Detail + occupancy |
| GET | `/api/events/:id/attendees` | Public attendee list |
| GET | `/api/events/categories` | Category defs + counts |
| GET | `/api/events/tags/popular` | Top 20 tags by usage |
| GET | `/api/events/search` | Full-text search |

**Authenticated**

| Method | Path | Description |
|---|---|---|
| POST | `/api/events` | Create (subscriber+) |
| PUT | `/api/events/:id` | Update own |
| DELETE | `/api/events/:id` | Cancel/delete own |
| POST | `/api/events/:id/publish` | Draft → published |
| POST | `/api/events/:id/rsvp` | RSVP |
| PUT | `/api/events/:id/rsvp` | Update RSVP |
| DELETE | `/api/events/:id/rsvp` | Remove RSVP |
| POST | `/api/events/:id/rate` | Rate completed event |
| POST | `/api/events/:id/bookmark` | Bookmark |
| DELETE | `/api/events/:id/bookmark` | Remove bookmark |
| POST | `/api/events/:id/report` | Report |

**Admin**

| Method | Path | Description |
|---|---|---|
| PUT | `/api/admin/events/:id/feature` | Feature/unfeature |
| PUT | `/api/admin/events/:id/approve` | Approve pending |
| PUT | `/api/admin/events/:id/moderate` | Moderation actions |
| GET | `/api/admin/events/reports` | Pending reports |

### 5.3 Query Parameters — `GET /api/events`

```
?category=music,art             -- Multi-category (comma-sep)
&maturity=G,PG                  -- Auto-set from user prefs (server-enforced)
&tag=beginner-friendly          -- Tag filter
&dress_code=formal,themed       -- Dress code filter
&dress_code_strict=true         -- Only strict-dress events
&status=published               -- Default: published
&starts_after=2026-03-01        -- Date range start
&starts_before=2026-03-31       -- Date range end
&instance_id=<uuid>             -- Events at location
&creator_id=<uuid>              -- Events by host
&has_rsvp_space=true            -- Capacity remaining
&is_free=true                   -- entry_fee = 0
&sim_health=active,moderate     -- Exclude dead sims
&not_empty=true                 -- Hide ghost events (in_progress + 0 visitors)
&sort=starts_at|traffic_score|rsvp_count|created_at|sim_health
&order=asc|desc
&limit=20                       -- Max 50
&offset=0
&search=jazz night              -- Full-text (GIN)
&happening_now=true             -- In-progress only
&bookmarked=true                -- My bookmarks (auth)
&my_rsvps=true                  -- My RSVP'd events (auth)
```

### 5.4 Authorization Middleware

```javascript
async function requireEventCreationAccess(req, res, next) {
    const user = req.user;

    // Alpha/Beta testers: exempt through June 30, 2026
    const betaCutoff = new Date('2026-06-30T23:59:59Z');
    const isTester = user.metadata?.is_alpha_tester
                  || user.metadata?.is_beta_tester;
    if (isTester && new Date() <= betaCutoff) return next();

    // Must have at least free-tier subscription
    if (!['free','basic','premium','enterprise']
        .includes(user.subscription_tier)) {
        return res.status(403).json({
            error: 'subscription_required',
            message: 'A free subscription or higher is required to create events.',
            upgrade_url: '/subscribe'
        });
    }

    // Account active + email verified
    if (user.status !== 'active' || !user.email_verified) {
        return res.status(403).json({
            error: 'account_not_ready',
            message: 'Active account with verified email required.'
        });
    }

    next();
}
```

---

## 6. Caching Strategy (Redis)

| Cache Key | TTL | Invalidation |
|---|---|---|
| `events:listing:{hash}` | 30s | On create/update/delete |
| `events:detail:{id}` | 60s | On update |
| `events:occupancy:{instance_id}` | 10s | Auto-expire |
| `events:trending` | 5min | On traffic refresh |
| `events:featured` | 10min | On feature action |
| `events:categories:counts` | 5min | On status change |
| `events:tags:popular` | 15min | On create/update |
| `user:{id}:rsvps` | 2min | On RSVP change |
| `user:{id}:bookmarks` | 5min | On bookmark change |

Stale-while-revalidate: serve cached immediately, refresh in background when TTL < 25% remaining.

---

## 7. Akashic Integration

### Reward Distribution (on event completion)

| Action | Resonance | Wisdom | Creativity | Connection |
|---|---|---|---|---|
| Host (5+ attendees) | +5 | — | +3 | +10 |
| Host (15+ attendees) | +10 | — | +5 | +20 |
| Host (30+ attendees) | +15 | +5 | +8 | +35 |
| Attend an event | +2 | — | — | +3 |
| Rate + write review | +1 | +2 | +1 | +1 |
| Complete linked quest | Standard rewards + 1.5x Connection bonus |

Logged as `akashic_transactions` with `source_type = 'event'`.

---

## 8. Side Panel — Life Space Placement

```
Life Space (Side Panel)
├── 🏠 My Worlds
├── 👥 Friends
├── 📦 Inventory
├── 📅 Events              ← First-class citizen
│   ├── 🔴 Happening Now    (animated pulse when live)
│   ├── 🔍 Browse All
│   ├── 📋 My Events        (hosting + RSVP'd)
│   ├── 🔖 Bookmarked
│   └── ➕ Create Event
├── 🏆 Quests
└── ⚙️ Settings
```

**"Happening Now" Pulse:** When events are `in_progress`, the Events panel icon gets a breathing glow animation — a passive signal that something is live.

### Notification Hooks

| Trigger | Type | To |
|---|---|---|
| Event starting in 30min | Push + toast | RSVP'd users |
| Event starting in 5min | Toast + sound | RSVP'd users |
| Event cancelled | Push | RSVP'd users |
| Event updated (time/loc) | Push | RSVP'd + interested |
| New in favorite category | Panel badge | Users with pref |
| Waitlist spot opened | Push + toast | Next waitlisted |

---

## 9. Performance Budget

| Operation | Target | Strategy |
|---|---|---|
| Browse events (default) | < 20ms | `idx_events_upcoming` + Redis |
| Category filter | < 15ms | `idx_events_category_starts` |
| Full-text search | < 50ms | GIN tsvector index |
| Event detail | < 10ms | PK lookup + Redis |
| RSVP create | < 30ms | Insert + trigger |
| Occupancy check | < 5ms | Redis only |
| Traffic refresh | < 2s | Concurrent mat view |
| My Events | < 20ms | User indexes |

---

## 10. Migration Rollback

```sql
BEGIN;
DROP MATERIALIZED VIEW IF EXISTS event_traffic_scores;
DROP FUNCTION IF EXISTS refresh_event_traffic();
DROP FUNCTION IF EXISTS transition_event_statuses();
DROP FUNCTION IF EXISTS update_event_rsvp_counts() CASCADE;
DROP TABLE IF EXISTS event_bookmarks;
DROP TABLE IF EXISTS event_reports;
DROP TABLE IF EXISTS event_ratings;
DROP TABLE IF EXISTS event_rsvps;
DROP TABLE IF EXISTS events;
DELETE FROM schema_version WHERE version = '1.4.0';
COMMIT;
```

---

## 11. Future (Not in v1)

Intentionally deferred to keep v1 tight:

- **Event Series** — Grouping events under season umbrellas
- **Ticketing** — Token economy integration beyond basic entry_fee
- **Co-host Permissions** — Full permission model for co_host_ids
- **Event Templates** — Saveable recurring formats
- **Calendar Sync** — iCal/Google Calendar export
- **AI Recommendations** — Companion-suggested events from Akashic profile
- **Cross-instance Events** — Parades, progressive parties
- **Event Chat** — Persistent pre/post-event channels
- **Promoted Events** — Premium placement tiers
- **Analytics Dashboard** — Host-facing traffic/demographic breakdowns

---

*Designed for 215 users today and 215,000 tomorrow.*  
*Good Neighbor compliant. NEXUS-native. Akashic-integrated.*
