/** The public address of the site, no trailing slash. Required in production (see .env.example). */
export function siteUrl(): string {
  const fixed = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (fixed && /^https?:\/\/[^\s/]+$/.test(fixed) && (process.env.NODE_ENV !== "production" || fixed.startsWith("https://"))) return fixed;
  if (process.env.NODE_ENV === "production") throw new Error("SITE_URL must be set in production and start with https:// (for example https://www.vexadigital.in).");
  return "http://localhost:3310";
}
