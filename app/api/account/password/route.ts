import { getSession, startSession } from "@/lib/auth";
import { clientIp, fail, ok, readJson, sameOrigin } from "@/lib/http";
import { tooMany } from "@/lib/ratelimit";
import { getUserById, removePassword, setPassword, verifyPassword } from "@/lib/users";

const SIGNED_OUT = "Please log in again to change your account.";

/**
 * Set or change the password for the signed-in account. An account that already has a password must confirm it
 * with currentPassword. An account that signed in with Google only does not need one: the Google sign-in proves who they are.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This form can only be sent from the Vexa website.", 403);
  const session = await getSession();
  if (!session) return fail(SIGNED_OUT, 401);

  const body = await readJson(request);
  const password = typeof body?.password === "string" ? body.password : "";
  const current = typeof body?.currentPassword === "string" ? body.currentPassword.slice(0, 200) : "";
  if (password.length < 8) return fail("Use a password of at least 8 characters.");
  if (password.length > 200) return fail("That password is too long.");

  const user = await getUserById(session.id);
  if (!user) return fail(SIGNED_OUT, 401);

  if (user.passwordHash) {
    if (await tooMany(`account-pw:${clientIp(request)}:${user.id}`, 8, 15 * 60_000)) return fail("Too many attempts. Please wait a few minutes.", 429);
    if (!current) return fail("Enter your current password.");
    if (!(await verifyPassword(current, user.passwordHash))) return fail("Your current password is not right.", 401);
  }

  await setPassword(user.id, password);
  // a password change signs out other sessions, so this one is re-issued to keep the user signed in here
  await startSession(user.id);
  return ok({ hadPassword: Boolean(user.passwordHash) });
}

/** Removes the password. Refused unless Google is linked, so the account can still be reached. */
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return fail("This form can only be sent from the Vexa website.", 403);
  const session = await getSession();
  if (!session) return fail(SIGNED_OUT, 401);
  const error = await removePassword(session.id);
  return error ? fail(error) : ok();
}
