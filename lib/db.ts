import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { istIso } from "./time";

/*
 * The PostgreSQL connection. One pool per server process, shared by every request. DATABASE_URL must be set.
 * The tables are defined in db/schema.sql and created with `npm run db:schema`.
 */

/** Anything that can run a query: the pool, or one client inside a transaction. */
export type Queryer = {
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
};

const globalForDb = globalThis as unknown as { pool?: Pool };

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set. See .env.example.");
  return new Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 });
}

// kept on globalThis so a development hot reload does not open a new pool each time
const pool = globalForDb.pool ?? (globalForDb.pool = createPool());

export const db: Queryer = {
  query: (text, params) => pool.query(text, params),
};

/** Runs `fn` in one transaction: committed when it returns, rolled back when it throws. */
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/** Postgres error code 23505: a unique column already holds that value. */
export const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === "23505";

/** Ids are uuids. Checking first means a malformed id is "not found" instead of a database error. */
export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/** A stored time as the IST text the site uses everywhere. */
export const iso = (value: Date | string): string => istIso(new Date(value).getTime());
export const isoOrUndefined = (value: Date | string | null | undefined): string | undefined => (value ? iso(value) : undefined);
