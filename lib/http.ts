import { NextResponse } from "next/server";
import { siteUrl } from "./site-url";

/**
 * Only accept posts that come from this site's own pages. A browser always says where a post came from (Origin, or
 * Sec-Fetch-Site), so a post that says nothing is refused; it can only be a script, and scripts have no session to abuse.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") === "same-origin";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * The visitor's address, for rate limits. Behind a proxy the last address in X-Forwarded-For is the one the proxy itself
 * saw; the earlier ones are whatever the visitor claimed, so they are never trusted.
 */
export function clientIp(request: Request): string {
  const real = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip");
  if (real) return real.trim().slice(0, 64);
  const chain = request.headers.get("x-forwarded-for")?.split(",");
  return chain?.at(-1)?.trim().slice(0, 64) || "local";
}

export const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
export const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });
export const ok = (data: Record<string, unknown> = {}) => NextResponse.json({ ok: true, ...data });

/** Reads the body only up to `maxBytes`, so a huge post cannot fill the server's memory. Null when it is too big or not a JSON object. */
export async function readBody(request: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) {
      void reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function readJson(request: Request, maxBytes = 20_000): Promise<Record<string, unknown> | null> {
  try {
    const raw = await readBody(request, maxBytes);
    if (raw === null) return null;
    const body = JSON.parse(raw);
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LOCAL = ["localhost", "127.0.0.1", "[::1]", "::1"];

/** True only for a request made on this machine, never one that came through a tunnel or a public proxy. */
export function isLocal(request: Request): boolean {
  if (!LOCAL.includes(new URL(request.url).hostname)) return false;
  if (request.headers.get("cf-connecting-ip")) return false;
  const forwarded = request.headers.get("x-forwarded-host");
  return !forwarded || LOCAL.includes(forwarded.replace(/:\d+$/, ""));
}

/**
 * The address links in emails point to. In production it is fixed by SITE_URL, because the Host header comes from the
 * visitor: someone could ask for a password reset with a made-up Host and get a link to their own site mailed to the victim.
 */
export function publicOrigin(request: Request): string {
  if (process.env.SITE_URL || process.env.NODE_ENV === "production") return siteUrl(); // throws in production when it is missing
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}
