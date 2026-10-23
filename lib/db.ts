import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Client, Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { istIso } from "./time";

/*
 * The PostgreSQL connection.
 * The tables are defined in db/schema.sql and created with `npm run db:schema`.
 */

/** Anything that can run a query: the pool, or one client inside a transaction. */
export type Queryer = {
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
};

/*
 * Where the connection comes from. On Cloudflare Workers it is the HYPERDRIVE binding (Cloudflare's pooled, accelerated
 * route to the database), and every query or transaction opens its own short connection, because a Worker may not keep a
 * connection open from one request to the next. Anywhere else (a laptop, a server) it is DATABASE_URL with one shared pool.
 */
function hyperdriveUrl(): string | null {
  try {
    return (getCloudflareContext().env as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE?.connectionString ?? null;
  } catch {
    return null; // not running on Workers
  }
}

const globalForDb = globalThis as unknown as { pool?: Pool };

function sharedPool(): Pool {
  if (globalForDb.pool) return globalForDb.pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set. See .env.example.");
  // kept on globalThis so a development hot reload does not open a new pool each time
  return (globalForDb.pool = new Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 }));
}

export const db: Queryer = {
  async query(text, params) {
    const url = hyperdriveUrl();
    if (!url) return sharedPool().query(text, params);
    const client = new Client({ connectionString: url });
    await client.connect();
    try {
      return await client.query(text, params);
    } finally {
      await client.end().catch(() => undefined);
    }
  },
};

/** Runs `fn` in one transaction: committed when it returns, rolled back when it throws. */
export async function transaction<T>(fn: (client: Queryer) => Promise<T>): Promise<T> {
  const url = hyperdriveUrl();
  const single = url ? new Client({ connectionString: url }) : null;
  const pooled = single ? null : await sharedPool().connect();
  const client = (single ?? pooled) as Client | PoolClient;
  if (single) await single.connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    if (single) await single.end().catch(() => undefined);
    else pooled?.release();
  }
}

/** Postgres error code 23505: a unique column already holds that value. */
export const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === "23505";

/** Ids are uuids. Checking first means a malformed id is "not found" instead of a database error. */
export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/** A stored time as the IST text the site uses everywhere. */
export const iso = (value: Date | string): string => istIso(new Date(value).getTime());
export const isoOrUndefined = (value: Date | string | null | undefined): string | undefined => (value ? iso(value) : undefined);
