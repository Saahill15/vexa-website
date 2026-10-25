import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "./db";
import { sign } from "./token";
import { effectiveRole, getUserById, type Role } from "./users";

/*
 * Sessions live in the database. The cookie holds a random token; the database keeps only a hash of it, so a leaked
 * database cannot be used to sign in. Each session can be ended on its own, and every session ends when the password
 * changes or "sign out everywhere" is used. The account is looked up on every request, so disabling someone or removing
 * their admin role takes effect at once.
 */

/**
 * `pendingAdmin` is set for an admin whose second step (an authenticator code) is not done in this session. Such a
 * session has the role "user" until then, so every admin check refuses it.
 */
export type Session = { id: string; name: string; email: string; role: Role; pendingAdmin?: boolean };

const COOKIE = "vexa_session";
/** How long a sign-in lasts, in seconds. */
export const SESSION_SECONDS = 60 * 60 * 24 * 14;
const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function startSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await db.query("insert into sessions (token_hash, user_id, expires_at) values ($1, $2, now() + make_interval(secs => $3))", [hash(token), userId, SESSION_SECONDS]);
  // old sessions that have run out are removed now and then, so the table does not grow forever
  if (Math.random() < 0.05) await db.query("delete from sessions where expires_at < now() - interval '1 day' or revoked_at < now() - interval '1 day'").catch(() => undefined);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_SECONDS });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.query("update sessions set revoked_at = now() where token_hash = $1", [hash(token)]).catch(() => undefined);
  jar.delete(COOKIE);
}

/** Who is signed in right now, or null. */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const { rows } = await db.query<{ user_id: string; created_at: Date | string; mfa_at: Date | string | null }>(
    "select user_id, created_at, mfa_at from sessions where token_hash = $1 and revoked_at is null and expires_at > now()",
    [hash(token)],
  );
  const row = rows[0];
  if (!row) return null;
  const user = await getUserById(row.user_id);
  if (!user || user.disabled) return null;
  // sessions started before the last password change (for example a reset) or a "sign out everywhere" stop working
  const cutoff = Math.max(user.passwordChangedAt ? Date.parse(user.passwordChangedAt) : 0, user.sessionsRevokedAt ? Date.parse(user.sessionsRevokedAt) : 0);
  if (new Date(row.created_at).getTime() < cutoff) return null;
  const role = effectiveRole(user);
  if (role === "admin" && !row.mfa_at) return { id: user.id, name: user.name, email: user.email, role: "user", pendingAdmin: true };
  return { id: user.id, name: user.name, email: user.email, role };
});

/** Marks this session's second step as done (after a correct authenticator code). */
export async function completeSecondStep(): Promise<void> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return;
  await db.query("update sessions set mfa_at = now() where token_hash = $1 and revoked_at is null", [hash(token)]);
}

/** True for an admin, whether or not the second step is done yet. Used where enrolling is allowed before verifying. */
export const isAdminSession = (session: Session | null) => Boolean(session && (session.role === "admin" || session.pendingAdmin));

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
