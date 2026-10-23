import { clientIp, EMAIL, fail, isLocal, ok, publicOrigin, readJson, sameOrigin, text } from "@/lib/http";
import { mailReady } from "@/lib/mail";
import { createReset, RESET_MINUTES, sendResetLink } from "@/lib/password-reset";
import { tooMany } from "@/lib/ratelimit";
import { getUserByEmail } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This form can only be sent from the Vexa website.", 403);
  const body = await readJson(request);
  const email = text(body?.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return fail("Enter a full email address.");
  if (await tooMany(`forgot-ip:${clientIp(request)}`, 10, 3600_000) || await tooMany(`forgot-email:${email}`, 5, 3600_000)) {
    return fail("Too many requests. Please wait a while and try again.", 429);
  }

  // the same answer whether or not an account exists, so the form can't be used to find out who has one
  const message = `If an account exists for ${email}, we have sent a link to choose a new password. The link works for ${RESET_MINUTES} minutes.`;
  const user = await getUserByEmail(email);
  if (!user || user.disabled) return ok({ message });

  const mailReady_ = mailReady();
  // development on this machine only: show the link on the page, since no mail service is connected yet
  const showHere = process.env.NODE_ENV !== "production" && isLocal(request);
  // create a link only if it can actually reach someone, so random requests can't cancel a pending one
  if (!mailReady_ && !showHere) {
    console.error("password reset: no mail service is configured, so the link was not sent");
    return ok({ message });
  }

  const token = await createReset(user.id);
  const link = `${publicOrigin(request)}/reset-password?token=${token}`;
  if (mailReady_ && (await sendResetLink(user.email, link))) return ok({ message });
  if (showHere) return ok({ message, devLink: link });
  return ok({ message });
}
