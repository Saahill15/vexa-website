import type { MetadataRoute } from "next";
import { listPublished } from "@/lib/articles";
import { SERVICES, serviceHref } from "@/lib/services";
import { siteUrl } from "@/lib/site-url";

// read at request time, so the address comes from SITE_URL on the server rather than from the build machine
export const dynamic = "force-dynamic";

/** Every public page: the main pages, each service and each published article. Sign-in, account and admin pages are left out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const articles = await listPublished();
  const newest = articles[0]?.updatedAt ?? articles[0]?.date;

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/services`, changeFrequency: "monthly", priority: 0.9 },
    ...SERVICES.map((s) => ({ url: `${base}${serviceHref(s)}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${base}/valuate`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/articles`, changeFrequency: "weekly", priority: 0.8, ...(newest ? { lastModified: new Date(newest) } : {}) },
    ...articles.map((a) => ({ url: `${base}/articles/${a.slug}`, lastModified: new Date(a.updatedAt ?? a.date), changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
  return pages.filter((p) => !Number.isNaN(p.lastModified instanceof Date ? p.lastModified.getTime() : 0));
}
