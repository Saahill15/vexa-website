import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbs } from "@/lib/seo";
import { ArticlesList } from "@/components/ArticlesList";
import { Reveal } from "@/components/motion/Reveal";
import { PageHead } from "@/components/PageHead";
import { formatDate, readingMinutes } from "@/content/articles";
import { listPublished } from "@/lib/articles";

// the list comes from the admin-edited data store, so it is built per request rather than once at build time
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles on esports and brand partnerships",
  description: "Short, practical writing on brand partnerships, creator pricing and building a business in esports, from the team at Vexa Digital.",
};

export default async function ArticlesPage() {
  const cards = (await listPublished()).map((a) => ({ slug: a.slug, title: a.title, excerpt: a.excerpt, category: a.category, date: a.date, dateLabel: formatDate(a.date), minutes: readingMinutes(a) }));
  return (
    <>
      <JsonLd data={breadcrumbs([["Articles", "/articles"]])} />
      <PageHead label="Articles" lines={["Notes on the business", "of gaming."]} lede="On brand partnerships, creator pricing and the business of esports." />
      <section className="sec" style={{ paddingTop: 10 }} aria-label="All articles">
        <div className="wrap">
          <Reveal y={20}><ArticlesList articles={cards} /></Reveal>
        </div>
      </section>
    </>
  );
}
