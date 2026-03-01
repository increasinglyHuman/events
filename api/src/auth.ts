import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * JWT Authentication middleware for poqpoq Events API.
 *
 * Validates HS256 tokens issued by the Voice Ninja auth service
 * (poqpoq.com/voice-ninja/auth/google). The JWT payload contains:
 *   { user_id: string, email?: string, exp: number, iat?: number }
 *
 * CRITICAL: JWT_SECRET must match the production auth service.
 * The live value is set in the systemd service file (events-api.service).
 */

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface AuthUser {
  user_id: string;
  username?: string;
  email?: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Extract user from JWT payload (handles both auth service payload formats) */
function parsePayload(payload: Record<string, unknown>): AuthUser {
  return {
    // Voice Ninja auth: { user_id } / NEXUS auth: { userId } / unified: { sub }
    user_id: String(payload.user_id ?? payload.userId ?? payload.sub ?? ""),
    username: (payload.username ?? payload.name) as string | undefined,
    email: payload.email as string | undefined,
  };
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

/** Attach user if token present, continue either way */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const raw = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    req.user = parsePayload(raw);
  } catch {
    // Invalid token — continue as anonymous
  }
  next();
}

/** Require valid JWT — 401 if missing/invalid */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "auth_required", message: "Authentication required" });
    return;
  }

  try {
    const raw = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    const user = parsePayload(raw);
    if (!user.user_id) {
      res.status(401).json({ error: "invalid_token", message: "Token missing user_id" });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "invalid_token", message: "Invalid or expired token" });
  }
}
