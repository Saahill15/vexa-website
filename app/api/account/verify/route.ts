import { getSession } from "@/lib/auth";
import { sendVerification } from "@/lib/email-verify";
import { clientIp, fail, isLocal, ok, publicOrigin, sameOrigin } from "@/lib/http";
import { tooMany } from "@/lib/ratelimit";
import { getUserById } from "@/lib/users";

/** Sends the confirmation link again for the signed-in account. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request can only be sent from the Vexa website.", 403);
  const session = await getSession();
  if (!session) return fail("Please log in again to continue.", 401);
  const user = await getUserById(session.id);
  if (!user) return fail("Please log in again to continue.", 401);
  if (user.emailVerified) return ok({ alreadyVerified: true });
  if (await tooMany(`verify-send:${user.id}`, 5, 3600_000) || await tooMany(`verify-send-ip:${clientIp(request)}`, 20, 3600_000)) {
    return fail("You have asked for several links. Please wait a while before trying again.", 429);
  }

  const showHere = process.env.NODE_ENV !== "production" && isLocal(request);
  const { sent, devLink } = await sendVerification(user, publicOrigin(request), showHere);
  return ok({ sent, devLink });
}
