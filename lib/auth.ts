import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { cookies } from "next/headers";
import path from "path";
import { cache } from "react";
import { dataDir } from "./store";
import { effectiveRole, getUserById, type Role } from "./users";

/*
 * Sessions are a signed cookie holding the account id, an expiry and the time it was issued. The account is looked
 * up on every request, so disabling someone, removing their admin role or resetting their password takes effect at once.
 */

export type Session = { id: string; name: string; email: string; role: Role };

const COOKIE = "vexa_session";
const MAX_AGE = 60 * 60 * 24 * 30;

let cachedSecret: Buffer | null = null;
function secret(): Buffer {
  if (cachedSecret) return cachedSecret;
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return (cachedSecret = Buffer.from(fromEnv));
  // no SESSION_SECRET set: make one once and keep it in the data folder, so sessions survive restarts
  const where = path.join(dataDir(), ".session-secret");
  if (!existsSync(where)) {
    mkdirSync(dataDir(), { recursive: true, mode: 0o700 });
    writeFileSync(where, randomBytes(48).toString("base64"), { mode: 0o600 });
    chmodSync(where, 0o600);
  }
  return (cachedSecret = Buffer.from(readFileSync(where, "utf8").trim()));
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function makeToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ u: userId, e: Math.floor(Date.now() / 1000) + MAX_AGE, i: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

type Claim = { u: string; i: number };

function readToken(token: string): Claim | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { u?: unknown; e?: unknown; i?: unknown };
    if (typeof data.u !== "string" || typeof data.e !== "number" || data.e <= Date.now() / 1000) return null;
    return { u: data.u, i: typeof data.i === "number" ? data.i : 0 };
  } catch {
    return null;
  }
}

export async function startSession(userId: string) {
  (await cookies()).set(COOKIE, makeToken(userId), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Who is signed in right now, or null. */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  const claim = token ? readToken(token) : null;
  if (!claim) return null;
  const user = await getUserById(claim.u);
  if (!user || user.disabled) return null;
  // sessions issued before the last password change (for example a reset) or a "sign out everywhere" stop working
  const cutoff = Math.max(user.passwordChangedAt ? Date.parse(user.passwordChangedAt) : 0, user.sessionsRevokedAt ? Date.parse(user.sessionsRevokedAt) : 0);
  if (claim.i < cutoff) return null;
  return { id: user.id, name: user.name, email: user.email, role: effectiveRole(user) };
});

/** For server actions and routes that change things: throws unless an admin is signed in. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Not allowed");
  return session;
}

/* A Google sign-in that matched an existing password account waits here until that account's password confirms the link. */
const LINK_COOKIE = "vexa_link";
export type PendingLink = { googleId: string; email: string; name: string };

export async function setPendingLink(link: PendingLink) {
  const payload = Buffer.from(JSON.stringify({ ...link, x: Date.now() + 15 * 60_000 })).toString("base64url");
  (await cookies()).set(LINK_COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 15 * 60 });
}

/** Reads and clears the pending link. Returns null if there is none, it expired, or it was tampered with. */
export async function takePendingLink(): Promise<PendingLink | null> {
  const jar = await cookies();
  const token = jar.get(LINK_COOKIE)?.value;
  jar.delete(LINK_COOKIE);
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as PendingLink & { x?: number };
    if (typeof data.x !== "number" || data.x < Date.now()) return null;
    return { googleId: data.googleId, email: data.email, name: data.name };
  } catch {
    return null;
  }
}
