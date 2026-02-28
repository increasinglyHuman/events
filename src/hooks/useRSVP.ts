"use client";

import { useState, useCallback, useEffect } from "react";
import type { RSVPStatus } from "@/types/social";

const STORAGE_KEY = "poqpoq-events-rsvps";

type RSVPMap = Record<string, RSVPStatus>;

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
      persist({ ...rsvps, [eventId]: status });
    },
    [rsvps, persist]
  );

  const toggleRSVP = useCallback(
    (eventId: string, status: RSVPStatus) => {
      const current = rsvps[eventId];
      if (current === status) {
        const next = { ...rsvps };
        delete next[eventId];
        persist(next);
      } else {
        persist({ ...rsvps, [eventId]: status });
      }
    },
    [rsvps, persist]
  );

  const getRSVP = useCallback(
    (eventId: string): RSVPStatus | null => rsvps[eventId] ?? null,
    [rsvps]
  );

  return { rsvps, setRSVP, toggleRSVP, getRSVP };
}
