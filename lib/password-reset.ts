import { createHash, randomBytes } from "crypto";
import { db, transaction } from "./db";
import { sendAccountMail } from "./mail";

/*
 * Password reset links. Only a hash of each token is stored. Links are single-use and expire after 30 minutes.
 */

const sha = (token: string) => createHash("sha256").update(token).digest("hex");
export const RESET_MINUTES = 30;

/** A new single-use token for a user. Earlier unused links for that user stop working. */
export async function createReset(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await transaction(async (client) => {
    await client.query("update password_resets set used_at = now() where user_id = $1 and used_at is null", [userId]);
    await client.query(
      "insert into password_resets (user_id, token_hash, expires_at) values ($1, $2, now() + make_interval(mins => $3))",
      [userId, sha(token), RESET_MINUTES],
    );
  });
  return token;
}

/** Uses a token once. Returns the account it belongs to, or null if it is unknown, used or expired. */
export async function consumeReset(token: string): Promise<string | null> {
  return transaction(async (client) => {
    const { rows } = await client.query<{ user_id: string }>(
      "update password_resets set used_at = now() where token_hash = $1 and used_at is null and expires_at > now() returning user_id",
      [sha(token)],
    );
    if (!rows[0]) return null;
    await client.query("update password_resets set used_at = now() where user_id = $1 and used_at is null", [rows[0].user_id]);
    return rows[0].user_id;
  });
}

/** Sends the link through the account mail service. False when no mail service is set up or the send failed. */
export function sendResetLink(to: string, link: string): Promise<boolean> {
  return sendAccountMail({
    to,
    subject: "Reset your Vexa password",
    heading: "Reset your password",
    body: `Use the button below to choose a new password. The link works for ${RESET_MINUTES} minutes.`,
    button: "Choose a new password",
    note: "If you did not ask for this, you can ignore this email. Your password will not change.",
    link,
    text: `Choose a new password here. The link works for ${RESET_MINUTES} minutes:\n\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
  });
}
