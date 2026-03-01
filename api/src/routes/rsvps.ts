import { Router } from "express";
import { query, getMany } from "../db.js";
import { requireAuth, optionalAuth } from "../auth.js";
import { isUUID } from "../utils/validate.js";

const router = Router();

/** POST /api/events/:id/rsvp — Create or update RSVP */
router.post("/:id/rsvp", requireAuth, async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const userId = req.user!.user_id;
  const status = req.body.status;

  if (!["going", "interested", "maybe", "not_going"].includes(status)) {
    res.status(400).json({ error: "invalid_status", message: "Must be going, interested, maybe, or not_going" });
    return;
  }

  try {
    await query(
      `INSERT INTO event_rsvps (event_id, user_id, rsvp_status)
       VALUES ($1, $2, $3)
       ON CONFLICT (event_id, user_id) DO UPDATE SET
         rsvp_status = $3, updated_at = NOW()`,
      [req.params.id, userId, status]
    );
    res.json({ success: true, eventId: req.params.id, status });
  } catch (err) {
    console.error("[rsvps] create error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** DELETE /api/events/:id/rsvp — Remove RSVP */
router.delete("/:id/rsvp", requireAuth, async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const userId = req.user!.user_id;
  try {
    await query(
      `DELETE FROM event_rsvps WHERE event_id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("[rsvps] delete error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/events/:id/attendees — Public attendee list */
router.get("/:id/attendees", optionalAuth, async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  try {
    const rows = await getMany(
      `SELECT r.user_id, r.rsvp_status, r.created_at,
              u.username AS user_name, u.metadata->>'avatar_url' AS avatar
       FROM event_rsvps r
       JOIN users u ON u.id = r.user_id
       WHERE r.event_id = $1 AND r.rsvp_status IN ('going', 'interested')
       ORDER BY r.created_at ASC
       LIMIT 100`,
      [req.params.id]
    );

    res.json(rows.map((r) => ({
      userId: r.user_id,
      userName: r.user_name || "Anonymous",
      avatar: r.avatar || "",
      rsvpStatus: r.rsvp_status,
      isPublic: true,
    })));
  } catch (err) {
    console.error("[rsvps] attendees error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
