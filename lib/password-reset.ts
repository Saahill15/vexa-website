import { createHash, randomBytes } from "crypto";
import { sendAccountMail } from "./mail";
import { newId, update } from "./store";
import { istIso } from "./time";

/*
 * Password reset links. Only a hash of each token is stored. Links are single-use and expire after 30 minutes.
 */

type Reset = { id: string; userId: string; tokenHash: string; expiresAt: string; usedAt?: string; createdAt: string };

const COLLECTION = "password-resets";
export const RESET_MINUTES = 30;
const sha = (token: string) => createHash("sha256").update(token).digest("hex");

/** A new single-use token for a user. Earlier unused links for that user stop working. */
export async function createReset(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  await update<Reset>(COLLECTION, (rows) => {
    for (const r of rows) if (r.userId === userId && !r.usedAt) r.usedAt = istIso(now);
    rows.push({ id: newId(), userId, tokenHash: sha(token), createdAt: istIso(now), expiresAt: istIso(now + RESET_MINUTES * 60_000) });
    while (rows.length > 500) rows.shift();
  });
  return token;
}

/** Uses a token once. Returns the account it belongs to, or null if it is unknown, used or expired. */
export async function consumeReset(token: string): Promise<string | null> {
  const hash = sha(token);
  return update<Reset, string | null>(COLLECTION, (rows) => {
    const r = rows.find((x) => x.tokenHash === hash);
    if (!r || r.usedAt || Date.parse(r.expiresAt) < Date.now()) return null;
    const now = istIso();
    for (const x of rows) if (x.userId === r.userId && !x.usedAt) x.usedAt = now;
    return r.userId;
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
