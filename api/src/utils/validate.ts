const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(val: unknown): val is string {
  return typeof val === "string" && UUID_RE.test(val);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function parseIntOr(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) ? n : fallback;
}

const VALID_CATEGORIES = new Set([
  "social", "music", "art", "education", "roleplay",
  "quest", "ceremony", "commerce", "exploration",
  "performance", "community", "competition", "special",
]);

const VALID_MATURITY = new Set(["G", "PG", "R", "X"]);

const VALID_SORT = new Set([
  "starts_at", "traffic_score", "rsvp_count", "created_at",
]);

export function validateCategories(raw: unknown): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw.split(",").filter((c) => VALID_CATEGORIES.has(c.trim()));
}

export function validateMaturity(raw: unknown): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw.split(",").filter((m) => VALID_MATURITY.has(m.trim()));
}

export function validateSort(raw: unknown): string {
  if (typeof raw === "string" && VALID_SORT.has(raw)) return raw;
  return "starts_at";
}

export function validateOrder(raw: unknown): "ASC" | "DESC" {
  return raw === "desc" ? "DESC" : "ASC";
}
