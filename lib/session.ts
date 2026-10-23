export { getSession, type Session } from "./auth";

/** Only allow redirects to paths on this site. */
export function safeNext(value: string | null | undefined, fallback = "/articles"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export function authHref(mode: "login" | "signup", next: string): string {
  return `/${mode}?next=${encodeURIComponent(next)}`;
}
