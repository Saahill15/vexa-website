import { NextResponse } from "next/server";

/** Only accept posts that come from this site's own pages (compares with the public host a proxy forwards). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(request: Request): string {
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
export const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });
export const ok = (data: Record<string, unknown> = {}) => NextResponse.json({ ok: true, ...data });

export async function readJson(request: Request, maxBytes = 20_000): Promise<Record<string, unknown> | null> {
  try {
    const raw = await request.text();
    if (raw.length > maxBytes) return null;
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

/** The address the visitor used, so links in emails point back to the same site. */
export function publicOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}
