import { Router } from "express";
import { query, getOne, getMany } from "../db.js";
import { requireAuth, optionalAuth } from "../auth.js";
import { mapVenueRow } from "../utils/queries.js";
import { isUUID } from "../utils/validate.js";

const router = Router();

/** GET /api/venues — List all venues */
router.get("/", async (_req, res) => {
  try {
    const rows = await getMany(
      `SELECT * FROM venues WHERE is_active = TRUE ORDER BY rating DESC, name ASC LIMIT 50`
    );
    res.json(rows.map(mapVenueRow));
  } catch (err) {
    console.error("[venues] list error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/venues/:id — Single venue */
router.get("/:id", async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  try {
    const row = await getOne(`SELECT * FROM venues WHERE id = $1`, [req.params.id]);
    if (!row) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json(mapVenueRow(row));
  } catch (err) {
    console.error("[venues] get error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** POST /api/venues — Create venue */
router.post("/", requireAuth, async (req, res) => {
  const userId = req.user!.user_id;
  const b = req.body;

  if (!b.name) {
    res.status(400).json({ error: "missing_fields", message: "name is required" });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO venues (
        owner_id, name, description, category,
        location, capacity,
        cover_image_url, gallery_urls,
        tags, amenities
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId, b.name, b.description || "", b.category || "other",
        JSON.stringify(b.location || {}), b.capacity || null,
        b.coverImage || null, b.gallery || [],
        b.tags || [], b.amenities || [],
      ]
    );
    res.status(201).json(mapVenueRow(result.rows[0]));
  } catch (err) {
    console.error("[venues] create error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
