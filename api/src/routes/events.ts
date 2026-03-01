import { Router } from "express";
import { query, getOne, getMany } from "../db.js";
import { optionalAuth, requireAuth } from "../auth.js";
import { mapEventRow } from "../utils/queries.js";
import {
  isUUID, clamp, parseIntOr,
  validateCategories, validateMaturity, validateSort, validateOrder,
} from "../utils/validate.js";

const router = Router();

/** GET /api/events — Browse with filters */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const categories = validateCategories(req.query.category);
    const maturity = validateMaturity(req.query.maturity);
    const sort = validateSort(req.query.sort);
    const order = validateOrder(req.query.order);
    const limit = clamp(parseIntOr(req.query.limit, 20), 1, 50);
    const offset = parseIntOr(req.query.offset, 0);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const isFree = req.query.is_free === "true";
    const startsAfter = typeof req.query.starts_after === "string" ? req.query.starts_after : null;
    const startsBefore = typeof req.query.starts_before === "string" ? req.query.starts_before : null;

    const conditions: string[] = ["e.status IN ('published', 'in_progress')"];
    const params: unknown[] = [];
    let paramIdx = 0;

    if (categories.length > 0) {
      paramIdx++;
      conditions.push(`e.category = ANY($${paramIdx})`);
      params.push(categories);
    }

    if (maturity.length > 0) {
      paramIdx++;
      conditions.push(`e.maturity_rating = ANY($${paramIdx})`);
      params.push(maturity);
    }

    if (search) {
      paramIdx++;
      conditions.push(`to_tsvector('english', COALESCE(e.title,'') || ' ' || COALESCE(e.description,'')) @@ plainto_tsquery('english', $${paramIdx})`);
      params.push(search);
    }

    if (isFree) {
      conditions.push("e.entry_fee = 0");
    }

    if (startsAfter) {
      paramIdx++;
      conditions.push(`e.starts_at >= $${paramIdx}`);
      params.push(startsAfter);
    }

    if (startsBefore) {
      paramIdx++;
      conditions.push(`e.starts_at <= $${paramIdx}`);
      params.push(startsBefore);
    }

    const where = conditions.join(" AND ");
    const sql = `
      SELECT e.* FROM events e
      WHERE ${where}
      ORDER BY e.${sort} ${order}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const rows = await getMany(sql, params);
    res.json(rows.map(mapEventRow));
  } catch (err) {
    console.error("[events] list error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/events/happening-now */
router.get("/happening-now", async (_req, res) => {
  try {
    const rows = await getMany(
      `SELECT * FROM events WHERE status = 'in_progress' ORDER BY traffic_score DESC, starts_at ASC LIMIT 20`
    );
    res.json(rows.map(mapEventRow));
  } catch (err) {
    console.error("[events] happening-now error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/events/featured */
router.get("/featured", async (_req, res) => {
  try {
    const rows = await getMany(
      `SELECT * FROM events WHERE featured = TRUE AND status IN ('published', 'in_progress') ORDER BY featured_at DESC NULLS LAST LIMIT 10`
    );
    res.json(rows.map(mapEventRow));
  } catch (err) {
    console.error("[events] featured error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/events/upcoming */
router.get("/upcoming", async (_req, res) => {
  try {
    const rows = await getMany(
      `SELECT * FROM events WHERE status = 'published' AND starts_at > NOW() ORDER BY starts_at ASC LIMIT 50`
    );
    res.json(rows.map(mapEventRow));
  } catch (err) {
    console.error("[events] upcoming error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/events/by-organizer/:id */
router.get("/by-organizer/:id", async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  try {
    const rows = await getMany(
      `SELECT * FROM events WHERE creator_id = $1 AND status IN ('published', 'in_progress', 'completed') ORDER BY starts_at DESC LIMIT 50`,
      [req.params.id]
    );
    res.json(rows.map(mapEventRow));
  } catch (err) {
    console.error("[events] by-organizer error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/events/by-venue/:id */
router.get("/by-venue/:id", async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  try {
    const rows = await getMany(
      `SELECT * FROM events WHERE venue_id = $1 AND status IN ('published', 'in_progress', 'completed') ORDER BY starts_at ASC LIMIT 50`,
      [req.params.id]
    );
    res.json(rows.map(mapEventRow));
  } catch (err) {
    console.error("[events] by-venue error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/events/by-series/:id */
router.get("/by-series/:id", async (req, res) => {
  const seriesId = req.params.id;
  try {
    const rows = await getMany(
      `SELECT * FROM events WHERE series_id = $1 AND status IN ('published', 'in_progress') ORDER BY starts_at ASC LIMIT 50`,
      [seriesId]
    );
    res.json(rows.map(mapEventRow));
  } catch (err) {
    console.error("[events] by-series error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** GET /api/events/:id — Single event detail */
router.get("/:id", optionalAuth, async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  try {
    // Increment view count
    await query(`UPDATE events SET view_count = view_count + 1 WHERE id = $1`, [req.params.id]);

    const row = await getOne(`SELECT * FROM events WHERE id = $1`, [req.params.id]);
    if (!row) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json(mapEventRow(row));
  } catch (err) {
    console.error("[events] get error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** POST /api/events — Create event */
router.post("/", requireAuth, async (req, res) => {
  const userId = req.user!.user_id;
  const b = req.body;

  if (!b.title || !b.description || !b.category || !b.startsAt || !b.endsAt) {
    res.status(400).json({ error: "missing_fields", message: "title, description, category, startsAt, endsAt required" });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO events (
        creator_id, title, description, short_description, category,
        tags, dress_code, dress_code_details,
        maturity_rating, starts_at, ends_at, timezone,
        is_recurring, recurrence_rule, series_id,
        max_attendees, entry_fee, tickets,
        cover_image_url, gallery_urls,
        region_name, location_coords, teleport_url, external_url,
        venue_id, host_display_name, host_avatar_url,
        status
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15,
        $16, $17, $18,
        $19, $20,
        $21, $22, $23, $24,
        $25, $26, $27,
        $28
      ) RETURNING *`,
      [
        userId, b.title, b.description, b.summary || null, b.category,
        b.tags || [], b.dressCode || "none", b.dressCodeDetails || null,
        b.maturity || "G", b.startsAt, b.endsAt, b.timezone || "UTC",
        b.recurrence ? true : false, b.recurrence || null, b.seriesId || null,
        b.capacity || null, b.entryFee || 0, JSON.stringify(b.tickets || []),
        b.coverImage || null, b.gallery || [],
        b.location?.regionName || null, b.location?.coordinates || null,
        b.location?.teleportUrl || null, b.externalUrl || null,
        b.venueId || null, b.organizerName || req.user!.username || "", b.organizerAvatar || null,
        b.status || "draft",
      ]
    );
    res.status(201).json(mapEventRow(result.rows[0]));
  } catch (err) {
    console.error("[events] create error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** PUT /api/events/:id — Update own event */
router.put("/:id", requireAuth, async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const userId = req.user!.user_id;
  const existing = await getOne<{ creator_id: string }>(
    `SELECT creator_id FROM events WHERE id = $1`, [req.params.id]
  );

  if (!existing) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (existing.creator_id !== userId) {
    res.status(403).json({ error: "forbidden", message: "Not the event owner" });
    return;
  }

  const b = req.body;
  try {
    const result = await query(
      `UPDATE events SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        short_description = COALESCE($4, short_description),
        category = COALESCE($5, category),
        tags = COALESCE($6, tags),
        dress_code = COALESCE($7, dress_code),
        dress_code_details = COALESCE($8, dress_code_details),
        maturity_rating = COALESCE($9, maturity_rating),
        starts_at = COALESCE($10, starts_at),
        ends_at = COALESCE($11, ends_at),
        max_attendees = COALESCE($12, max_attendees),
        entry_fee = COALESCE($13, entry_fee),
        cover_image_url = COALESCE($14, cover_image_url),
        region_name = COALESCE($15, region_name),
        external_url = COALESCE($16, external_url),
        status = COALESCE($17, status)
      WHERE id = $1 RETURNING *`,
      [
        req.params.id,
        b.title, b.description, b.summary, b.category,
        b.tags, b.dressCode, b.dressCodeDetails,
        b.maturity, b.startsAt, b.endsAt,
        b.capacity, b.entryFee, b.coverImage,
        b.location?.regionName, b.externalUrl, b.status,
      ]
    );
    res.json(mapEventRow(result.rows[0]));
  } catch (err) {
    console.error("[events] update error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

/** DELETE /api/events/:id — Cancel/soft-delete */
router.delete("/:id", requireAuth, async (req, res) => {
  if (!isUUID(req.params.id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const userId = req.user!.user_id;
  const existing = await getOne<{ creator_id: string }>(
    `SELECT creator_id FROM events WHERE id = $1`, [req.params.id]
  );

  if (!existing) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (existing.creator_id !== userId) {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  try {
    await query(
      `UPDATE events SET status = 'cancelled', cancelled_at = NOW() WHERE id = $1`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("[events] delete error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
