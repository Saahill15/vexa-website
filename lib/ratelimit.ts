import { db } from "./db";

/*
 * Rate limits, kept in the database so every server (or Worker) that answers a visitor counts the same hits. If the
 * database cannot be reached the check falls back to a per-process count rather than failing the request.
 */

const memory = new Map<string, number[]>();

function inMemory(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    memory.set(key, recent);
    return true;
  }
  if (memory.size > 10_000) memory.clear();
  memory.set(key, [...recent, now]);
  return false;
}

/** Counts one hit for `key`. True when there have already been `max` hits in the last `windowMs`, so this one is refused. */
export async function tooMany(key: string, max: number, windowMs: number): Promise<boolean> {
  try {
    // one statement: the hit is recorded only if the key is still under its limit
    const added = await db.query(
      `insert into rate_hits (key) select $1 where (select count(*) from rate_hits where key = $1 and at > now() - make_interval(secs => $2)) < $3 returning 1`,
      [key.slice(0, 200), windowMs / 1000, max],
    );
    if (Math.random() < 0.02) await db.query("delete from rate_hits where at < now() - interval '1 day'").catch(() => undefined);
    return added.rowCount === 0;
  } catch {
    return inMemory(key, max, windowMs);
  }
}

export async function resetLimit(key: string): Promise<void> {
  memory.delete(key);
  await db.query("delete from rate_hits where key = $1", [key.slice(0, 200)]).catch(() => undefined);
}

/** True when `key` is already at its limit, without counting a hit. */
export async function peekLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  try {
    const r = await db.query<{ n: string }>("select count(*) as n from rate_hits where key = $1 and at > now() - make_interval(secs => $2)", [key.slice(0, 200), windowMs / 1000]);
    return Number(r.rows[0]?.n ?? 0) >= max;
  } catch {
    return (memory.get(key) ?? []).filter((t) => Date.now() - t < windowMs).length >= max;
  }
}
