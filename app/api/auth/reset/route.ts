import { clientIp, fail, ok, readJson, sameOrigin, text } from "@/lib/http";
import { consumeReset } from "@/lib/password-reset";
import { tooMany } from "@/lib/ratelimit";
import { getUserById, setPassword } from "@/lib/users";

const EXPIRED = "This link is invalid or has expired. Request a new one.";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This form can only be sent from the Vexa website.", 403);
  if (await tooMany(`reset-ip:${clientIp(request)}`, 20, 15 * 60_000)) return fail("Too many attempts. Please wait a few minutes.", 429);

  const body = await readJson(request);
  const token = text(body?.token, 200);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!token) return fail(EXPIRED);
  if (password.length < 8) return fail("Use a password of at least 8 characters.");
  if (password.length > 200) return fail("That password is too long.");

  const userId = await consumeReset(token);
  if (!userId) return fail(EXPIRED);
  const user = await getUserById(userId);
  if (!user || user.disabled) return fail("This account can't be reset. Please contact us.", 403);
  await setPassword(userId, password);
  return ok();
}
