import { deleteAccount } from "@/lib/account";
import { endSession, getSession } from "@/lib/auth";
import { fail, ok, readJson, sameOrigin, text } from "@/lib/http";
import { clientIp } from "@/lib/http";
import { tooMany } from "@/lib/ratelimit";
import { getUserById, verifyPassword } from "@/lib/users";

/** Deletes the signed-in account after the reader types its email address to confirm. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request can only be sent from the Vexa website.", 403);
  const session = await getSession();
  if (!session) return fail("Please log in again to continue.", 401);
  if (session.role === "admin") return fail("Admin accounts can't be deleted from here. Ask another admin to remove the admin role first.", 403);

  const user = await getUserById(session.id);
  if (!user) return fail("Please log in again to continue.", 401);
  const body = await readJson(request);
  if (text(body?.email, 254).toLowerCase() !== user.email) return fail("That is not the email address for this account.");

  // someone using a stolen session cannot delete the account: an account with a password must confirm it
  if (user.passwordHash) {
    if (tooMany(`account-delete:${clientIp(request)}:${user.id}`, 8, 15 * 60_000)) return fail("Too many attempts. Please wait a few minutes.", 429);
    const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
    if (!password) return fail("Enter your password to confirm.");
    if (!(await verifyPassword(password, user.passwordHash))) return fail("That password is not right.", 401);
  }

  await deleteAccount(user.id);
  await endSession();
  return ok();
}
