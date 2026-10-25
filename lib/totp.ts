import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { signingKey } from "./token";

/*
 * Authenticator codes (RFC 6238: 6 digits, 30-second steps, SHA-1, as Google Authenticator and 1Password expect), backup
 * codes, and the encryption used for the authenticator secret stored in the database.
 */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export const STEP_SECONDS = 30;

export function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text: string): Buffer {
  const clean = text.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const c of clean) {
    const index = ALPHABET.indexOf(c);
    if (index < 0) throw new Error("Not a valid secret");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** The six-digit code for one time step. */
export function hotp(secret: Buffer, step: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac("sha1", secret).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  const code = ((digest[offset] & 127) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

/** The time step a code belongs to (allowing one step either side for clock drift), or null if it matches none. */
export function matchTotp(secret: Buffer, code: string, now = Date.now()): number | null {
  const current = Math.floor(now / 1000 / STEP_SECONDS);
  for (const drift of [0, -1, 1]) {
    const step = current + drift;
    if (step < 0) continue;
    const expected = Buffer.from(hotp(secret, step));
    const given = Buffer.from(code);
    if (expected.length === given.length && timingSafeEqual(expected, given)) return step;
  }
  return null;
}

export function totpUri(secret: string, account: string): string {
  const issuer = encodeURIComponent("Vexa Digital");
  return `otpauth://totp/${issuer}:${encodeURIComponent(account)}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=${STEP_SECONDS}`;
}

/** Backup codes: ten one-time codes, shown once. */
export function newBackupCodes(): string[] {
  return Array.from({ length: 10 }, () => {
    const hex = randomBytes(5).toString("hex");
    return `${hex.slice(0, 5)}-${hex.slice(5)}`;
  });
}

export const hashCode = (code: string) => createHash("sha256").update(code.trim().toLowerCase()).digest("hex");

const cryptKey = () => createHash("sha256").update(`vexa-mfa:${signingKey().toString("base64")}`).digest();

/** Encrypts a stored secret with AES-256-GCM. */
export function seal(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", cryptKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString("base64")).join(".");
}

export function unseal(sealed: string): string {
  const [iv, tag, data] = sealed.split(".").map((part) => Buffer.from(part, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", cryptKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
