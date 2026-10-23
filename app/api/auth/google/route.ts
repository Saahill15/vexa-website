import { NextResponse } from "next/server";
import { setPendingLink, startSession } from "@/lib/auth";
import { verifyGoogleToken } from "@/lib/google";
import { clientIp, fail, ok, readJson, sameOrigin } from "@/lib/http";
import { tooMany } from "@/lib/ratelimit";
import { googleLogin, touchLogin } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request can only be sent from the Vexa website.", 403);
  if (!process.env.GOOGLE_CLIENT_ID) return fail("Google sign-in is not set up yet.", 503);
  if (await tooMany(`google:${clientIp(request)}`, 30, 15 * 60_000)) return fail("Too many attempts. Please wait a few minutes.", 429);

  const body = await readJson(request, 8000);
  const credential = typeof body?.credential === "string" ? body.credential : "";
  const profile = credential ? await verifyGoogleToken(credential) : null;
  if (!profile) return fail("Google sign-in could not be verified. Please try again.", 401);

  const result = await googleLogin({ googleId: profile.sub, name: profile.name, email: profile.email });
  if (result.kind === "blocked") return fail("This email is already linked to a different Google account. Contact us if you need help.", 409);
  if (result.user.disabled) return fail("This account has been disabled. Please contact us if you think that is a mistake.", 403);

  if (result.kind === "link") {
    // the Google sign-in is held for 15 minutes until the password for this account confirms it
    await setPendingLink({ googleId: profile.sub, email: profile.email, name: profile.name });
    return NextResponse.json(
      { ok: false, needsLink: true, error: "An account with this email already exists. Log in with your password to link Google." },
      { status: 409 },
    );
  }

  await touchLogin(result.user.id);
  await startSession(result.user.id);
  return ok();
}
