# poqpoq Events — Product Requirements Document

**Version:** 1.0.0
**Date:** February 27, 2026
**Author:** Allen Partridge / Claude (collaborative design)
**Status:** Design Phase
**Companion Doc:** `POQPOQ_EVENTS_CALENDAR_ARCHITECTURE.md` (backend schema, API, caching)

---

## 1. Product Vision

poqpoq Events is the **social heartbeat** of the metaverse — a world-class event discovery and management system that lives both as a standalone web app (`poqpoq.com/events/`) and as a first-class shelf panel inside poqpoq World.

**The core insight from competitive research:** People don't attend events — they attend *people*. Social proof, anticipation mechanics, and real-time liveness signals are what separate a 2026 event platform from a 2006 bulletin board. Second Life's event system fails because it's a database query with a UI bolted on. We're building the opposite: a social experience with a database underneath.

### What We're Building
1. **Standalone Events Web App** — Next.js static export at `/events/`, matching the Marketplace's tech stack and design system exactly
2. **In-World Shelf Panel** — Compact `IShelfPanel` implementation for the right shelf in poqpoq World (later phase, thin wrapper)

### Design Principles
1. **Cards first, data second** — Every event is a visual composition, not a text row
2. **Social proof is the engine** — Who's going matters more than what's happening
3. **Liveness signals everywhere** — Occupancy dots, trending badges, "happening now" pulses
4. **Discovery in three modes** — Browse (strips), Search (filters), Curated (collections)
5. **Zero friction RSVP** — One click to respond, visible results immediately
6. **In-world native** — Teleport buttons, 3D venue previews, avatar attendance lists
7. **Speed above all** — Sub-50ms API responses, instant client-side filtering

---

## 2. Target Users

| Persona | Needs | Key Actions |
|---------|-------|-------------|
| **Explorer** (anonymous) | Find something interesting happening now | Browse, filter by category/time, check occupancy |
| **Social Attendee** (logged in) | See what friends are doing, RSVP, plan their evening | RSVP, check attendee lists, bookmark, share |
| **Event Host** (subscriber) | Create compelling event listings, track attendance | Create/edit events, monitor RSVPs, communicate |
| **Community Leader** | Curate event collections, build scene reputation | Create curated lists, feature events, moderate |

### Access Tiers
- **Anonymous**: Browse G-rated events only. No M or A content visible. No RSVP capability.
- **Logged In**: Browse all events matching maturity preference. RSVP, bookmark, comment, rate.
- **Subscriber (free+)**: All above + create events. Alpha/beta testers exempt through June 30, 2026.
- **Admin**: Feature/unfeature, moderate, approve, manage reports.

---

## 3. Maturity Rating System

Aligned with the Marketplace's proven 3-tier system. Platform is 18+.

| Rating | Label | Badge Color | Who Can See | Card Treatment |
|--------|-------|-------------|-------------|----------------|
| **G** | General | Teal `#4ecdc4` | Everyone (including anonymous) | Standard |
| **M** | Moderate | Gold `#ffe66d` | Logged-in users only | Standard |
| **A** | Adult | Red `#ff6b6b` | Logged-in users with A preference enabled | Subtle blur on thumbnail until hover (?) |

**Enforcement:** Server-side filtering. Anonymous API calls only return G events. Authenticated calls respect `preferred_maturity_level`. No client-side leakage.

**Instance Floor Rule:** Events inherit a maturity floor from their host instance. An event in an M-rated instance cannot be listed as G.

---

## 4. Event Classification

### 4.1 Primary Categories (13, mutually exclusive)

Every event gets exactly one. The question to resolve ambiguity: *what would someone searching for this event type as?*

| Slug | Display Name | Icon | Color Token | Example |
|------|-------------|------|-------------|---------|
| `social` | Social & Hangouts | Users | `--color-cat-social` `#00ff88` | Open hangout, welcome party |
| `music` | Music & DJs | Music | `--color-cat-music` `#a78bfa` | DJ set, live concert |
| `art` | Art & Exhibitions | Palette | `--color-cat-art` `#f472b6` | Gallery opening, photography show |
| `education` | Education & Talks | BookOpen | `--color-cat-education` `#38bdf8` | Workshop, tutorial, panel |
| `roleplay` | Roleplay & Story | Theater | `--color-cat-roleplay` `#c084fc` | RP session, LARP |
| `quest` | Quests & Games | Swords | `--color-cat-gaming` `#fb923c` | Treasure hunt, puzzle event |
| `ceremony` | Ceremonies & Rituals | Flame | `--color-cat-ceremony` `#f59e0b` | Deity ceremony, wedding |
| `commerce` | Commerce & Markets | Store | `--color-cat-shopping` `#fbbf24` | Auction, trade fair |
| `exploration` | Exploration & Tours | Compass | `--color-cat-exploration` `#2dd4bf` | Guided tour, build showcase |
| `performance` | Theater & Performance | Clapperboard | `--color-cat-performance` `#f87171` | Improv, poetry reading |
| `community` | Community & Governance | Landmark | `--color-cat-community` `#4ecdc4` | Town hall, volunteer event |
| `competition` | Contests & Competitions | Trophy | `--color-cat-competition` `#fbbf24` | Build contest, fashion show |
| `special` | Special & Seasonal | Sparkles | `--color-cat-special` `#e879f9` | Holiday event, milestone |

### 4.2 Tags (multi-select, max 5)
Supplement the primary category. Searchable, filterable. Curated starter set:
```
beginner-friendly, adults-only, family-friendly, live-music, pre-recorded,
interactive, spectator, competitive, collaborative, free-entry, paid-entry,
recurring, one-time, outdoor, indoor, underwater, aerial, deity-themed,
akashic-quest, building, scripting, animation, avatar-design, photography,
poetry, dance, combat, puzzle, trivia, meditation, charity, newcomer-welcome,
late-night, early-bird, multi-day, flash-event, companion-friendly
```

### 4.3 Dress Codes (13 options)
First-class concept. See architecture doc section 2.3 for full spec. Displayed as a subtle badge on event cards when set to anything other than `none`.

---

## 5. UI Architecture — Standalone Web App

### 5.1 Tech Stack (mirrors Marketplace)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19, TypeScript 5.9) |
| Styling | Tailwind CSS 4 + PostCSS + tw-animate-css |
| Components | shadcn/ui (new-york style) + Lucide React |
| Utilities | class-variance-authority, clsx, tailwind-merge |
| Output | Static export (`output: "export"`, basePath: `/events`) |
| Theme | Dark-first poqpoq design system (shared globals.css tokens) |

### 5.2 Design System

**Shared with Marketplace (verbatim):**
- Surface palette: `bg-deep` #0a0a0a through `bg-elevated` #2a2a32
- Accent: poqpoq green #00ff88 / #00cc6e / rgba(0,255,136,0.1)
- Text hierarchy: primary #e0e0e0, secondary #888888, tertiary #555555
- Border palette: #2a2a2a / #1e1e1e / #3a3a3a
- Typography: Inter (sans), JetBrains Mono (mono), Dongle 700 (titles), Space Mono (labels), Montserrat 900 (hero)
- Radius: sm 4px, md 6px, lg 10px, xl 14px
- No box shadows. Depth via color layers and borders. Thin custom scrollbars.

**Extended for Events:**
- 13 category color tokens (see section 4.1)
- RSVP state colors: going #00ff88, interested #38bdf8, maybe #fbbf24
- Occupancy status colors: empty #6B7280, quiet #64748B, gathering #14B8A6, lively #22C55E, packed #F59E0B, full #EF4444
- Popularity tier treatments (border effects — see section 6.4)

### 5.3 Page Map

```
/events/                     Landing + browse (featured carousel, strips, search)
/events/[id]/                Event detail page
/events/venue/[id]/          Venue detail page
/events/explore/             Full search/explore with calendar view toggle
```

---

## 6. Component Design

### 6.1 Event Cards — Hybrid System

**Two card formats** serving different contexts:

#### Featured Card (hero carousel, "Happening Now" strip)
- **280px wide**, 16:9 cover image
- Prominent date badge (top-left): month abbreviation + day number on dark pill
- Category color stripe (left edge, 3px)
- Maturity badge (top-right)
- Occupancy status dot + label (bottom-left over image)
- Popularity tier badge if trending+ (animated border pulse)
- **Hover overlay**: gradient slides up with description, venue, time, dress code if set
- **Info bar** (below image):
  - Title (1 line, truncated, uppercase, 13px semibold)
  - Host avatar + name + time (10px secondary)
  - Price/FREE badge + RSVP count ("23 going")

#### Compact Card (browse strips, search results, grid views)
- **200px wide**, 4:3 cover image (slightly wider than Marketplace's 1:1 to give events a more cinematic feel while keeping density)
- Date badge (top-left, smaller)
- Category + maturity badges (top-right, stacked)
- **Hover overlay**: description + time + venue
- **Info bar**:
  - Title (1 line, truncated)
  - Host name + time
  - Occupancy dot + FREE/price

#### Card Interaction States
- **Resting**: Subtle border `border-subtle`, clean image
- **Hover**: Border strengthens, overlay slides up (300ms ease-out), slight image zoom (scale-105)
- **RSVP'd**: Small green/blue/yellow dot indicator on card (matching user's RSVP state)
- **Ghost Event** (in-progress but empty 15+ min): Card dims to 60% opacity, "No one here yet" overlay

### 6.2 Event Strips — Netflix Pattern

Adapted from Marketplace's `ListingStrip`:
- Section title (sm, bold, uppercase, tracking-widest) + scroll buttons
- Three scroll methods: overlay chevrons, edge-hover auto-scroll (4px/frame via rAF), thin scrollbar
- Renders Featured or Compact cards depending on strip context

**Strip types on landing page:**
1. "Happening Now" — Featured cards, animated pulse on strip header, only shows when live events exist
2. "Today's Events" — Compact cards, sorted by start time
3. "This Week" — Compact cards, next 7 days
4. "Popular Venues" — VenueCards (separate component)
5. "Recurring Favorites" — Compact cards for series events
6. Category-specific strips for categories with 3+ upcoming events

### 6.3 Date & Time Badges

**DateBadge** — compact calendar-style:
```
┌─────┐
│ MAR │  ← month abbreviation, 9px, uppercase, accent color
│  15 │  ← day number, 18px, bold
│ SAT │  ← day of week, 8px, tertiary (optional)
└─────┘
```
Dark pill background with subtle border. Positioned as overlay on card image.

**TimeBadge** — inline:
- "8:00 PM" (12h format) + "2h" (duration) + timezone abbreviation
- Compact: "8PM · 2h"
- Detail page: "Saturday, March 15 · 8:00 PM – 10:00 PM SLT"

**RecurrenceBadge** — pill with repeat icon:
- "Every Tuesday" / "Weekly" / "Monthly" / "Biweekly"
- Subtle, uses `bg-bg-item` with `border-border-subtle`

### 6.4 Popularity Tier Treatments

| Tier | Badge Text | Card Border Treatment |
|------|-----------|----------------------|
| `hidden-gem` | "Hidden Gem" | Standard `border-subtle` |
| `rising` | "Rising" | Standard |
| `popular` | "Popular" | `border-border` (slightly stronger) |
| `trending` | "Trending" | Accent border with subtle glow: `shadow-[0_0_8px_rgba(0,255,136,0.15)]` |
| `legendary` | "Legendary" | Gold border `#fbbf24` with animated pulse keyframe |

### 6.5 Occupancy Status Display

Shown on cards and detail pages for in-progress events:

| Status | Dot | Label | Color |
|--------|-----|-------|-------|
| Empty | ○ | "Empty" | `#6B7280` gray |
| Quiet | ◔ | "Quiet" | `#64748B` slate |
| Gathering | ◑ | "Gathering" | `#14B8A6` teal |
| Lively | ◕ | "Lively" | `#22C55E` green |
| Packed | ● | "Packed!" | `#F59E0B` amber |
| Full | 🚫 | "Full" | `#EF4444` red |

On cards: small dot + status word (compact).
On detail page: larger indicator + visitor count + trend arrow (rising/stable/declining).

### 6.6 RSVP Button Group

Three-option button group, styled like a segmented control:

```
[ Going ]  [ Interested ]  [ Maybe ]
```

- **Inactive**: `bg-bg-item`, `text-text-secondary`, `border-border-subtle`
- **Active Going**: `bg-rsvp-going/10`, `text-rsvp-going`, `border-rsvp-going/30`, filled check icon
- **Active Interested**: `bg-rsvp-interested/10`, `text-rsvp-interested`, filled star icon
- **Active Maybe**: `bg-rsvp-maybe/10`, `text-rsvp-maybe`, filled clock icon
- **Not logged in**: Clicking shows auth prompt overlay ("Sign in to RSVP")
- **At capacity**: "Going" button disabled, shows "Waitlist" option instead
- Click active button again to un-RSVP (toggle behavior)

### 6.7 Venue Card

Compact horizontal card for venue strips and venue references on event detail:
- Cover image (thumbnail, 80x80px rounded)
- Name (bold, 1 line)
- Category badge (small pill)
- Star rating (gold stars + count)
- Capacity indicator
- Amenity icons (voice, stream, etc. — small, inline)
- Link to venue detail page

### 6.8 Organizer Card

Used on event detail pages:
- Avatar (32px, deterministic color from hash — same pattern as Marketplace's `CreatorAvatar`)
- Name (bold, link to their events)
- Event count + reputation tier badge
- "Follow" button (local state for now)
- Co-hosts listed as smaller avatars beside main host

### 6.9 Attendee Preview

Social proof component on event detail:
- Stacked avatar circles (up to 5 visible) with `+N more` pill
- Each avatar has a colored ring matching their RSVP status (green=going, blue=interested, yellow=maybe)
- Click expands to full attendee list modal/section
- Anonymous users see count only, not avatars

### 6.10 Ticket / Price Display

- **Free**: Green "FREE" badge (prominent)
- **Paid**: Price display with currency, tier selector if multiple tiers
- **Sold Out**: Red "SOLD OUT" badge, muted card treatment
- **Limited**: Amber "Limited" badge when <10% capacity remaining

### 6.11 Share & Calendar Export

- **Share**: Copy link button (copies event URL to clipboard with toast confirmation)
- **Calendar**: Download .ics file button + "Add to Google Calendar" link
- Both positioned in event detail sidebar

---

## 7. Navigation

### 7.1 EventsNav (Sticky Top Bar)

Matches Marketplace's `MarketplaceNav` pattern:

```
┌────────────────────────────────────────────────────────────┐
│  ◆ Events    [🔍 Search events...  ⌘K ]    [👤 Sign In]  │
├────────────────────────────────────────────────────────────┤
│  All · Social · Music · Art · Education · ... │ Filters ▾ │
└────────────────────────────────────────────────────────────┘
```

- **Left**: poqpoq Events wordmark (links to landing)
- **Center**: Search input with Cmd/K keyboard shortcut, clear button on input
- **Right**: Auth state — "Sign In" button (anonymous) or UserMenu dropdown (logged in)
- **Below**: Category pills (horizontal scroll, color-coded, toggle behavior) + "Filters" dropdown

### 7.2 Filter Panel (dropdown or sidebar on explore page)

- **When**: Today / This Week / This Weekend / This Month / Custom date range
- **Price**: Free / Paid (toggle)
- **Maturity**: G / M / A buttons (M and A only visible when logged in)
- **Dress Code**: Multi-select dropdown (only on explore page, not nav)
- **Sort**: Soonest / Popular / Trending / Newest / Rating
- **Occupancy**: Show only active sims (toggle, default on)

### 7.3 Keyboard Shortcuts

- `Cmd/Ctrl + K`: Focus search
- `Escape`: Close search / clear filters / close modals
- Arrow keys: Navigate cards in grid (future enhancement)

---

## 8. Pages

### 8.1 Landing Page (`/events/`)

```
┌──────────────────────────────────────────────┐
│  [EventsNav — sticky]                        │
├──────────────────────────────────────────────┤
│  [FeaturedCarousel — 3-4 featured events]    │
│  Auto-rotate, dot indicators, pause on hover │
├──────────────────────────────────────────────┤
│  [CategoryBar — scrollable pills]            │
├──────────────────────────────────────────────┤
│                                              │
│  When search active:                         │
│    → SearchResults grid                      │
│                                              │
│  When browsing:                              │
│    → "Happening Now" strip (if live events)  │
│    → "Today's Events" strip                  │
│    → "This Week" strip                       │
│    → "Popular Venues" strip                  │
│    → "Recurring Favorites" strip             │
│    → Category-specific strips                │
│                                              │
├──────────────────────────────────────────────┤
│  [Footer — poqpoq ecosystem links]          │
└──────────────────────────────────────────────┘
```

### 8.2 Event Detail (`/events/[id]/`)

Two-column layout on desktop (content + 380px sidebar). Single column on mobile.

**Left Column (content):**
- Hero cover image (full-width, gradient overlay bottom, maturity badge top-right)
- Title (2xl, bold)
- Category badge + tags (pills)
- Description (rich text block)
- Attendee preview (stacked avatars + count)
- Comments section (if logged in)
- "More from this organizer" strip
- "Similar Events" strip (same category)
- "Upcoming in this series" strip (if recurring)

**Right Column (sidebar, sticky):**
- Date/Time card (DateBadge large + full datetime + recurrence badge)
- Venue card (image, name, rating, teleport button)
- Organizer card (avatar, name, reputation, follow)
- Occupancy status (if in-progress)
- Dress code (if set)
- Ticket/price info
- RSVP button group
- Share + Calendar export buttons

### 8.3 Venue Detail (`/events/venue/[id]/`)

- Hero cover image + gallery (thumbnail strip)
- Name, description, rating (stars + count)
- Location info + Teleport button (prominent, accent colored)
- Amenity badges (horizontal pills)
- Capacity indicator
- **"Upcoming Events"** — list of linked events sorted by date
- **"Past Events"** — collapsed section, expandable

### 8.4 Explore Page (`/events/explore/`)

Full search and discovery with view toggles.

- **Desktop**: Sidebar filters (sticky) + main content area
- **Mobile**: Filter drawer (slides up from bottom)
- **View Toggle**: Grid / List / Calendar
  - **Grid**: Compact cards in responsive `auto-fill` grid
  - **List**: Wider horizontal cards with more info visible
  - **Calendar**: Month grid with category-colored event dots, click day to see events

---

## 9. Calendar View

Month grid component for the explore page:

- Navigation: prev/next month arrows + month/year display
- Days grid: 7 columns (Mon-Sun)
- Event indicators: colored dots (category colors) on days with events, max 4 dots + "+N" overflow
- Today: accent ring highlight
- Click day: expands to show that day's events as mini-cards below the grid
- Mobile: vertical day list instead of grid

This is NOT a full calendar app — it's a visual timeline for event discovery. Keep it light.

---

## 10. Search & Filter Logic

Adapted from Marketplace's `useMarketplaceSearch` hook:

```typescript
interface EventSearchFilters {
  query: string;              // live input
  debouncedQuery: string;     // 150ms debounce
  categories: string[];       // multi-select from 13
  maturity: ("G"|"M"|"A")[];  // filtered by auth state
  dateRange: DateRange | null; // today | this-week | this-weekend | this-month | custom
  priceFilter: "all" | "free" | "paid";
  sortBy: "soonest" | "popular" | "trending" | "newest" | "rating";
  showActiveOnly: boolean;    // hide ghost events (default true)
}
```

**Relevance scoring** (when query is active):
- Title match: +5
- Venue name match: +3
- Organizer name match: +3
- Category match: +2
- Description match: +1
- Tag match: +1

**Default sort**: soonest (by start time, ascending, expired events filtered out).

**Maturity filtering**: Server-side enforced. Client never receives M/A events for anonymous users.

---

## 11. Auth Integration

Dual-mode, adapted from Marketplace's `AuthContext`:

**Standalone mode** (`poqpoq.com/events/`):
- Google OAuth via Google Identity Services
- Backend exchange at `https://poqpoq.com/voice-ninja/auth/google`
- Token + user stored in localStorage

**Iframe mode** (embedded in poqpoq World):
- Auth received via postMessage from parent (`AUTH_TOKEN` message)
- Stored in sessionStorage
- Acknowledges with `EVENTS_READY` message

**PostMessage Protocol** (World ↔ Events):
```typescript
// World → Events
type WorldToEvents =
  | { type: "AUTH_TOKEN"; payload: { token, userId, userName } }
  | { type: "OPEN_EVENT"; payload: { eventId } }
  | { type: "OPEN_VENUE"; payload: { venueId } }
  | { type: "MATURITY_SETTINGS"; payload: { showAdult: boolean } };

// Events → World
type EventsToWorld =
  | { type: "EVENTS_READY" }
  | { type: "TELEPORT_REQUEST"; payload: { regionName, coords } }
  | { type: "CLOSE_EVENTS" }
  | { type: "REQUEST_AUTH" };
```

---

## 12. Fake Data Strategy

For the discovery-first build, we seed rich fake data that demonstrates every feature:

### Events (60+)
- Span from "happening now" through 3 months out
- All 13 categories represented (minimum 3 per category)
- 5+ recurring series: Weekly DJ Night (music), Monthly Art Walk (art), Biweekly Coding Workshop (education), Daily Meditation Circle (ceremony), Weekend Quest Marathon (quest)
- Mix: 60% free, 40% paid (with 1-3 ticket tiers)
- 5 featured events
- Varied popularity tiers
- Some in-progress (for "Happening Now")
- 2-3 ghost events (in-progress but empty — to demonstrate the UX)
- Dress codes on ~30% of events
- Cover images: generated gradient cards with category icon overlays (no external image deps)

### Venues (15+)
- All venue categories represented
- Capacity range: 10 (intimate) to 500 (arena)
- Ratings: 3.2 to 4.9
- Amenity combinations
- Linked to events via venueId

### Organizers (10+)
- Varied reputation tiers
- Event counts from 2 (new) to 50+ (veteran)
- Linked to events and venues

### Auto-Enhancement
Follow Marketplace's `enhanceListings()` pattern:
- Tags auto-generated from title + description + synonym expansion
- Popularity tier computed from RSVP counts + view counts
- Occupancy status assigned to in-progress events
- Cover image gradients generated from category color + event ID hash

---

## 13. Performance & Accessibility

### Performance
- Static export — no server-side rendering needed
- Client-side filtering with useMemo (instant)
- Lazy-loaded images
- Debounced search (150ms)
- Skeleton loading states for all major components

### Accessibility
- Semantic HTML (button, nav, main, article, section)
- ARIA labels on interactive elements
- Keyboard navigation (Cmd+K, Escape, tab order)
- Color contrast meets WCAG AA against dark backgrounds
- Reduced motion respected via `prefers-reduced-motion`
- Screen reader support for occupancy status and popularity tiers

---

## 14. What's NOT in v1 (Intentionally Deferred)

- Event creation wizard (create flow — discovery-first build)
- Real API integration (fake data for now, API client stubbed)
- Event series grouping under season umbrellas
- Ticketing / payment flow
- Co-host permission management
- Event templates
- iCal sync (export only, no two-way sync)
- AI recommendations from Akashic profile
- Cross-instance events (parades, progressive parties)
- Event chat / persistent channels
- Promoted/paid event placement
- Analytics dashboard for hosts
- In-world kiosk integration
- Map-based discovery (requires World API integration)
- Notification system (data model only in architecture doc)

---

## 15. Success Criteria

1. Anonymous user can browse G events, filter by category and date, and click into event detail — all within 3 clicks
2. Logged-in user can browse all maturity tiers, RSVP to an event, and see their response reflected immediately
3. "Happening Now" strip surfaces live events with occupancy signals
4. Search returns relevant results with <150ms perceived latency
5. Calendar view shows events distributed across the month with category colors
6. Event detail page answers "what, when, where, who, how much" within 2 seconds of scanning
7. The app feels native to the poqpoq ecosystem — identical design language to Marketplace
8. `npm run build` produces a working static export
9. Responsive: functional at 375px, 768px, and 1280px

---

## 16. Competitive Positioning

| Feature | Second Life | Eventbrite | Lu.ma | Partiful | **poqpoq Events** |
|---------|------------|-----------|-------|----------|-------------------|
| Image-first cards | No | Yes | Yes | Yes | **Yes** (hybrid featured/compact) |
| Real-time occupancy | No | N/A | No | No | **Yes** (6-tier occupancy status) |
| Social proof (attendees) | No | Basic | Yes | **Best** | **Yes** (avatar stacks, RSVP rings) |
| In-world integration | Broken | N/A | N/A | N/A | **Native** (shelf panel, teleport) |
| Dress codes | No | No | No | No | **Yes** (13 codes, strict mode) |
| Host reputation | No | Basic | Basic | No | **Yes** (composite score, reliability) |
| Ghost event detection | No | N/A | No | No | **Yes** (auto-dim empty events) |
| Category color system | No | Yes | Yes | No | **Yes** (13 unique colors) |
| Calendar view | Bad | Basic | No | No | **Yes** (category-colored dots) |
| Akashic rewards | N/A | N/A | N/A | N/A | **Yes** (progression integration) |

---

---

## 17. In-World Shelf Panel Design (Hybrid Model)

The Events shelf panel lives in the World repo as a `IShelfPanel` implementation. It's a **hybrid**: compact live event browsing directly in the 300px panel, with full event detail opening the web app in a modal iframe overlay.

### Tech Stack
- Vanilla TypeScript (no React) — matches all other shelf panels
- DOM manipulation via `createElement` / `innerHTML`
- Scoped CSS injected via `<style id="events-panel-styles">`
- Uses `--shelf-*` CSS variables from `ShelfTheme.ts`
- Event delegation pattern for click handling
- Follows `IShelfPanel` contract: `activate()` / `deactivate()` / `dispose()`

### Panel Structure (300px wide)

```
┌──────────────────────────────┐
│ 🔍 Search events...          │  ← sticky search bar (8px padding)
├──────────────────────────────┤
│ [All] [Music] [Art] [Social] │  ← category pills (horizontal scroll)
├──────────────────────────────┤
│                              │
│  🔴 HAPPENING NOW            │  ← section header (accent pulse dot)
│  ┌────────────────────────┐  │
│  │ MAR  Jazz Night at...  │  │  ← compact event card
│  │  15  DJ Luna · ◕ Lively│  │     (left: date, right: title+meta)
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ MAR  Poetry Slam       │  │
│  │  15  The Gallery · ◑   │  │
│  └────────────────────────┘  │
│                              │
│  📅 TODAY                    │  ← section header
│  ┌────────────────────────┐  │
│  │ MAR  Build Workshop    │  │
│  │  15  7:00 PM · FREE    │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ MAR  Fashion Show      │  │
│  │  15  9:00 PM · $5      │  │
│  └────────────────────────┘  │
│                              │
│  📆 THIS WEEK               │
│  ...more cards...            │
│                              │
├──────────────────────────────┤
│ [🌐 Browse All Events]       │  ← hero button (opens iframe)
│ [➕ Create Event]             │  ← secondary button
└──────────────────────────────┘
```

### Compact Event Card (in-panel)

Horizontal layout to maximize info in 300px:

```css
.ev-card {
    display: grid;
    grid-template-columns: 42px 1fr;  /* date column + content */
    gap: 8px;
    padding: 8px 12px;
    background: var(--shelf-bg-item);
    border: 1px solid var(--shelf-border);
    border-radius: 6px;
    border-left: 3px solid transparent;  /* category color on hover */
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
}

.ev-card:hover {
    background: var(--shelf-bg-hover);
    border-left-color: var(--category-color);
}
```

- **Left column (42px)**: Month abbreviation (9px, uppercase, accent) + day number (16px, bold)
- **Right column**: Title (13px, semibold, 1 line truncated) + meta line (11px, secondary: host name, time, occupancy dot)
- **Category indicator**: Left border color matches event category on hover
- **Click action**: Opens full event detail in iframe overlay

### Section Headers

```css
.ev-section-header {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--shelf-text-secondary);
    padding: 12px 12px 4px;
    display: flex;
    align-items: center;
    gap: 6px;
}
```

"Happening Now" gets a breathing pulse dot animation (red/green):
```css
@keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}
.ev-live-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #22C55E;
    animation: pulse-dot 2s ease-in-out infinite;
}
```

### Category Pills (horizontal scroll)

```css
.ev-category-bar {
    display: flex;
    gap: 4px;
    padding: 6px 12px;
    overflow-x: auto;
    scrollbar-width: none;  /* hide scrollbar */
    border-bottom: 1px solid var(--shelf-border);
    flex-shrink: 0;
}

.ev-cat-pill {
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 10px;
    border: 1px solid var(--shelf-border);
    background: transparent;
    color: var(--shelf-text-secondary);
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.15s;
}

.ev-cat-pill.active {
    border-color: var(--category-color);
    color: var(--category-color);
    background: rgba(var(--category-color-rgb), 0.1);
}
```

### Hero Button (bottom of panel)

Same pattern as Marketplace panel — gradient background with accent border:
```css
.ev-hero-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: linear-gradient(135deg, #1a3d2a 0%, #0d2818 100%);
    border: 1px solid rgba(0, 255, 136, 0.25);
    border-radius: 8px;
    color: #b0f0d0;
    cursor: pointer;
    transition: all 0.2s ease;
}

.ev-hero-btn:hover {
    background: linear-gradient(135deg, #245038 0%, #163520 100%);
    border-color: rgba(0, 255, 136, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.15);
}
```

Clicking opens the full Events web app in a modal iframe overlay (same 90% width, max-1600px, z-10000 pattern as Marketplace).

### Iframe Modal Overlay

```css
.ev-iframe-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
}

.ev-iframe-container {
    width: 90%;
    max-width: 1600px;
    height: 90vh;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--shelf-border);
}

.ev-iframe-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    /* ... close button styles */
}
```

### Data Flow
- Panel fetches from the same NEXUS API endpoints as the web app
- Caches event list in memory during panel lifecycle
- Search filters client-side against cached data
- Occupancy signals via WebSocket (existing infrastructure)
- Clicking a card sends event ID to iframe via postMessage

### Notification Integration
- When events are `in_progress`, the Events banner in the shelf accordion gets a breathing glow on its label
- "Happening Now" section auto-updates via WebSocket occupancy feed
- RSVP'd events approaching start time trigger toast notifications

---

## 18. Design Research Summary

### Competitive Insights Applied

| Insight | Source | How We Apply It |
|---------|--------|-----------------|
| Social snowball (seeing friends drives attendance) | Partiful | Attendee avatar stacks on cards and detail pages |
| Temporal browsing (Today / This Week / This Month) | Eventbrite | Primary filter mode in both shelf panel and web app |
| Image-first cards | Lu.ma | Hybrid featured/compact card system |
| Themed event pages | Lu.ma | Category color system as visual differentiation |
| Discovery cold-start solved | All platforms fail here | Category strips + "Happening Now" give immediate value |
| In-world integration | SL fails completely | Shelf panel + teleport buttons + occupancy signals |
| Ghost event detection | SL's #1 problem | Auto-dim empty events after 15 min |
| No fee-to-post barrier | SL charges | Free tier access for event creation |

### What We're Explicitly Not Doing (Anti-Patterns)
- jQuery or legacy framework patterns (SL)
- External website disconnected from the world (SL)
- Flat text lists with no visual hierarchy (SL)
- Social features bolted on as afterthought (Eventbrite)
- Pagination for browsing (SL) — we use strips and infinite scroll
- Exposing system internals as user-facing labels (SL's "maturity rating" in raw form)

---

*Designed for 215 users today and 215,000 tomorrow.*
*Discovery-first. Social-proof-driven. In-world native.*
