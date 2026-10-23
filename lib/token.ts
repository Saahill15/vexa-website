import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

/*
 * The signed session token: the account id, an expiry and the time it was issued, signed with HMAC-SHA256. It carries no
 * role: who is an admin is always read from the account on the server, so a token can never claim more than the account has.
 */

export const MAX_AGE = 60 * 60 * 24 * 30;

let cachedSecret: Buffer | null = null;
function secret(): Buffer {
  if (cachedSecret) return cachedSecret;
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return (cachedSecret = Buffer.from(fromEnv));
  // no SESSION_SECRET set: make one once and keep it in the data folder, so sessions survive restarts
  const folder = process.env.VEXA_DATA_DIR ?? path.join(process.cwd(), "data");
  const where = path.join(folder, ".session-secret");
  if (!existsSync(where)) {
    mkdirSync(folder, { recursive: true, mode: 0o700 });
    writeFileSync(where, randomBytes(48).toString("base64"), { mode: 0o600 });
    chmodSync(where, 0o600);
  }
  return (cachedSecret = Buffer.from(readFileSync(where, "utf8").trim()));
}

export const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function makeToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ u: userId, e: Math.floor(Date.now() / 1000) + MAX_AGE, i: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export type Claim = { u: string; i: number };

export function readToken(token: string): Claim | null {
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

/** True when the token is genuine and unexpired (the account is not looked up). Used by the proxy to turn strangers away early. */
export const tokenLooksValid = (token: string | undefined) => Boolean(token && readToken(token));
