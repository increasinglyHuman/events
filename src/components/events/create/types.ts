import type { EventCategory, MaturityRating, DressCode, RecurrenceRule } from "@/types/events";

/* ─── Form Data ──────────────────────────────────────────── */

export interface CreateEventFormData {
  // Step 1: Basics
  title: string;
  description: string;
  category: EventCategory | "";
  tags: string[];

  // Step 2: Schedule
  startsAt: string;           // datetime-local value
  endsAt: string;
  timezone: string;
  recurrence: RecurrenceRule | null;

  // Step 3: Location
  venueId: string | null;
  location: {
    regionName: string;
    coordinates: { x: number; y: number; z: number } | null;
    teleportUrl: string;
  };
  externalUrl: string;

  // Step 4: Details
  maturity: MaturityRating;
  dressCode: DressCode;
  dressCodeDetails: string;
  capacity: number | null;
  entryFee: number;

  // Step 5: Media
  coverImage: string;
  gallery: string[];
}

export type FormStep = 1 | 2 | 3 | 4 | 5 | 6;

export type StepErrors = Record<string, string>;

/* ─── Defaults ───────────────────────────────────────────── */

/** Round a date up to the next 15-minute mark */
function roundUp15(d: Date): Date {
  const ms = 15 * 60_000;
  return new Date(Math.ceil(d.getTime() / ms) * ms);
}

/** Format Date as datetime-local string (YYYY-MM-DDTHH:MM) */
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Static defaults (safe for SSR — no Date() or browser APIs).
 * Dynamic values (dates, timezone) are set on client mount via applyDynamicDefaults().
 */
export function createDefaults(): CreateEventFormData {
  return {
    title: "",
    description: "",
    category: "",
    tags: [],

    startsAt: "",
    endsAt: "",
    timezone: "UTC",
    recurrence: null,

    venueId: null,
    location: { regionName: "", coordinates: null, teleportUrl: "" },
    externalUrl: "",

    maturity: "G",
    dressCode: "none",
    dressCodeDetails: "",
    capacity: null,
    entryFee: 0,

    coverImage: "",
    gallery: [],
  };
}

/** Apply dynamic defaults (dates, timezone) — call on client mount only */
export function applyDynamicDefaults(data: CreateEventFormData): CreateEventFormData {
  if (data.startsAt) return data; // already set

  const now = new Date();
  const start = roundUp15(new Date(now.getTime() + 60 * 60_000));
  const end = new Date(start.getTime() + 2 * 60 * 60_000);

  let tz = data.timezone;
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* */ }

  return { ...data, startsAt: toLocalInput(start), endsAt: toLocalInput(end), timezone: tz };
}

/* ─── Step Labels ────────────────────────────────────────── */

export const STEP_LABELS: Record<FormStep, string> = {
  1: "Basics",
  2: "Schedule",
  3: "Location",
  4: "Details",
  5: "Media",
  6: "Review",
};

/* ─── Validation ─────────────────────────────────────────── */

export function validateBasics(d: CreateEventFormData): StepErrors {
  const e: StepErrors = {};
  if (!d.title.trim()) e.title = "Title is required";
  else if (d.title.length > 200) e.title = "Title must be under 200 characters";
  if (!d.description.trim()) e.description = "Description is required";
  if (!d.category) e.category = "Pick a category";
  if (d.tags.length > 5) e.tags = "Maximum 5 tags";
  return e;
}

export function validateSchedule(d: CreateEventFormData): StepErrors {
  const e: StepErrors = {};
  if (!d.startsAt) e.startsAt = "Start date & time is required";
  if (!d.endsAt) e.endsAt = "End date & time is required";
  if (d.startsAt && d.endsAt && d.endsAt <= d.startsAt) {
    e.endsAt = "End time must be after start time";
  }
  return e;
}

// Steps 3-5: no required fields
export function validateStep(step: FormStep, data: CreateEventFormData): StepErrors {
  switch (step) {
    case 1: return validateBasics(data);
    case 2: return validateSchedule(data);
    default: return {};
  }
}

/* ─── Timezones ──────────────────────────────────────────── */

export const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "US Eastern" },
  { value: "America/Chicago", label: "US Central" },
  { value: "America/Denver", label: "US Mountain" },
  { value: "America/Los_Angeles", label: "US Pacific" },
  { value: "America/Anchorage", label: "US Alaska" },
  { value: "Pacific/Honolulu", label: "US Hawaii" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Central Europe" },
  { value: "Europe/Helsinki", label: "Eastern Europe" },
  { value: "Asia/Dubai", label: "Dubai / Gulf" },
  { value: "Asia/Kolkata", label: "India" },
  { value: "Asia/Shanghai", label: "China" },
  { value: "Asia/Tokyo", label: "Japan" },
  { value: "Australia/Sydney", label: "Australia Eastern" },
  { value: "Pacific/Auckland", label: "New Zealand" },
];
