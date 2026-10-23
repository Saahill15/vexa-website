import { createPublicKey, verify } from "crypto";

/*
 * Verifies a "Sign in with Google" ID token without any extra package: checks the RS256 signature against
 * Google's published keys, then the audience (our client id), issuer, expiry and that the email is verified.
 */

export type GoogleProfile = { sub: string; email: string; name: string };

type Jwk = { kid: string; kty: string; n: string; e: string };
let keys: { at: number; list: Jwk[] } | null = null;

async function googleKeys(): Promise<Jwk[]> {
  if (keys && Date.now() - keys.at < 60 * 60 * 1000) return keys.list;
  const res = await fetch("https://www.googleapis.com/oauth2/v3/certs", { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error("Could not load Google's signing keys");
  const list = ((await res.json()) as { keys: Jwk[] }).keys;
  keys = { at: Date.now(), list };
  return list;
}

export async function verifyGoogleToken(credential: string): Promise<GoogleProfile | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  const [h, p, s] = credential.split(".");
  if (!h || !p || !s) return null;
  try {
    const header = JSON.parse(Buffer.from(h, "base64url").toString("utf8")) as { alg?: string; kid?: string };
    if (header.alg !== "RS256" || !header.kid) return null;
    const jwk = (await googleKeys()).find((k) => k.kid === header.kid);
    if (!jwk) return null;
    const valid = verify("RSA-SHA256", Buffer.from(`${h}.${p}`), createPublicKey({ key: jwk, format: "jwk" }), Buffer.from(s, "base64url"));
    if (!valid) return null;
    const claims = JSON.parse(Buffer.from(p, "base64url").toString("utf8")) as Record<string, unknown>;
    const issuerOk = claims.iss === "accounts.google.com" || claims.iss === "https://accounts.google.com";
    const expired = typeof claims.exp !== "number" || claims.exp * 1000 < Date.now();
    if (claims.aud !== clientId || !issuerOk || expired || claims.email_verified !== true) return null;
    if (typeof claims.sub !== "string" || typeof claims.email !== "string") return null;
    return { sub: claims.sub, email: claims.email.toLowerCase(), name: typeof claims.name === "string" ? claims.name : "" };
  } catch {
    return null;
  }
}
