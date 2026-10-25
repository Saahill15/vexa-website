import { randomBytes } from "crypto";
import QRCode from "qrcode";
import { db } from "./db";
import { base32Decode, base32Encode, hashCode, matchTotp, newBackupCodes, seal, totpUri, unseal } from "./totp";

/*
 * Two-step sign-in for admins with an authenticator app: six-digit codes from Google Authenticator, Microsoft Authenticator
 * or 1Password, plus one-time backup codes. A code works once, and a backup code is marked used when it is entered.
 */

export type Factor = { id: string; kind: "totp"; name: string; createdAt: string; lastUsedAt: string | null };

export async function listFactors(userId: string): Promise<Factor[]> {
  const { rows } = await db.query<{ id: string; name: string; created_at: Date | string; last_used_at: Date | string | null }>(
    "select id, name, created_at, last_used_at from admin_factors where user_id = $1 and kind = 'totp' and confirmed order by created_at",
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    kind: "totp",
    name: r.name,
    createdAt: new Date(r.created_at).toISOString(),
    lastUsedAt: r.last_used_at ? new Date(r.last_used_at).toISOString() : null,
  }));
}

export async function hasFactors(userId: string): Promise<boolean> {
  const { rows } = await db.query<{ n: number }>("select count(*)::int as n from admin_factors where user_id = $1 and confirmed", [userId]);
  return rows[0].n > 0;
}

/** Starts an authenticator set-up: a new secret, shown once as a code and a QR image. Confirmed by `confirmTotp`. */
export async function beginTotp(userId: string, email: string): Promise<{ secret: string; qr: string }> {
  const secret = base32Encode(randomBytes(20));
  await db.query("delete from admin_factors where user_id = $1 and kind = 'totp' and not confirmed", [userId]);
  await db.query("insert into admin_factors (user_id, kind, name, secret, confirmed) values ($1, 'totp', 'Authenticator app', $2, false)", [userId, seal(secret)]);
  const qr = await QRCode.toDataURL(totpUri(secret, email), { margin: 1, width: 220 });
  return { secret, qr };
}

/** Confirms the new authenticator with a code, and issues backup codes (replacing any old ones). */
export async function confirmTotp(userId: string, code: string): Promise<{ error?: string; codes?: string[] }> {
  const { rows } = await db.query<{ id: string; secret: string }>("select id, secret from admin_factors where user_id = $1 and kind = 'totp' and not confirmed", [userId]);
  const row = rows[0];
  if (!row || !row.secret) return { error: "Start the set-up again." };
  const step = matchTotp(base32Decode(unseal(row.secret)), code.trim());
  if (step === null) return { error: "That code is not right. Check the time on your phone and try again." };
  await db.query("update admin_factors set confirmed = true, last_step = $2, last_used_at = now() where id = $1", [row.id, step]);
  const codes = newBackupCodes();
  await db.query("delete from admin_backup_codes where user_id = $1", [userId]);
  for (const c of codes) await db.query("insert into admin_backup_codes (user_id, code_hash) values ($1, $2)", [userId, hashCode(c)]);
  return { codes };
}

/**
 * Checks a six-digit authenticator code, or a backup code. A code works once: a time step that was already used is refused,
 * and a backup code is marked as used.
 */
export async function checkSecondFactor(userId: string, code: string): Promise<boolean> {
  const clean = code.trim();
  if (/^\d{6}$/.test(clean)) {
    const { rows } = await db.query<{ id: string; secret: string; last_step: string | null }>("select id, secret, last_step from admin_factors where user_id = $1 and kind = 'totp' and confirmed", [userId]);
    for (const r of rows) {
      if (!r.secret) continue;
      const step = matchTotp(base32Decode(unseal(r.secret)), clean);
      if (step !== null && (r.last_step === null || step > Number(r.last_step))) {
        await db.query("update admin_factors set last_step = $2, last_used_at = now() where id = $1", [r.id, step]);
        return true;
      }
    }
    return false;
  }
  const { rowCount } = await db.query("update admin_backup_codes set used_at = now() where user_id = $1 and code_hash = $2 and used_at is null", [userId, hashCode(clean)]);
  return (rowCount ?? 0) > 0;
}

/** Removes one authenticator. Refused when it is the only way in, so the account cannot be locked out. */
export async function removeFactor(userId: string, factorId: string): Promise<string | null> {
  const { rows } = await db.query<{ n: number }>("select count(*)::int as n from admin_factors where user_id = $1 and confirmed", [userId]);
  if (rows[0].n <= 1) return "Keep at least one way to confirm it is you. Add another before removing this one.";
  await db.query("delete from admin_factors where user_id = $1 and id = $2", [userId, factorId]);
  return null;
}
