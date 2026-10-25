import { completeSecondStep, getSession, isAdminSession } from "@/lib/auth";
import { fail, ok, readJson, sameOrigin, text } from "@/lib/http";
import { beginTotp, checkSecondFactor, confirmTotp, hasFactors, removeFactor } from "@/lib/mfa";
import { tooMany } from "@/lib/ratelimit";

/**
 * Two-step sign-in for admins: the authenticator app. An admin who already has a second step must confirm it before they
 * can add or remove one, so a stolen password alone cannot change the account's sign-in methods.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request can only be sent from the Vexa website.", 403);
  const session = await getSession();
  if (!isAdminSession(session) || !session) return fail("Sign in as an admin first.", 403);
  const body = await readJson(request);
  const action = text(body?.action, 30);
  const code = text(body?.code, 20);

  if (action === "totp-begin" || action === "totp-confirm") {
    if (session.pendingAdmin && (await hasFactors(session.id))) return fail("Confirm it is you first, with your current code or passkey.", 403);
    if (action === "totp-begin") return ok(await beginTotp(session.id, session.email));
    const result = await confirmTotp(session.id, code);
    if (result.error) return fail(result.error);
    await completeSecondStep();
    return ok({ codes: result.codes });
  }
  if (action === "verify") {
    // only codes that are entered count towards the limit, so ordinary set-up steps never lock anyone out
    if (await tooMany(`mfa-verify:${session.id}`, 20, 15 * 60_000)) return fail("Too many attempts. Wait a few minutes and try again.", 429);
    if (!(await checkSecondFactor(session.id, code))) return fail("That code is not right. Try again.", 401);
    await completeSecondStep();
    return ok();
  }
  if (action === "remove") {
    if (session.role !== "admin") return fail("Confirm it is you first.", 403);
    const error = await removeFactor(session.id, text(body?.id, 60));
    return error ? fail(error) : ok();
  }
  return fail("That request is not recognised.", 400);
}
