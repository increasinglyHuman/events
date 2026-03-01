import { Router } from "express";
import { getOne, getMany } from "../db.js";
import { isUUID } from "../utils/validate.js";

const router = Router();

/** GET /api/organizers — List users who have created events */
router.get("/", async (_req, res) => {
  try {
    const rows = await getMany(`
      SELECT
        u.id, u.username AS name, u.metadata->>'avatar_url' AS avatar,
        u.metadata->>'bio' AS bio,
        COUNT(e.id) AS event_count,
        COUNT(e.id) FILTER (WHERE e.status = 'completed') AS completed_events,
        COUNT(e.id) FILTER (WHERE e.status = 'cancelled') AS cancelled_events,
        COALESCE(AVG(e.host_reputation_score), 0) AS rating,
        0 AS follower_count
      FROM users u
      JOIN events e ON e.creator_id = u.id
      WHERE e.status IN ('published', 'in_progress', 'completed')
      GROUP BY u.id, u.username, u.metadata
      ORDER BY COUNT(e.id) DESC
      LIMIT 50
    `);

    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name || "Anonymous",
      avatar: r.avatar || "",
      bio: r.bio || "",
      followerCount: Number(r.follower_count) || 0,
      eventCount: Number(r.event_count) || 0,
      rating: Number(r.rating) || 0,
      completedEvents: Number(r.completed_events) || 0,
      cancellationRate: Number(r.event_count) > 0
        ? Number(r.cancelled_events) / Number(r.event_count)
        : 0,
      avgAttendance: 0,
    })));
  } catch (err) {
    console.error("[organizers] list error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/organizers/:id — Single organizer profile */
router.get("/:id", async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  try {
    const row = await getOne(`
      SELECT
        u.id, u.username AS name, u.metadata->>'avatar_url' AS avatar,
        u.metadata->>'bio' AS bio,
        COUNT(e.id) AS event_count,
        COUNT(e.id) FILTER (WHERE e.status = 'completed') AS completed_events,
        COUNT(e.id) FILTER (WHERE e.status = 'cancelled') AS cancelled_events,
        COALESCE(AVG(e.host_reputation_score), 0) AS rating,
        0 AS follower_count
      FROM users u
      LEFT JOIN events e ON e.creator_id = u.id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.metadata
    `, [req.params.id]);

    if (!row) {
      res.status(404).json({ error: "not_found" });
      return;
    }

    res.json({
      id: row.id,
      name: row.name || "Anonymous",
      avatar: row.avatar || "",
      bio: row.bio || "",
      followerCount: Number(row.follower_count) || 0,
      eventCount: Number(row.event_count) || 0,
      rating: Number(row.rating) || 0,
      completedEvents: Number(row.completed_events) || 0,
      cancellationRate: Number(row.event_count) > 0
        ? Number(row.cancelled_events) / Number(row.event_count)
        : 0,
      avgAttendance: 0,
    });
  } catch (err) {
    console.error("[organizers] get error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
