import { createHash, randomBytes } from "crypto";
import { sendAccountMail, mailReady } from "./mail";
import { newId, update } from "./store";
import { istIso } from "./time";

/*
 * Email verification links, sent when an account is created with a password. Only a hash of each token is stored.
 * A link is single-use and lasts 24 hours. Confirming it happens on a page with a button, so mail apps that open
 * links in advance cannot use it up.
 */

type Verification = { id: string; userId: string; tokenHash: string; expiresAt: string; usedAt?: string; createdAt: string };

const COLLECTION = "email-verifications";
export const VERIFY_HOURS = 24;
const sha = (token: string) => createHash("sha256").update(token).digest("hex");

/** A new single-use token for a user. Earlier unused links for that user stop working. */
export async function createVerification(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  await update<Verification>(COLLECTION, (rows) => {
    for (const r of rows) if (r.userId === userId && !r.usedAt) r.usedAt = istIso(now);
    rows.push({ id: newId(), userId, tokenHash: sha(token), createdAt: istIso(now), expiresAt: istIso(now + VERIFY_HOURS * 3600_000) });
    while (rows.length > 500) rows.shift();
  });
  return token;
}

/** Uses a token once. Returns the account it belongs to, or null if it is unknown, used or expired. */
export async function consumeVerification(token: string): Promise<string | null> {
  const hash = sha(token);
  return update<Verification, string | null>(COLLECTION, (rows) => {
    const r = rows.find((x) => x.tokenHash === hash);
    if (!r || r.usedAt || Date.parse(r.expiresAt) < Date.now()) return null;
    const now = istIso();
    for (const x of rows) if (x.userId === r.userId && !x.usedAt) x.usedAt = now;
    return r.userId;
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
