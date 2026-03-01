import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  min: 2,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
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
