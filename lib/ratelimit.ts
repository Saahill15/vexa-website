/** A light in-memory limiter: `max` hits per `windowMs` for a key. Resets when the server restarts. */
const hits = new Map<string, number[]>();

export function tooMany(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  if (hits.size > 10_000) hits.clear();
  hits.set(key, [...recent, now]);
  return false;
}

export function resetLimit(key: string) {
  hits.delete(key);
}
