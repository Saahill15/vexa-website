import { cookies } from "next/headers";

export type Session = { name: string };

export const PREVIEW_COOKIE = "vexa_preview_session";

/**
 * Who is signed in right now. There is no account system yet, so in production this is always
 * `null`. In development only, a "preview reader" cookie (set from the login/signup placeholder
 * pages) lets you review the signed-in experience.
 *
 * When real authentication is added, replace this function; everything that gates content or
 * comments already calls it on the server.
 */
export async function getSession(): Promise<Session | null> {
  if (process.env.NODE_ENV === "production") return null;
  const jar = await cookies();
  return jar.get(PREVIEW_COOKIE) ? { name: "Preview reader" } : null;
}

/** Only allow redirects to paths on this site. */
export function safeNext(value: string | null | undefined, fallback = "/articles"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export function authHref(mode: "login" | "signup", next: string): string {
  return `/${mode}?next=${encodeURIComponent(next)}`;
}
