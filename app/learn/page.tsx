import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/ButtonLink";
import { SERIES, articleDate, articleReadTime, type SeriesKey } from "@/lib/learn";
import { visibleArticles } from "@/lib/article-state";
import { withShare } from "@/lib/meta";

export const metadata: Metadata = withShare({ title: "Articles on the business of gaming", description: "Researched writing by Kaustubh Srivastava on gaming partnerships, audience evidence and running an esports team.", alternates: { canonical: "/learn" } });
type Props = { searchParams: Promise<{ series?: string; q?: string }> };

export default async function LearnPage({ searchParams: queryParams }: Props): Promise<React.ReactElement> {
  const searchParams=await queryParams;
  const ARTICLES = visibleArticles();
  const liveSeries = (Object.keys(SERIES) as SeriesKey[]).filter(key => ARTICLES.some(article => article.series === key));
  const chosen = liveSeries.find(key => key === searchParams.series);
  const query = searchParams.q?.trim() || "";
  const list = ARTICLES.filter(article => (!chosen || article.series === chosen) && (!query || `${article.question} ${article.answer}`.toLowerCase().includes(query.toLowerCase())));
  const filterHref = (series?: string): string => {
    const params = new URLSearchParams();
    if (series) params.set("series", series);
    if (query) params.set("q", query);
    return `/learn${params.size ? `?${params.toString()}` : ""}`;
  };

  return <>
    <header className="vx-container familiar-index"><h1>Articles</h1><p>By Kaustubh Srivastava. On brand partnerships, creator pricing and the business of esports.</p></header>
    <section className="vx-container article-index-controls" aria-label="Browse articles"><nav className="article-topic-filter" aria-label="Article topics"><Link href={filterHref()} aria-current={!chosen ? "page" : undefined}>All articles</Link>{liveSeries.map(key => <Link key={key} href={filterHref(key)} aria-current={chosen === key ? "page" : undefined}>{SERIES[key].label}</Link>)}</nav><form method="get" action="/learn" className="article-search">{chosen ? <input type="hidden" name="series" value={chosen} /> : null}<label htmlFor="article-search" className="sr-only">Search articles</label><input id="article-search" name="q" type="search" defaultValue={query} placeholder="Search articles" /><button type="submit">Search</button></form></section>
    <section className="vx-container familiar-articles" aria-label="Articles">{list.length ? list.map(article => <article key={article.slug}><p className="article-meta">{SERIES[article.series].label} · <time dateTime={article.published}>{articleDate(article.published)}</time> · {articleReadTime(article)} min read</p><h2><Link href={`/learn/${article.slug}`}>{article.question}</Link></h2><p>{article.answer}</p><p className="article-meta">By Kaustubh Srivastava</p><Link href={`/learn/${article.slug}`} className="editorial-link">Read article <Arrow /></Link></article>) : <article><h2>No article matches that search.</h2><p>Try another phrase or <Link href="/learn">see all articles</Link>.</p></article>}</section>
  </>;
}
