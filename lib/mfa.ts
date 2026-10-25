import { randomBytes } from "crypto";
import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import QRCode from "qrcode";
import { db } from "./db";
import { siteUrl } from "./site-url";
import { base32Decode, base32Encode, hashCode, matchTotp, newBackupCodes, seal, totpUri, unseal } from "./totp";

/*
 * Two-step sign-in for admins: an authenticator app (six-digit codes), passkeys (fingerprint or device key), and one-time
 * backup codes. The passkey checks follow the WebAuthn standard through @simplewebauthn; the codes are checked here.
 */

export type Factor = { id: string; kind: "totp" | "passkey"; name: string; createdAt: string; lastUsedAt: string | null };

/** WebAuthn ties a passkey to the site's address, so it must be the address the visitor uses. */
const relyingParty = () => {
  const url = new URL(siteUrl());
  return { rpID: url.hostname, origin: url.origin, rpName: "Vexa Digital" };
};

const CHALLENGE_MINUTES = 5;

export async function listFactors(userId: string): Promise<Factor[]> {
  const { rows } = await db.query<{ id: string; kind: "totp" | "passkey"; name: string; created_at: Date | string; last_used_at: Date | string | null }>(
    "select id, kind, name, created_at, last_used_at from admin_factors where user_id = $1 and confirmed order by created_at",
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    name: r.name,
    createdAt: new Date(r.created_at).toISOString(),
    lastUsedAt: r.last_used_at ? new Date(r.last_used_at).toISOString() : null,
  }));
}

export async function hasFactors(userId: string): Promise<boolean> {
  const { rows } = await db.query<{ n: number }>("select count(*)::int as n from admin_factors where user_id = $1 and confirmed", [userId]);
  return rows[0].n > 0;
}

/* ---------- authenticator app ---------- */

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

/* ---------- passkeys ---------- */

async function saveChallenge(userId: string, kind: "register" | "auth", challenge: string) {
  await db.query("delete from mfa_challenges where user_id = $1 and kind = $2", [userId, kind]);
  await db.query("insert into mfa_challenges (user_id, kind, challenge, expires_at) values ($1, $2, $3, now() + make_interval(mins => $4))", [userId, kind, challenge, CHALLENGE_MINUTES]);
}

/** Returns the waiting challenge once, or null if there is none or it has expired. */
async function takeChallenge(userId: string, kind: "register" | "auth"): Promise<string | null> {
  const { rows } = await db.query<{ challenge: string }>("delete from mfa_challenges where user_id = $1 and kind = $2 and expires_at > now() returning challenge", [userId, kind]);
  return rows[0]?.challenge ?? null;
}

export async function passkeyRegistrationOptions(userId: string, email: string) {
  const { rows } = await db.query<{ credential_id: string }>("select credential_id from admin_factors where user_id = $1 and kind = 'passkey' and credential_id is not null", [userId]);
  const options = await generateRegistrationOptions({
    ...relyingParty(),
    userName: email,
    userID: new TextEncoder().encode(userId),
    attestationType: "none",
    excludeCredentials: rows.map((r) => ({ id: r.credential_id })),
    authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
  });
  await saveChallenge(userId, "register", options.challenge);
  return options;
}

export async function passkeyRegister(userId: string, response: RegistrationResponseJSON, name: string): Promise<{ error?: string }> {
  const challenge = await takeChallenge(userId, "register");
  if (!challenge) return { error: "That took too long. Try adding the passkey again." };
  let verified = false;
  let credential: { id: string; publicKey: Uint8Array; counter: number; transports?: string[] } | undefined;
  try {
    const result = await verifyRegistrationResponse({ response, expectedChallenge: challenge, expectedOrigin: relyingParty().origin, expectedRPID: relyingParty().rpID });
    verified = result.verified;
    credential = result.registrationInfo?.credential;
  } catch {
    verified = false;
  }
  if (!verified || !credential) return { error: "The passkey could not be added. Try again." };
  await db.query(
    "insert into admin_factors (user_id, kind, name, credential_id, public_key, counter, transports, confirmed) values ($1, 'passkey', $2, $3, $4, $5, $6, true)",
    [userId, name.trim().slice(0, 60) || "Passkey", credential.id, Buffer.from(credential.publicKey).toString("base64url"), credential.counter, credential.transports ?? []],
  );
  return {};
}

export async function passkeyAuthOptions(userId: string) {
  const { rows } = await db.query<{ credential_id: string; transports: string[] }>("select credential_id, transports from admin_factors where user_id = $1 and kind = 'passkey' and credential_id is not null", [userId]);
  const options = await generateAuthenticationOptions({
    rpID: relyingParty().rpID,
    allowCredentials: rows.map((r) => ({ id: r.credential_id, transports: r.transports as never })),
    userVerification: "preferred",
  });
  await saveChallenge(userId, "auth", options.challenge);
  return options;
}

export async function passkeyAuthVerify(userId: string, response: AuthenticationResponseJSON): Promise<boolean> {
  const challenge = await takeChallenge(userId, "auth");
  if (!challenge) return false;
  const { rows } = await db.query<{ id: string; credential_id: string; public_key: string; counter: string }>(
    "select id, credential_id, public_key, counter from admin_factors where user_id = $1 and kind = 'passkey' and credential_id = $2",
    [userId, response.id],
  );
  const row = rows[0];
  if (!row) return false;
  try {
    const result = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: relyingParty().origin,
      expectedRPID: relyingParty().rpID,
      credential: { id: row.credential_id, publicKey: Buffer.from(row.public_key, "base64url"), counter: Number(row.counter) },
    });
    if (!result.verified) return false;
    await db.query("update admin_factors set counter = $2, last_used_at = now() where id = $1", [row.id, result.authenticationInfo.newCounter]);
    return true;
  } catch {
    return false;
  }
}

/* ---------- removing a factor ---------- */

/** Removes one way of confirming it is you. Refused when it is the last one, so the account cannot be locked out. */
export async function removeFactor(userId: string, factorId: string): Promise<string | null> {
  const { rows } = await db.query<{ n: number }>("select count(*)::int as n from admin_factors where user_id = $1 and confirmed", [userId]);
  if (rows[0].n <= 1) return "Add another way to confirm it is you before removing this one.";
  await db.query("delete from admin_factors where user_id = $1 and id = $2", [userId, factorId]);
  return null;
}
