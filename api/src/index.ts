import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import healthRouter from "./routes/health.js";
import eventsRouter from "./routes/events.js";
import rsvpsRouter from "./routes/rsvps.js";
import venuesRouter from "./routes/venues.js";
import organizersRouter from "./routes/organizers.js";
import ratingsRouter from "./routes/ratings.js";
import userRouter from "./routes/user.js";

const PORT = parseInt(process.env.PORT || "3015", 10);

const app = express();

// Security headers
app.use(helmet());

// CORS — allow poqpoq.com and local dev
app.use(
  cors({
    origin: [
      "https://poqpoq.com",
      "https://www.poqpoq.com",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "100kb" }));

// Rate limiting
const readLimiter = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "rate_limited", message: "Too many requests, please try again later" },
});

const writeLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "rate_limited", message: "Too many write requests, please try again later" },
});

// Apply rate limits
app.use("/api", readLimiter);
app.use("/api/events", (req, _res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    return writeLimiter(req, _res, next);
  }
  next();
});

// Routes
app.use("/", healthRouter);
app.use("/api/events", eventsRouter);
app.use("/api/events", rsvpsRouter);
app.use("/api/events", ratingsRouter);
app.use("/api/venues", venuesRouter);
app.use("/api/organizers", organizersRouter);
app.use("/api/user", userRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "not_found", message: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`[events-api] Server running on port ${PORT}`);
  console.log(`[events-api] Health check: http://localhost:${PORT}/health`);
  console.log(`[events-api] API base:     http://localhost:${PORT}/api/`);
});
