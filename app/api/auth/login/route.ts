import { startSession, takePendingLink } from "@/lib/auth";
import { clientIp, EMAIL, fail, ok, readJson, sameOrigin, text } from "@/lib/http";
import { resetLimit, tooMany } from "@/lib/ratelimit";
import { getUserByEmail, linkGoogle, touchLogin, verifyPassword } from "@/lib/users";

const WRONG = "Incorrect email or password.";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This form can only be sent from the Vexa website.", 403);
  const ip = clientIp(request);
  const body = await readJson(request);
  if (!body) return fail("The form could not be read. Please try again.");

  const email = text(body.email, 254).toLowerCase();
  const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
  if (!EMAIL.test(email) || !password) return fail("Enter your email and password.");

  const perAccount = `login:${ip}:${email}`;
  if (tooMany(`login-ip:${ip}`, 40, 15 * 60_000) || tooMany(perAccount, 8, 15 * 60_000)) {
    return fail("Too many attempts. Please wait a few minutes and try again.", 429);
  }

  const user = await getUserByEmail(email);
  const good = await verifyPassword(password, user?.passwordHash);
  if (!user || !good) return fail(WRONG, 401);
  if (user.disabled) return fail("This account has been disabled. Please contact us if you think that is a mistake.", 403);

  resetLimit(perAccount);
  // a Google sign-in that was waiting for this password is now confirmed
  const pending = await takePendingLink();
  if (pending && pending.email.toLowerCase() === user.email) await linkGoogle(user.id, pending.googleId);
  await touchLogin(user.id);
  await startSession(user.id);
  return ok();
}
