import { getSession, startSession } from "@/lib/auth";
import { fail, ok, sameOrigin } from "@/lib/http";
import { revokeSessions } from "@/lib/users";

/** Signs out every other device. This one stays signed in. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request can only be sent from the Vexa website.", 403);
  const session = await getSession();
  if (!session) return fail("Please log in again to continue.", 401);
  await revokeSessions(session.id);
  await startSession(session.id);
  return ok();
}
