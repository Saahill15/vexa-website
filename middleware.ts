import { NextResponse, type NextRequest } from "next/server";

/*
 * Turns strangers away from the admin area before anything is rendered: without a genuine, unexpired session cookie the
 * answer is a plain 404, so the admin pages are not even visible to look at. Who is actually an admin is still decided
 * on the server for every page, action and endpoint.
 *
 * It runs on the edge runtime (Cloudflare Workers cannot run Node middleware), so the signature is checked with Web Crypto.
 * The token format is the one in lib/token.ts.
 */

const b64 = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function genuine(token: string | undefined, secret: string): Promise<boolean> {
  const [payload, signature] = token?.split(".") ?? [];
  if (!payload || !signature) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = b64(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  if (diff !== 0) return false;
  try {
    const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { u?: unknown; e?: unknown };
    return typeof claims.u === "string" && typeof claims.e === "number" && claims.e > Date.now() / 1000;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  // without SESSION_SECRET (local development with the generated secret) the pages' own checks are the only ones
  if (!secret || secret.length < 32) return NextResponse.next();
  if (await genuine(request.cookies.get("vexa_session")?.value, secret)) return NextResponse.next();
  return new NextResponse("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

export const config = { matcher: ["/admin/:path*"] };
