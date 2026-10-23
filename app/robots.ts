import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

/** Search engines may read the public site; the admin, account, sign-in and API paths are kept out. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/account", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
