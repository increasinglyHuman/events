import { Router } from "express";
import { getMany } from "../db.js";
import { requireAuth } from "../auth.js";
import { mapEventRow } from "../utils/queries.js";

const router = Router();

/** GET /api/user/events — All events created by the authenticated user (including drafts, cancelled) */
router.get("/events", requireAuth, async (req, res) => {
  const userId = req.user!.user_id;
  try {
    const rows = await getMany(
      `SELECT * FROM events
       WHERE creator_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId]
    );
    res.json(rows.map(mapEventRow));
  } catch (err) {
    console.error("[user] my events error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/user/rsvps — Events the authenticated user has RSVPed to */
router.get("/rsvps", requireAuth, async (req, res) => {
  const userId = req.user!.user_id;
  try {
    const rows = await getMany(
      `SELECT e.*, r.rsvp_status
       FROM event_rsvps r
       JOIN events e ON e.id = r.event_id
       WHERE r.user_id = $1 AND e.status != 'cancelled'
       ORDER BY e.starts_at ASC
       LIMIT 100`,
      [userId]
    );
    res.json(rows.map((row) => ({
      rsvpStatus: (row as Record<string, unknown>).rsvp_status,
      event: mapEventRow(row as Record<string, unknown>),
    })));
  } catch (err) {
    console.error("[user] my rsvps error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
