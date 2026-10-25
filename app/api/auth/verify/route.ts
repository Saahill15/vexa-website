import { startSession } from "@/lib/auth";
import { consumeVerification } from "@/lib/email-verify";
import { clientIp, fail, ok, readJson, sameOrigin, text } from "@/lib/http";
import { takeSignup } from "@/lib/pending-signup";
import { tooMany } from "@/lib/ratelimit";
import { createConfirmedUser, setEmailVerified } from "@/lib/users";

const EXPIRED = "This link is invalid or has expired. Start again from the sign-up page.";

/**
 * Confirms an email from its link. For a new sign-up, this creates the account and signs the reader in.
 * Links from before that change confirm an existing account instead.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This form can only be sent from the Vexa website.", 403);
  if (await tooMany(`verify-ip:${clientIp(request)}`, 30, 15 * 60_000)) return fail("Too many attempts. Please wait a few minutes.", 429);
  const body = await readJson(request);
  const token = text(body?.token, 200);
  if (!token) return fail(EXPIRED);

  const signup = await takeSignup(token);
  if (signup) {
    const user = await createConfirmedUser(signup);
    if (!user) return fail("An account with that email already exists. Try logging in instead.", 409);
    await startSession(user.id);
    return ok({ created: true });
  }

  const userId = await consumeVerification(token);
  if (!userId) return fail(EXPIRED);
  await setEmailVerified(userId);
  return ok({ created: false });
}
