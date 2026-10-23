import { createHash, randomBytes } from "crypto";
import { db, transaction } from "./db";
import { mailReady, sendAccountMail } from "./mail";

/*
 * Email verification links, sent when an account is created with a password. Only a hash of each token is stored.
 * A link is single-use and lasts 24 hours. Confirming it happens on a page with a button, so mail apps that open
 * links in advance cannot use it up.
 */

const sha = (token: string) => createHash("sha256").update(token).digest("hex");
export const VERIFY_HOURS = 24;

/** A new single-use token for a user. Earlier unused links for that user stop working. */
export async function createVerification(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await transaction(async (client) => {
    await client.query("update email_verifications set used_at = now() where user_id = $1 and used_at is null", [userId]);
    await client.query(
      "insert into email_verifications (user_id, token_hash, expires_at) values ($1, $2, now() + make_interval(hours => $3))",
      [userId, sha(token), VERIFY_HOURS],
    );
  });
  return token;
}

/** Uses a token once. Returns the account it belongs to, or null if it is unknown, used or expired. */
export async function consumeVerification(token: string): Promise<string | null> {
  return transaction(async (client) => {
    const { rows } = await client.query<{ user_id: string }>(
      "update email_verifications set used_at = now() where token_hash = $1 and used_at is null and expires_at > now() returning user_id",
      [sha(token)],
    );
    if (!rows[0]) return null;
    await client.query("update email_verifications set used_at = now() where user_id = $1 and used_at is null", [rows[0].user_id]);
    return rows[0].user_id;
  });
}

/**
 * Creates a link and emails it. When no mail service is set up, the link is returned instead, but only if
 * showHere is true (development on this machine), so it is never shown to anyone else.
 */
export async function sendVerification(user: { id: string; email: string }, origin: string, showHere: boolean): Promise<{ sent: boolean; devLink?: string }> {
  if (!mailReady() && !showHere) return { sent: false };
  const token = await createVerification(user.id);
  const link = `${origin}/verify-email?token=${token}`;
  const sent = await sendAccountMail({
    to: user.email,
    subject: "Confirm your Vexa email address",
    heading: "Verify your email address",
    body: `Please verify the email address for your Vexa account. The link works for ${VERIFY_HOURS} hours.`,
    button: "Verify my email",
    note: "If you did not create an account, you can ignore this email.",
    link,
    text: `Confirm your email address for your Vexa account. The link works for ${VERIFY_HOURS} hours:\n\n${link}\n\nIf you did not create an account, you can ignore this email.`,
  });
  return { sent, devLink: showHere ? link : undefined };
}
