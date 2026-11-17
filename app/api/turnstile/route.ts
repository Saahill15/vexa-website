import { NextResponse } from "next/server";

// read at request time, so the key comes from the Worker's settings (Variables and Secrets)
export const dynamic = "force-dynamic";

/** The Turnstile site key. It is public (it is in the page source of any form that uses it); the contact form asks for it so the page itself can stay static and fast. */
export function GET() {
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim() || null;
  return NextResponse.json({ siteKey }, { headers: { "Cache-Control": "public, max-age=300" } });
}
