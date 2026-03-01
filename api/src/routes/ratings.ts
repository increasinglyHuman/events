import { Router } from "express";
import { query, getMany } from "../db.js";
import { requireAuth } from "../auth.js";
import { isUUID } from "../utils/validate.js";

const router = Router();

/** POST /api/events/:id/rate — Rate a completed event */
router.post("/:id/rate", requireAuth, async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const userId = req.user!.user_id;
  const { rating, reviewText, ratingAtmosphere, ratingHost, ratingContent } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: "invalid_rating", message: "Rating must be 1-5" });
    return;
  }

  try {
    await query(
      `INSERT INTO event_ratings (event_id, user_id, rating, review_text, rating_atmosphere, rating_host, rating_content)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (event_id, user_id) DO UPDATE SET
         rating = $3, review_text = $4,
         rating_atmosphere = $5, rating_host = $6, rating_content = $7,
         updated_at = NOW()`,
      [req.params.id, userId, rating, reviewText || null, ratingAtmosphere || null, ratingHost || null, ratingContent || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("[ratings] create error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/events/:id/ratings — Public ratings list */
router.get("/:id/ratings", async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  try {
    const rows = await getMany(
      `SELECT r.rating, r.review_text, r.rating_atmosphere, r.rating_host, r.rating_content,
              r.created_at, u.username AS user_name, u.metadata->>'avatar_url' AS avatar
       FROM event_ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.event_id = $1 AND r.is_visible = TRUE
       ORDER BY r.created_at DESC
       LIMIT 50`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("[ratings] list error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
