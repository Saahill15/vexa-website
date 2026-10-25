import { completeSecondStep, getSession, isAdminSession } from "@/lib/auth";
import { fail, ok, readJson, sameOrigin, text } from "@/lib/http";
import { hasFactors, passkeyAuthOptions, passkeyAuthVerify, passkeyRegister, passkeyRegistrationOptions, removeFactor } from "@/lib/mfa";
import { tooMany } from "@/lib/ratelimit";
import { getUserById } from "@/lib/users";

/** Passkeys for admins: adding one, signing in with one, and removing one. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request can only be sent from the Vexa website.", 403);
  const session = await getSession();
  if (!isAdminSession(session) || !session) return fail("Sign in as an admin first.", 403);
  if (await tooMany(`mfa:${session.id}`, 20, 15 * 60_000)) return fail("Too many attempts. Wait a few minutes and try again.", 429);

  const body = await readJson(request, 40_000);
  const action = text(body?.action, 30);

  if (action === "register-options") {
    if (session.pendingAdmin && (await hasFactors(session.id))) return fail("Confirm it is you first, with your current code or passkey.", 403);
    const user = await getUserById(session.id);
    if (!user) return fail("Sign in again.", 401);
    return ok({ options: await passkeyRegistrationOptions(session.id, session.email) });
  }
  if (action === "register-verify") {
    if (session.pendingAdmin && (await hasFactors(session.id))) return fail("Confirm it is you first, with your current code or passkey.", 403);
    const response = body?.response as Parameters<typeof passkeyRegister>[1];
    if (!response || typeof response !== "object") return fail("The passkey could not be read.", 400);
    const result = await passkeyRegister(session.id, response, text(body?.name, 60));
    if (result.error) return fail(result.error);
    await completeSecondStep();
    return ok();
  }
  if (action === "auth-options") {
    return ok({ options: await passkeyAuthOptions(session.id) });
  }
  if (action === "auth-verify") {
    const response = body?.response as Parameters<typeof passkeyAuthVerify>[1];
    if (!response || typeof response !== "object") return fail("The passkey could not be read.", 400);
    if (!(await passkeyAuthVerify(session.id, response))) return fail("That passkey was not recognised. Try again.", 401);
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
