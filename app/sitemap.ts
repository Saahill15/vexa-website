import type { MetadataRoute } from "next";
import { visibleArticles } from "@/lib/article-state";

// Read per request so an article withdrawn in the admin area leaves the sitemap immediately.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const ARTICLES = visibleArticles();
  const base = "https://www.vexadigital.in";
  // /room joins this list when the room opens (app/room/page.tsx, ROOM_OPEN).
  const paths = [
    "/",
    "/learn",
    "/services",
    ...ARTICLES.map((article) => `/learn/${article.slug}`),
    "/organisations",
    "/brands",
    "/about",
    "/valuate",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/grievance-officer",
  ];

  return paths.map((path) => ({
    url: `${base}${path}`,
    ...(ARTICLES.find(article=>path===`/learn/${article.slug}`)?{lastModified:ARTICLES.find(article=>path===`/learn/${article.slug}`)!.published}:{}),
    changeFrequency: path === "/" || path === "/learn" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
