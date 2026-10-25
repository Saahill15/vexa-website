import { NextResponse, type NextRequest } from "next/server";

/*
 * Turns strangers away from the admin area before anything is rendered: without a genuine, unexpired session cookie the
 * answer is a plain 404, so the admin pages are not even visible to look at. Who is actually an admin is still decided
 * on the server for every page, action and endpoint.
 *
 * It runs on the edge runtime, so it cannot read the database; it only checks the token has the right shape.
 */

/** Only a token of the right shape can be a session; the server checks the database for the rest. */
const looksLikeSession = (token: string | undefined) => Boolean(token && /^[A-Za-z0-9_-]{43}$/.test(token));

export async function middleware(request: NextRequest) {
  if (looksLikeSession(request.cookies.get("vexa_session")?.value)) return NextResponse.next();
  return new NextResponse("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

export const config = { matcher: ["/admin/:path*"] };
