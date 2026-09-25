import { NextResponse, type NextRequest } from "next/server";

const APEX = "vexadigital.in";
const CANONICAL = "https://www.vexadigital.in";

// 301 the bare apex host to www, keeping path and query.
// Only an exact apex host matches, so requests already on www never redirect (no loop behind Traefik).
export function middleware(req: NextRequest) {
  const raw = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const host = raw.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
  if (host === APEX) {
    const { pathname, search } = req.nextUrl;
    return NextResponse.redirect(`${CANONICAL}${pathname}${search}`, 301);
  }
  return NextResponse.next();
}
