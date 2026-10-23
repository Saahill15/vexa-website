import { NextResponse, type NextRequest } from "next/server";
import { tokenLooksValid } from "@/lib/token";

/**
 * Turns strangers away from the admin area before anything is rendered: without a genuine, unexpired session cookie the
 * answer is a plain 404, so the admin pages are not even visible to look at. Who is actually an admin is still decided
 * on the server for every page, action and endpoint.
 */
export function proxy(request: NextRequest) {
  if (!tokenLooksValid(request.cookies.get("vexa_session")?.value)) return new NextResponse("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
