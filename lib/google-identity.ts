import { randomBytes } from "node:crypto";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { accountConfigured } from "@/lib/deployment";

export function googleIdentityEnabled(): boolean {
  return process.env.GOOGLE_IDENTITY_ENABLED === "true" && Boolean(process.env.GOOGLE_CLIENT_ID) && accountConfigured();
}
export const GOOGLE_NONCE_TTL = 5 * 60_000;
export function googleNonceCookie(): string {return `${process.env.NODE_ENV === "production" ? "__Host-" : ""}vexa-google-identity-nonce`;}
// Next compiles route and authentication into separate modules. Share only the bounded
// nonce registry through the process global, and fail closed after a process restart.
const registryKey = Symbol.for("vexa.website.googleIdentityNonces");
const globals = globalThis as typeof globalThis & {[registryKey]?: Map<string, number>};
function registry(): Map<string, number> {return globals[registryKey] ?? (globals[registryKey] = new Map());}
export function issueGoogleNonce(now = Date.now()): string {
  const entries = registry();
  for (const [nonce, expiry] of entries) if (expiry <= now) entries.delete(nonce);
  if (entries.size >= 4096) throw Error("Please wait a moment before trying Google sign-in again.");
  const nonce = randomBytes(32).toString("hex");entries.set(nonce, now + GOOGLE_NONCE_TTL);return nonce;
}
export function consumeGoogleNonce(cookie: unknown, nonce: unknown, now = Date.now()): boolean {
  if (typeof cookie !== "string" || !/^[a-f0-9]{64}$/.test(cookie)) return false;
  const entries = registry(), expiry = entries.get(cookie);entries.delete(cookie);
  return typeof nonce === "string" && cookie === nonce && typeof expiry === "number" && expiry > now;
}
export function googleNonceFromCookieHeader(header: string | null): string | undefined {
  const name = googleNonceCookie();
  const entries = (header || "").split(";").map(part=>part.trim()).filter(part=>part.startsWith(`${name}=`));
  if(entries.length !== 1)return undefined;
  return entries[0].slice(name.length+1);
}
export function identityOriginMatches(origin: unknown): boolean {
  try {return typeof origin === "string" && origin === new URL(process.env.NEXTAUTH_URL || "").origin;} catch {return false;}
}
const googleClient = new OAuth2Client();
export type GoogleIdentity = {sub: string; email: string; name: string};
export type GoogleVerifier = (credential: string, audience: string) => Promise<TokenPayload | undefined>;
const officialVerifier: GoogleVerifier = async (credential, audience) =>
  (await googleClient.verifyIdToken({idToken: credential, audience})).getPayload();
export async function verifyGoogleIdentity(credential: unknown, cookie: unknown, nonce: unknown, origin: unknown, verify: GoogleVerifier = officialVerifier): Promise<GoogleIdentity | null> {
  if (!googleIdentityEnabled() || !identityOriginMatches(origin) || !consumeGoogleNonce(cookie, nonce)) return null;
  if (typeof credential !== "string" || credential.length < 100 || credential.length > 12000 || credential.split(".").length !== 3) return null;
  try {
    const audience = process.env.GOOGLE_CLIENT_ID!;
    const payload = await verify(credential, audience);
    if (!payload || payload.aud !== audience || !["accounts.google.com", "https://accounts.google.com"].includes(payload.iss)
      || !Number.isFinite(payload.exp) || payload.exp <= Date.now()/1000 || payload.email_verified !== true
      || (payload as TokenPayload & {nonce?: string}).nonce !== nonce
      || typeof payload.sub !== "string" || !payload.sub || payload.sub.length > 255
      || typeof payload.email !== "string" || payload.email.length > 254) return null;
    return {sub: payload.sub, email: payload.email.trim().toLowerCase(), name: (payload.name || "").trim().slice(0,80)};
  } catch {return null;}
}
