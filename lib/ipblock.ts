import { headers } from "next/headers";
import { db } from "./db";

/*
 * Banned addresses. An IPv4 address is banned exactly. An IPv6 address is banned as its whole /64 block, because one
 * connection is given thousands of addresses in its block and can switch between them. The list is small, so it is kept
 * in memory for 30 seconds; a new ban is felt at once on the server that made it and within half a minute elsewhere.
 */

/** The key a ban is stored under: the IPv4 address, or the first 64 bits of an IPv6 address. Null when it is not an address. */
export function ipKey(ip: string): string | null {
  const v = ip.trim().toLowerCase().replace(/^\[|\]$/g, "").split("%")[0];
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v)) return v.split(".").every((n) => Number(n) <= 255) ? v : null;
  if (!v.includes(":") || !/^[0-9a-f:.]+$/.test(v)) return null;
  const mapped = v.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/); // an IPv4 address written the IPv6 way
  if (mapped) return mapped[1];
  const [head, tail = ""] = v.split("::");
  const a = head ? head.split(":") : [];
  const b = tail ? tail.split(":") : [];
  if (v.includes("::") ? a.length + b.length > 7 : a.length !== 8) return null;
  const full = v.includes("::") ? [...a, ...Array(8 - a.length - b.length).fill("0"), ...b] : a;
  if (full.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return `${full.slice(0, 4).map((g) => g.padStart(4, "0")).join(":")}::/64`;
}
export const isV6 = (key: string) => key.endsWith("::/64");

export type Banned = { key: string; ip: string; reason: string; by: string; at: string };
let cache: { at: number; keys: Set<string> } | null = null;

async function keys(): Promise<Set<string>> {
  if (cache && Date.now() - cache.at < 30_000) return cache.keys;
  try {
    const { rows } = await db.query<{ key: string }>("select key from blocked_ips");
    cache = { at: Date.now(), keys: new Set(rows.map((r) => r.key)) };
  } catch {
    cache = { at: Date.now(), keys: cache?.keys ?? new Set() }; // if the database is down, bans are not what stops the site
  }
  return cache.keys;
}

export async function isBanned(ip: string): Promise<boolean> {
  const key = ipKey(ip);
  return key ? (await keys()).has(key) : false;
}
/** For API routes: true when the request comes from a banned address. */
export const requestBanned = (request: Request) => isBanned(request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip") ?? "");
/** For pages and server actions. */
export async function currentIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",").at(-1)?.trim() ?? "";
}

export async function listBanned(): Promise<Banned[]> {
  const { rows } = await db.query<{ key: string; ip: string; reason: string; by: string; at: Date }>("select key, ip, reason, by, at from blocked_ips order by at desc");
  return rows.map((r) => ({ ...r, at: new Date(r.at).toISOString() }));
}
export async function banIp(ip: string, reason: string, by: string): Promise<string | null> {
  const key = ipKey(ip);
  if (!key) return null;
  await db.query("insert into blocked_ips (key, ip, reason, by) values ($1, $2, $3, $4) on conflict (key) do update set reason = excluded.reason, by = excluded.by, at = now()", [key, ip.slice(0, 64), reason.slice(0, 200), by.slice(0, 120)]);
  cache = null;
  return key;
}
export async function unbanIp(key: string): Promise<void> {
  await db.query("delete from blocked_ips where key = $1", [key.slice(0, 64)]);
  cache = null;
}
