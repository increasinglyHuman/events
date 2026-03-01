import pg from "pg";

/**
 * Database connection pool for poqpoq Events API.
 * Connects to the shared bbworlds_nexus PostgreSQL database.
 *
 * Supports both DATABASE_URL (connection string) and individual
 * DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD env vars
 * (matching the NEXUS server pattern for systemd deployment).
 */
const poolConfig: pg.PoolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "bbworlds_nexus",
      user: process.env.DB_USER || "nexus_user",
      password: process.env.DB_PASSWORD || "",
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    };

const pool = new pg.Pool({
  ...poolConfig,
  min: 2,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err.message);
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const ms = Date.now() - start;
    if (ms > 100) {
      console.warn(`[DB] Slow query (${ms}ms): ${text.slice(0, 80)}...`);
    }
    return result;
  } catch (err) {
    console.error("[DB] Query error:", (err as Error).message, "\nQuery:", text.slice(0, 200));
    throw err;
  }
}

export async function getOne<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T | null> {
  const result = await query(text, params);
  return (result.rows[0] as T) ?? null;
}

export async function getMany<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await query(text, params);
  return result.rows as T[];
}

export async function testConnection(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export { pool };
