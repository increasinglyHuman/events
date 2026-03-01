import { Router } from "express";
import { testConnection } from "../db.js";

const router = Router();

router.get("/health", async (_req, res) => {
  const dbOk = await testConnection();
  res.json({
    status: dbOk ? "ok" : "degraded",
    database: dbOk ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

export default router;
