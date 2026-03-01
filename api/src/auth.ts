import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

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
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = payload;
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
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "invalid_token", message: "Invalid or expired token" });
  }
}
