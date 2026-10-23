import { getSession } from "@/lib/auth";
import { fail, ok, readJson, sameOrigin } from "@/lib/http";
import { verifyGoogleToken } from "@/lib/google";
import { linkGoogle, unlinkGoogle } from "@/lib/users";

const SIGNED_OUT = "Please log in again to change your account.";

/** Links the Google account to the signed-in account. Its email must be the account's own email. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request can only be sent from the Vexa website.", 403);
  if (!process.env.GOOGLE_CLIENT_ID) return fail("Google sign-in is not set up yet.", 503);
  const session = await getSession();
  if (!session) return fail(SIGNED_OUT, 401);

  const body = await readJson(request, 8000);
  const credential = typeof body?.credential === "string" ? body.credential : "";
  const profile = credential ? await verifyGoogleToken(credential) : null;
  if (!profile) return fail("Google sign-in could not be verified. Please try again.", 401);
  if (profile.email.toLowerCase() !== session.email.toLowerCase()) {
    return fail(`Choose the Google account for ${session.email}. Google accounts can only be linked when their email matches this account.`, 409);
  }

  const error = await linkGoogle(session.id, profile.sub);
  return error ? fail(error, 409) : ok();
}

/** Removes the Google link. Refused unless a password is set, so the account can still be reached. */
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return fail("This request can only be sent from the Vexa website.", 403);
  const session = await getSession();
  if (!session) return fail(SIGNED_OUT, 401);
  const error = await unlinkGoogle(session.id);
  return error ? fail(error) : ok();
}
