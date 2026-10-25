import { isLocal, clientIp, EMAIL, fail, ok, publicOrigin, readJson, sameOrigin, text } from "@/lib/http";
import { mailReady } from "@/lib/mail";
import { sendAlreadyRegistered, sendSignupLink, startSignup } from "@/lib/pending-signup";
import { tooMany } from "@/lib/ratelimit";
import { getUserByEmail, hashPassword } from "@/lib/users";

/**
 * Starts a sign-up. No account is created here: the account exists only once the link in the email is confirmed.
 * Without a mail service, nothing can be confirmed, so sign-up is refused, except on this machine in development.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This form can only be sent from the Vexa website.", 403);
  if (await tooMany(`signup:${clientIp(request)}`, 10, 3600_000)) return fail("Too many sign-ups from this connection. Please try again later.", 429);
  const body = await readJson(request);
  if (!body) return fail("The form could not be read. Please try again.");

  const name = text(body.name, 80);
  const email = text(body.email, 254).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!name) return fail("Enter your name.");
  if (!EMAIL.test(email)) return fail("Enter a full email address.");
  if (password.length < 8) return fail("Use a password of at least 8 characters.");
  if (password.length > 200) return fail("That password is too long.");
  if (await tooMany(`signup-email:${email}`, 5, 3600_000)) return fail("We have sent several links to this address. Please wait a while before trying again.", 429);

  const showHere = process.env.NODE_ENV !== "production" && isLocal(request);
  // the answer is the same whether or not the address already has an account, so this form cannot be used to find out who
  // does; an existing account is told about it by email instead
  if (await getUserByEmail(email)) {
    await hashPassword(password); // the same work as a real sign-up, so the response time does not give the account away
    if (mailReady()) await sendAlreadyRegistered(email, `${publicOrigin(request)}/login`);
    return ok({ pending: true, email });
  }

  const token = await startSignup({ name, email, password });
  const link = `${publicOrigin(request)}/verify-email?token=${token}`;
  const sent = mailReady() && (await sendSignupLink(email, link));
  if (!sent && !showHere) return fail("We could not send your confirmation email, so the account was not created. Please try again later.", 503);
  return ok({ pending: true, email, devLink: showHere ? link : undefined });
}
