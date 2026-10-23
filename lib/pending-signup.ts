import { createHash, randomBytes } from "crypto";
import { db, transaction } from "./db";
import { sendAccountMail } from "./mail";
import { hashPassword } from "./users";

/*
 * A sign-up waits here until its email is confirmed; the account is only created then. The password is stored already
 * hashed, and only a hash of the link token is kept. A new sign-up for the same email replaces the one waiting.
 */

const sha = (token: string) => createHash("sha256").update(token).digest("hex");
export const SIGNUP_HOURS = 24;

/** Stores the sign-up and returns the link token for it. */
export async function startSignup(input: { name: string; email: string; password: string }): Promise<string> {
  const passwordHash = await hashPassword(input.password);
  const token = randomBytes(32).toString("base64url");
  await transaction(async (client) => {
    await client.query("delete from pending_signups where email = $1", [input.email]);
    await client.query(
      "insert into pending_signups (email, name, password_hash, token_hash, expires_at) values ($1, $2, $3, $4, now() + make_interval(hours => $5))",
      [input.email, input.name, passwordHash, sha(token), SIGNUP_HOURS],
    );
    await client.query("delete from pending_signups where expires_at < now()");
  });
  return token;
}

/** Takes a waiting sign-up for its link, once. Returns null if the link is unknown, used or expired. */
export async function takeSignup(token: string): Promise<{ name: string; email: string; passwordHash: string } | null> {
  const { rows } = await db.query<{ name: string; email: string; password_hash: string; expires_at: Date }>(
    "delete from pending_signups where token_hash = $1 returning name, email, password_hash, expires_at",
    [sha(token)],
  );
  const row = rows[0];
  if (!row || row.expires_at.getTime() < Date.now()) return null;
  return { name: row.name, email: row.email, passwordHash: row.password_hash };
}

/** Sent instead of a confirmation link when someone signs up with an address that already has an account. */
export function sendAlreadyRegistered(to: string, link: string): Promise<boolean> {
  return sendAccountMail({
    to,
    subject: "You already have a Vexa account",
    heading: "You already have an account",
    body: "Someone (hopefully you) tried to create a Vexa account with this email address, but it already has one. You can log in, or reset the password from the login page.",
    button: "Go to log in",
    note: "If this was not you, you can ignore this email. Nothing has changed on your account.",
    link,
    text: `Someone tried to create a Vexa account with this email address, but it already has one. Log in here: ${link}\n\nIf this was not you, you can ignore this email.`,
  });
}

/** Emails the confirmation link. False when no mail service is set up or the send failed. */
export function sendSignupLink(to: string, link: string): Promise<boolean> {
  return sendAccountMail({
    to,
    subject: "Confirm your Vexa account",
    heading: "Verify your email to create your account",
    body: `Press the button to verify your email address and finish creating your Vexa account. The link works for ${SIGNUP_HOURS} hours.`,
    button: "Verify and create my account",
    note: "If you did not sign up, you can ignore this email and no account will be created.",
    link,
    text: `Open this link to confirm your email and create your Vexa account. It works for ${SIGNUP_HOURS} hours:\n\n${link}\n\nIf you did not sign up, you can ignore this email and no account will be created.`,
  });
}
