import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// RFC 6238 time-based one-time passwords (HMAC-SHA1, 6 digits, 30-second steps): the defaults every
// authenticator app understands. Pure functions only; storage and policy live in lib/second-factor.ts.
export const TOTP_STEP_SECONDS = 30;
export const TOTP_DIGITS = 6;
/** Accept the previous and next step too, for clock drift between the phone and the server. */
const DRIFT_STEPS = 1;

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Buffer): string {
  let bits = 0, value = 0, out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { out += BASE32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text: string): Buffer {
  const clean = text.toUpperCase().replace(/[\s=-]/g, "");
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index < 0) throw Error("Invalid base32 text.");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

/** 160 random bits, the key length RFC 4226 recommends for HMAC-SHA1. */
export function newTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

/** RFC 4226 HOTP with dynamic truncation. */
export function hotp(key: Buffer, counter: number, digits = TOTP_DIGITS): string {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(message).digest();
  const offset = digest[digest.length - 1] & 15;
  const binary = ((digest[offset] & 127) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3];
  return String(binary % 10 ** digits).padStart(digits, "0");
}

export function totpStep(now = Date.now()): number {
  return Math.floor(now / 1000 / TOTP_STEP_SECONDS);
}

export function totp(secret: string, now = Date.now()): string {
  return hotp(base32Decode(secret), totpStep(now));
}

/**
 * Returns the time step the code belongs to, or null. Steps at or before `lastStep` are refused so a code
 * that was already used (or an older one) cannot be replayed.
 */
export function matchTotp(secret: string, code: string, now = Date.now(), lastStep: number | null = null): number | null {
  if (!new RegExp(`^\\d{${TOTP_DIGITS}}$`).test(code)) return null;
  const key = base32Decode(secret);
  const current = totpStep(now);
  let matched: number | null = null;
  // Check every candidate so the time taken does not reveal which step matched.
  for (let step = current - DRIFT_STEPS; step <= current + DRIFT_STEPS; step++) {
    const expected = Buffer.from(hotp(key, step));
    if (timingSafeEqual(expected, Buffer.from(code)) && (lastStep === null || step > lastStep) && matched === null) matched = step;
  }
  return matched;
}

/** The provisioning URI authenticator apps read (Key Uri Format). */
export function otpauthUri(secret: string, account: string, issuer = "VEXA"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const query = new URLSearchParams({ secret, issuer, algorithm: "SHA1", digits: String(TOTP_DIGITS), period: String(TOTP_STEP_SECONDS) });
  return `otpauth://totp/${label}?${query.toString()}`;
}
