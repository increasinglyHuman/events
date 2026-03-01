"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Calendar, Users, Star, CheckCircle, Loader2, LayoutDashboard, Clock, Edit, Send, Ban, Trash2, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { EventsNav } from "@/components/events/EventsNav";
import { eventsApi } from "@/lib/events-api";
import { CATEGORY_META, type CalendarEvent, type EventCategory, type EventStatus } from "@/types/events";
import type { OrganizerProfile } from "@/types/social";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ─── Status config ────────────────────────────────────────── */

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft:       { label: "Draft",       color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/30" },
  published:   { label: "Published",   color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  in_progress: { label: "Live Now",    color: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/30" },
  completed:   { label: "Completed",   color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/30" },
  cancelled:   { label: "Cancelled",   color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/30" },
};

const RSVP_META: Record<string, { label: string; color: string }> = {
  going:      { label: "Going",      color: "text-emerald-400" },
  interested: { label: "Interested", color: "text-sky-400" },
  maybe:      { label: "Maybe",      color: "text-amber-400" },
};

type Tab = "events" | "attending";

/* ─── Helpers ──────────────────────────────────────────────── */

function formatDate(dt: string): string {
  if (!dt) return "";
  try {
    return new Date(dt).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return dt; }
}

function formatDateTime(dt: string): string {
  if (!dt) return "";
  try {
    return new Date(dt).toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch { return dt; }
}

function groupByStatus(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const groups: Record<string, CalendarEvent[]> = {};
  for (const e of events) {
    const s = e.status || "draft";
    if (!groups[s]) groups[s] = [];
    groups[s].push(e);
  }
  return groups;
}

/* ─── Status order for display ─────────────────────────────── */
const STATUS_ORDER: EventStatus[] = ["in_progress", "published", "draft", "completed", "cancelled"];

/* ─── Page ─────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [navQuery, setNavQuery] = useState("");

  const [tab, setTab] = useState<Tab>("events");
  const [myEvents, setMyEvents] = useState<CalendarEvent[]>([]);
  const [myRsvps, setMyRsvps] = useState<{ rsvpStatus: string; event: CalendarEvent }[]>([]);
  const [stats, setStats] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  function handleSearch(q: string) {
    if (q) router.push(`/?q=${encodeURIComponent(q)}`);
    else setNavQuery("");
  }

  // Fetch dashboard data once authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [events, rsvps, profile] = await Promise.all([
          eventsApi.user.myEvents(),
          eventsApi.user.myRsvps(),
          eventsApi.organizers.get(user!.id).catch(() => undefined),
        ]);
        if (cancelled) return;
        setMyEvents(events);
        setMyRsvps(rsvps);
        setStats(profile ?? null);
      } catch (err) {
        console.error("[dashboard] load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, user]);

  // Computed stats
  const totalEvents = myEvents.length;
  const upcomingCount = myEvents.filter((e) => e.status === "published").length;
  const completedCount = myEvents.filter((e) => e.status === "completed").length;
  const avgRating = stats?.rating ?? 0;

  const grouped = groupByStatus(myEvents);

  return (
    <div className="min-h-screen flex flex-col">
      <EventsNav query={navQuery} onQueryChange={handleSearch} />

      <main className="flex-1 max-w-[900px] mx-auto w-full px-4 py-8">
        {authLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-16 bg-surface-1 rounded-lg" />
            <div className="h-24 bg-surface-1 rounded-lg" />
            <div className="h-40 bg-surface-1 rounded-lg" />
          </div>
        ) : !isAuthenticated ? (
          /* Auth gate */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-accent/10 p-4 mb-6">
              <LogIn className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Sign in to Your Dashboard
            </h1>
            <p className="text-sm text-text-secondary max-w-md mb-8">
              View your events, manage RSVPs, and track your organizer stats.
              Sign in with your Google account to get started.
            </p>
            <SignInButton />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile header */}
            <div className="flex items-center gap-4">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-14 w-14 rounded-full border-2 border-accent/30"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-surface-1 border-2 border-accent/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-text-muted" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-text-primary">{user?.name}</h1>
                {user?.email && (
                  <p className="text-sm text-text-secondary">{user.email}</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Calendar} label="Events" value={totalEvents} />
              <StatCard icon={Clock} label="Upcoming" value={upcomingCount} />
              <StatCard icon={CheckCircle} label="Completed" value={completedCount} />
              <StatCard icon={Star} label="Rating" value={avgRating > 0 ? avgRating.toFixed(1) : "—"} />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border/20 pb-px">
              <TabButton active={tab === "events"} onClick={() => setTab("events")}>
                <LayoutDashboard className="h-3.5 w-3.5" />
                My Events
                {myEvents.length > 0 && (
                  <span className="text-[10px] bg-surface-1 rounded-full px-1.5 py-0.5">{myEvents.length}</span>
                )}
              </TabButton>
              <TabButton active={tab === "attending"} onClick={() => setTab("attending")}>
                <Users className="h-3.5 w-3.5" />
                Attending
                {myRsvps.length > 0 && (
                  <span className="text-[10px] bg-surface-1 rounded-full px-1.5 py-0.5">{myRsvps.length}</span>
                )}
              </TabButton>
            </div>

            {/* Tab content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
              </div>
            ) : tab === "events" ? (
              <MyEventsTab grouped={grouped} router={router} />
            ) : (
              <AttendingTab rsvps={myRsvps} router={router} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Stat Card ────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-border/20 rounded-lg p-3 bg-surface-0/50">
      <div className="flex items-center gap-2 text-text-secondary mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-text-primary">{value}</p>
    </div>
  );
}

/* ─── Tab Button ───────────────────────────────────────────── */

function TabButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
        active
          ? "border-accent text-accent"
          : "border-transparent text-text-secondary hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}

/* ─── My Events Tab ────────────────────────────────────────── */

function MyEventsTab({ grouped, router }: {
  grouped: Record<string, CalendarEvent[]>;
  router: ReturnType<typeof useRouter>;
}) {
  const hasEvents = Object.keys(grouped).length > 0;

  if (!hasEvents) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <h3 className="text-base font-semibold text-text-primary mb-1">No events yet</h3>
        <p className="text-sm text-text-secondary mb-4">Create your first event to get started.</p>
        <Button
          onClick={() => router.push("/create")}
          className="bg-accent text-bg-deep hover:bg-accent/90 font-semibold"
        >
          Create Event
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {STATUS_ORDER.map((status) => {
        const events = grouped[status];
        if (!events?.length) return null;
        const meta = STATUS_META[status];

        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border",
                meta.color, meta.bg, meta.border,
              )}>
                {status === "in_progress" && (
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400" />
                  </span>
                )}
                {meta.label}
              </span>
              <span className="text-[11px] text-text-muted">{events.length}</span>
            </div>

            <div className="space-y-2">
              {events.map((event) => (
                <EventRow key={event.id} event={event} router={router} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Event Row ────────────────────────────────────────────── */

function EventRow({ event, router }: {
  event: CalendarEvent;
  router: ReturnType<typeof useRouter>;
}) {
  const catMeta = event.category ? CATEGORY_META[event.category as EventCategory] : null;

  return (
    <div
      className="flex items-center gap-3 border border-border/20 rounded-lg p-3 bg-surface-0/30 hover:bg-surface-0/60 transition-colors cursor-pointer"
      onClick={() => router.push(`/${event.id}`)}
    >
      {/* Thumbnail */}
      {event.coverImage ? (
        <img
          src={event.coverImage}
          alt=""
          className="h-12 w-12 rounded-md object-cover shrink-0 border border-border/20"
        />
      ) : (
        <div className="h-12 w-12 rounded-md bg-surface-1 flex items-center justify-center shrink-0">
          <Calendar className="h-5 w-5 text-text-muted" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-text-primary truncate">
            {event.title || "Untitled"}
          </h4>
          {catMeta && (
            <span
              className="shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium border"
              style={{ color: catMeta.color, backgroundColor: `${catMeta.color}15`, borderColor: `${catMeta.color}44` }}
            >
              {catMeta.label.split(" ")[0]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-0.5">
          <span>{formatDateTime(event.startTime)}</span>
          {event.attendeeCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event.attendeeCount}
            </span>
          )}
          {event.viewCount > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {event.viewCount}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        {(event.status === "draft" || event.status === "published") && (
          <button
            type="button"
            onClick={() => router.push(`/${event.id}`)}
            className="h-7 w-7 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-1 transition-colors"
            title="View"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Attending Tab ────────────────────────────────────────── */

function AttendingTab({ rsvps, router }: {
  rsvps: { rsvpStatus: string; event: CalendarEvent }[];
  router: ReturnType<typeof useRouter>;
}) {
  if (rsvps.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <h3 className="text-base font-semibold text-text-primary mb-1">No RSVPs yet</h3>
        <p className="text-sm text-text-secondary mb-4">Browse events and RSVP to ones that interest you.</p>
        <Button
          onClick={() => router.push("/")}
          className="bg-accent text-bg-deep hover:bg-accent/90 font-semibold"
        >
          Browse Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rsvps.map(({ rsvpStatus, event }) => {
        const rMeta = RSVP_META[rsvpStatus] ?? { label: rsvpStatus, color: "text-text-secondary" };
        const catMeta = event.category ? CATEGORY_META[event.category as EventCategory] : null;

        return (
          <div
            key={event.id}
            className="flex items-center gap-3 border border-border/20 rounded-lg p-3 bg-surface-0/30 hover:bg-surface-0/60 transition-colors cursor-pointer"
            onClick={() => router.push(`/${event.id}`)}
          >
            {/* Thumbnail */}
            {event.coverImage ? (
              <img
                src={event.coverImage}
                alt=""
                className="h-12 w-12 rounded-md object-cover shrink-0 border border-border/20"
              />
            ) : (
              <div className="h-12 w-12 rounded-md bg-surface-1 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-text-muted" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-text-primary truncate">
                  {event.title}
                </h4>
                {catMeta && (
                  <span
                    className="shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium border"
                    style={{ color: catMeta.color, backgroundColor: `${catMeta.color}15`, borderColor: `${catMeta.color}44` }}
                  >
                    {catMeta.label.split(" ")[0]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-0.5">
                <span>{formatDateTime(event.startTime)}</span>
                {event.organizerName && (
                  <span>by {event.organizerName}</span>
                )}
              </div>
            </div>

            {/* RSVP badge */}
            <span className={cn(
              "text-[11px] font-semibold shrink-0",
              rMeta.color,
            )}>
              {rMeta.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
