import { getDb } from "@/lib/db";
import { ARTICLES, getArticle, type Article } from "@/lib/learn";

// Article text stays in reviewed source files (content/learn). The database holds only whether a published
// article is temporarily withdrawn, so an administrator can take one down without a release.
export function hiddenSlugs(): Set<string> {
  try {
    return new Set((getDb().prepare("SELECT slug FROM article_visibility WHERE hidden = 1").all() as { slug: string }[]).map((row) => row.slug));
  } catch {
    // An unreadable visibility table must not take the articles offline.
    return new Set();
  }
}
export function visibleArticles(): Article[] {
  const hidden = hiddenSlugs();
  return ARTICLES.filter((article) => !hidden.has(article.slug));
}
export function getVisibleArticle(slug: string): Article | undefined {
  const article = getArticle(slug);
  return article && !hiddenSlugs().has(slug) ? article : undefined;
}
export function setArticleHidden(slug: string, hidden: boolean, actorId: string): void {
  getDb()
    .prepare("INSERT INTO article_visibility (slug, hidden, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET hidden = excluded.hidden, updated_at = excluded.updated_at, updated_by = excluded.updated_by")
    .run(slug, hidden ? 1 : 0, new Date().toISOString(), actorId);
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Problems in the source list that would break or shadow an article URL. */
export function slugProblems(): string[] {
  const seen = new Set<string>();
  const problems: string[] = [];
  for (const article of ARTICLES) {
    if (!SLUG_PATTERN.test(article.slug) || article.slug.length > 80) problems.push(`"${article.slug}" is not a valid URL slug.`);
    if (seen.has(article.slug)) problems.push(`"${article.slug}" is used by more than one article.`);
    seen.add(article.slug);
    if (Number.isNaN(Date.parse(article.published))) problems.push(`"${article.slug}" has an invalid publication date.`);
  }
  return problems;
}
