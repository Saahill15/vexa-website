import { createHash, randomBytes } from "crypto";
import { sendAccountMail } from "./mail";
import { newId, update } from "./store";
import { hashPassword } from "./users";
import { istIso } from "./time";

/*
 * A sign-up waits here until its email is confirmed; the account is only created then. The password is stored already
 * hashed, and only a hash of the link token is kept. A new sign-up for the same email replaces the one waiting.
 */

type Pending = { id: string; email: string; name: string; passwordHash: string; tokenHash: string; createdAt: string; expiresAt: string };

const COLLECTION = "pending-signups";
export const SIGNUP_HOURS = 24;
const sha = (token: string) => createHash("sha256").update(token).digest("hex");

/** Stores the sign-up and returns the link token for it. */
export async function startSignup(input: { name: string; email: string; password: string }): Promise<string> {
  const passwordHash = await hashPassword(input.password);
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  await update<Pending>(COLLECTION, (rows) => {
    for (let i = rows.length - 1; i >= 0; i--) if (rows[i].email === input.email) rows.splice(i, 1);
    rows.push({ id: newId(), email: input.email, name: input.name, passwordHash, tokenHash: sha(token), createdAt: istIso(now), expiresAt: istIso(now + SIGNUP_HOURS * 3600_000) });
    while (rows.length > 500) rows.shift();
  });
  return token;
}

/** Takes a waiting sign-up for its link, once. Returns null if the link is unknown, used or expired. */
export async function takeSignup(token: string): Promise<{ name: string; email: string; passwordHash: string } | null> {
  const hash = sha(token);
  return update<Pending, { name: string; email: string; passwordHash: string } | null>(COLLECTION, (rows) => {
    const i = rows.findIndex((r) => r.tokenHash === hash);
    if (i < 0) return null;
    const [row] = rows.splice(i, 1);
    if (Date.parse(row.expiresAt) < Date.now()) return null;
    return { name: row.name, email: row.email, passwordHash: row.passwordHash };
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
