"use client";

import { useState, useCallback, useEffect } from "react";
import type { RSVPStatus } from "@/types/social";
import { eventsApi } from "@/lib/events-api";

const STORAGE_KEY = "poqpoq-events-rsvps";

type RSVPMap = Record<string, RSVPStatus>;

function isAuthenticated(): boolean {
  try {
    return !!localStorage.getItem("auth_token");
  } catch {
    return false;
  }
}

export function useRSVP() {
  const [rsvps, setRsvps] = useState<RSVPMap>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRsvps(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: RSVPMap) => {
    setRsvps(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* private browsing */
    }
  }, []);

  const setRSVP = useCallback(
    (eventId: string, status: RSVPStatus) => {
      // Optimistic update
      persist({ ...rsvps, [eventId]: status });

      // Sync to API if authenticated
      if (isAuthenticated()) {
        eventsApi.rsvps.set(eventId, status).catch(() => {
          // Rollback on failure — restore previous state
          const prev = { ...rsvps };
          persist(prev);
        });
      }
    },
    [rsvps, persist]
  );

  const toggleRSVP = useCallback(
    (eventId: string, status: RSVPStatus) => {
      const current = rsvps[eventId];
      if (current === status) {
        // Remove RSVP
        const next = { ...rsvps };
        delete next[eventId];
        persist(next);

        if (isAuthenticated()) {
          eventsApi.rsvps.remove(eventId).catch(() => {
            persist({ ...rsvps });
          });
        }
      } else {
        setRSVP(eventId, status);
      }
    },
    [rsvps, persist, setRSVP]
  );

  const getRSVP = useCallback(
    (eventId: string): RSVPStatus | null => rsvps[eventId] ?? null,
    [rsvps]
  );

  return { rsvps, setRSVP, toggleRSVP, getRSVP };
}
