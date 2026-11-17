import { NextResponse } from "next/server";

// read at request time, so the token comes from the Worker's settings (Variables and Secrets) and not from the build
export const dynamic = "force-dynamic";

/** The Cloudflare Web Analytics token. It is public (it appears in the page source anyway); the page asks for it only after a visitor accepts the cookie notice. */
export function GET() {
  const token = process.env.CF_ANALYTICS_TOKEN?.trim() || null;
  return NextResponse.json({ token }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
