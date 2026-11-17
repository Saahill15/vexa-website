import { listPublished } from "@/lib/articles";
import { SITE } from "@/lib/site";
import { abs } from "@/lib/seo";

// read at request time, like the sitemap, so new articles show up as soon as they are published
export const dynamic = "force-dynamic";

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS feed of the published articles. */
export async function GET() {
  const articles = (await listPublished()).slice(0, 30);
  const items = articles
    .map((a) => {
      const link = abs(`/articles/${a.slug}`);
      return `<item><title>${esc(a.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${new Date(a.date + "T00:00:00Z").toUTCString()}</pubDate><category>${esc(a.category)}</category><description>${esc(a.excerpt)}</description></item>`;
    })
    .join("");
  const updated = articles[0] ? new Date(articles[0].date + "T00:00:00Z").toUTCString() : new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(SITE.name)} articles</title><link>${abs("/articles")}</link><atom:link href="${abs("/feed.xml")}" rel="self" type="application/rss+xml"/><description>Short, practical writing on brand partnerships, creators and the business of esports.</description><language>en-IN</language><lastBuildDate>${updated}</lastBuildDate>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=900" } });
}
