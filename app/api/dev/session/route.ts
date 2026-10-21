import { NextResponse, type NextRequest } from "next/server";
import { PREVIEW_COOKIE, safeNext } from "@/lib/session";

/** Development-only switch for previewing the signed-in experience. Not available in production. */
export function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }
  const on = request.nextUrl.searchParams.get("set") === "1";
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, request.url));
  if (on) {
    response.cookies.set(PREVIEW_COOKIE, "1", { path: "/", httpOnly: true, sameSite: "lax" });
  } else {
    response.cookies.delete(PREVIEW_COOKIE);
  }
  return response;
}
