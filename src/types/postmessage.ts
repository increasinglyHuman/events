/**
 * postMessage Protocol — World ↔ Events iframe communication
 */

export type WorldToEvents =
  | {
      type: "AUTH_TOKEN";
      payload: { token: string; userId: string; userName: string };
    }
  | {
      type: "OPEN_EVENT";
      payload: { eventId: string };
    }
  | {
      type: "OPEN_VENUE";
      payload: { venueId: string };
    }
  | {
      type: "MATURITY_SETTINGS";
      payload: { showAdult: boolean };
    };

export type EventsToWorld =
  | { type: "EVENTS_READY" }
  | {
      type: "TELEPORT_REQUEST";
      payload: { regionName: string; coords?: { x: number; y: number; z: number } };
    }
  | { type: "CLOSE_EVENTS" }
  | { type: "REQUEST_AUTH" };

export type EventsMessage = WorldToEvents | EventsToWorld;

export const TRUSTED_ORIGIN = "https://poqpoq.com";

export function isWorldMessage(data: unknown): data is WorldToEvents {
  if (!data || typeof data !== "object" || !("type" in data)) return false;
  const msg = data as { type: string };
  return ["AUTH_TOKEN", "OPEN_EVENT", "OPEN_VENUE", "MATURITY_SETTINGS"].includes(
    msg.type
  );
}
