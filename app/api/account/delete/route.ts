import { deleteAccount } from "@/lib/account";
import { endSession, getSession } from "@/lib/auth";
import { fail, ok, readJson, sameOrigin, text } from "@/lib/http";
import { getUserById } from "@/lib/users";

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

  await deleteAccount(user.id);
  await endSession();
  return ok();
}
