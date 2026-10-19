import { createCipheriv, createDecipheriv, hkdfSync, randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "@/lib/db";
import { matchTotp, newTotpSecret, otpauthUri } from "@/lib/totp";

// Staff two-step sign-in. Required for every staff account: staff who have not enrolled are sent to set it up,
// and every new admin session of an enrolled account must pass a code. STAFF_TOTP_REQUIRED=false relaxes only the
// first part (temporary rollout escape hatch); enrolled staff must always pass the code.
const scrypt = promisify(scryptCallback) as (password: string, salt: string, length: number, options: { N: number; r: number; p: number }) => Promise<Buffer>;

export const RECOVERY_CODE_COUNT = 10;
/** A started enrolment must be confirmed with a code within this time. */
const PENDING_MS = 15 * 60_000;

export function secondFactorRequiredForAll(): boolean {
  return process.env.STAFF_TOTP_REQUIRED !== "false";
}

export class SecondFactorUnavailable extends Error {}

const strictKeys = () => process.env.NODE_ENV === "production" && process.env.VEXA_PREVIEW !== "1";
const derive = (material: string) => Buffer.from(hkdfSync("sha256", material, "vexa-staff-totp", "totp-secret-encryption-v1", 32));
/**
 * AES-256-GCM key from STAFF_TOTP_KEY (at least 32 characters). It is separate from NEXTAUTH_SECRET so rotating the
 * session secret never makes stored authenticator keys unreadable. Only local development and previews may fall
 * back to a key derived from NEXTAUTH_SECRET; production refuses to enrol or verify without STAFF_TOTP_KEY.
 */
function key(): Buffer {
  const own = process.env.STAFF_TOTP_KEY ?? "";
  if (own.length >= 32) return derive(own);
  if (own || strictKeys()) throw new SecondFactorUnavailable("STAFF_TOTP_KEY is missing or shorter than 32 characters.");
  const fallback = process.env.NEXTAUTH_SECRET ?? "";
  if (fallback.length < 32) throw new SecondFactorUnavailable("No encryption key is configured.");
  return derive(fallback);
}
/** STAFF_TOTP_KEY_PREVIOUS, during a key rotation: still accepted for reading, never used for writing. */
function previousKey(): Buffer | null {
  const old = process.env.STAFF_TOTP_KEY_PREVIOUS ?? "";
  return old.length >= 32 ? derive(old) : null;
}
// The reader id is bound in as associated data, so a secret copied onto another account does not decrypt.
function seal(plain: string, readerId: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(readerId));
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), body.toString("base64url")].join(".");
}
function open(sealed: string, readerId: string, withKey: Buffer): string | null {
  const [, iv, tag, body] = sealed.split(".");
  try {
    const decipher = createDecipheriv("aes-256-gcm", withKey, Buffer.from(iv, "base64url"));
    decipher.setAAD(Buffer.from(readerId));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
/** Decrypts with the current key, or the previous one during rotation (`stale` then asks the caller to re-seal). */
function unseal(sealed: string, readerId: string): { plain: string; stale: boolean } {
  const [version, iv, tag, body] = sealed.split(".");
  if (version !== "v1" || !iv || !tag || !body) throw new SecondFactorUnavailable("Unknown secret format.");
  const current = open(sealed, readerId, key());
  if (current !== null) return { plain: current, stale: false };
  const previous = previousKey();
  const old = previous ? open(sealed, readerId, previous) : null;
  if (old !== null) return { plain: old, stale: true };
  throw new SecondFactorUnavailable("The stored secret could not be decrypted (has the key changed?).");
}

type Row = { totp_secret: string | null; totp_pending: string | null; totp_pending_at: number | null; totp_enabled_at: string | null; totp_last_step: number | null };
function row(readerId: string): Row | null {
  return (getDb().prepare("SELECT totp_secret, totp_pending, totp_pending_at, totp_enabled_at, totp_last_step FROM readers WHERE id = ?").get(readerId) as Row | undefined) ?? null;
}

export type SecondFactorStatus = { enrolled: boolean; enabledAt: string | null; recoveryCodesLeft: number };
export function secondFactorStatus(readerId: string): SecondFactorStatus {
  const found = row(readerId);
  const left = (getDb().prepare("SELECT COUNT(*) AS n FROM staff_recovery_codes WHERE reader_id = ? AND used_at IS NULL").get(readerId) as { n: number }).n;
  return { enrolled: Boolean(found?.totp_secret), enabledAt: found?.totp_enabled_at ?? null, recoveryCodesLeft: left };
}

/** When this browser session passed the second factor, or null. */
export function sessionSecondFactorAt(sessionId: string | null): number | null {
  if (!sessionId) return null;
  const found = getDb().prepare("SELECT second_factor_at FROM reader_sessions WHERE id = ? AND expires_at > ?").get(sessionId, Date.now()) as { second_factor_at: number | null } | undefined;
  return found?.second_factor_at ?? null;
}

/** Starts (or restarts) enrolment. The new secret only replaces an existing one once a code from it is confirmed. */
export function startEnrolment(readerId: string, account: string): { secret: string; uri: string } {
  const secret = newTotpSecret();
  getDb().prepare("UPDATE readers SET totp_pending = ?, totp_pending_at = ? WHERE id = ?").run(seal(secret, readerId), Date.now(), readerId);
  return { secret, uri: otpauthUri(secret, account) };
}

const RECOVERY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 symbols, no 0/O or 1/I
function newRecoveryCode(): string {
  const bytes = randomBytes(10);
  const chars = [...bytes].map((byte) => RECOVERY_ALPHABET[byte & 31]).join("");
  return `${chars.slice(0, 5)}-${chars.slice(5)}`;
}
function normalRecoveryCode(code: string): string {
  return code.toUpperCase().replace(/[\s-]/g, "");
}
// scrypt with a per-account salt: one hash per attempt, and a copied database does not give up the codes cheaply.
async function recoveryHash(readerId: string, code: string): Promise<string> {
  return (await scrypt(normalRecoveryCode(code), `vexa-staff-recovery:${readerId}`, 32, { N: 16384, r: 8, p: 1 })).toString("hex");
}

export type EnrolResult = { ok: true; recoveryCodes: string[]; replaced: boolean } | { ok: false; reason: "no_pending" | "expired" | "wrong_code" };

/**
 * Confirms the pending secret with a code from the app. On success the secret becomes active, fresh recovery
 * codes replace any old ones, this session counts as verified and the account's other sessions must verify again.
 */
export async function confirmEnrolment(readerId: string, sessionId: string, code: string): Promise<EnrolResult> {
  const found = row(readerId);
  if (!found?.totp_pending || !found.totp_pending_at) return { ok: false, reason: "no_pending" };
  if (Date.now() - found.totp_pending_at > PENDING_MS) return { ok: false, reason: "expired" };
  const secret = unseal(found.totp_pending, readerId).plain;
  const step = matchTotp(secret, code.trim());
  if (step === null) return { ok: false, reason: "wrong_code" };
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, newRecoveryCode);
  const hashes = await Promise.all(codes.map((entry) => recoveryHash(readerId, entry)));
  const db = getDb();
  const now = Date.now(), iso = new Date(now).toISOString();
  db.transaction(() => {
    db.prepare("UPDATE readers SET totp_secret = ?, totp_pending = NULL, totp_pending_at = NULL, totp_enabled_at = ?, totp_last_step = ? WHERE id = ?").run(seal(secret, readerId), iso, step, readerId);
    db.prepare("DELETE FROM staff_recovery_codes WHERE reader_id = ?").run(readerId);
    const insert = db.prepare("INSERT INTO staff_recovery_codes (reader_id, code_hash, created_at) VALUES (?, ?, ?)");
    for (const hash of hashes) insert.run(readerId, hash, iso);
    db.prepare("UPDATE reader_sessions SET second_factor_at = CASE WHEN id = ? THEN ? ELSE NULL END WHERE reader_id = ?").run(sessionId, now, readerId);
  })();
  return { ok: true, recoveryCodes: codes, replaced: Boolean(found.totp_secret) };
}

export type VerifyResult = { ok: true; method: "totp" | "recovery"; recoveryCodesLeft: number } | { ok: false };

/** Checks a six-digit app code or a one-time recovery code and marks this session as verified. */
export async function verifySecondFactor(readerId: string, sessionId: string, input: string): Promise<VerifyResult> {
  const found = row(readerId);
  if (!found?.totp_secret) return { ok: false };
  const code = input.trim();
  const db = getDb();
  let method: "totp" | "recovery" | null = null;
  if (/^\d{6}$/.test(code)) {
    const opened = unseal(found.totp_secret, readerId);
    const step = matchTotp(opened.plain, code, Date.now(), found.totp_last_step);
    // The conditional update makes acceptance atomic: two requests with the same code cannot both pass.
    if (step !== null && db.prepare("UPDATE readers SET totp_last_step = ? WHERE id = ? AND (totp_last_step IS NULL OR totp_last_step < ?)").run(step, readerId, step).changes === 1) {
      method = "totp";
      // Key rotation: a secret still sealed with STAFF_TOTP_KEY_PREVIOUS is rewritten with the current key.
      if (opened.stale) db.prepare("UPDATE readers SET totp_secret = ? WHERE id = ? AND totp_secret = ?").run(seal(opened.plain, readerId), readerId, found.totp_secret);
    }
  } else if (/^[A-Za-z0-9]{5}-?[A-Za-z0-9]{5}$/.test(code.replace(/\s/g, ""))) {
    const hash = await recoveryHash(readerId, code);
    if (db.prepare("UPDATE staff_recovery_codes SET used_at = ? WHERE reader_id = ? AND code_hash = ? AND used_at IS NULL").run(new Date().toISOString(), readerId, hash).changes === 1) method = "recovery";
  }
  if (!method) return { ok: false };
  const marked = db.prepare("UPDATE reader_sessions SET second_factor_at = ? WHERE id = ? AND reader_id = ? AND expires_at > ?").run(Date.now(), sessionId, readerId, Date.now()).changes;
  if (!marked) return { ok: false };
  return { ok: true, method, recoveryCodesLeft: secondFactorStatus(readerId).recoveryCodesLeft };
}

export type SecondFactorKeyStatus = "configured" | "too_short" | "missing" | "preview_fallback";
/** For the Settings page: whether a usable encryption key is configured. Never returns or logs key material. */
export function secondFactorKeyStatus(): { key: SecondFactorKeyStatus; rotating: boolean } {
  const own = process.env.STAFF_TOTP_KEY ?? "";
  const key: SecondFactorKeyStatus = own.length >= 32 ? "configured" : own ? "too_short" : strictKeys() ? "missing" : "preview_fallback";
  return { key, rotating: (process.env.STAFF_TOTP_KEY_PREVIOUS ?? "").length >= 32 };
}
export function staffTwoStepCounts(): { staff: number; enrolled: number } {
  const row = getDb().prepare("SELECT COUNT(*) AS staff, COALESCE(SUM(totp_secret IS NOT NULL), 0) AS enrolled FROM readers WHERE (admin = 1 OR moderator = 1) AND disabled_at IS NULL").get() as { staff: number; enrolled: number };
  return row;
}
