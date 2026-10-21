import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Split } from "@/components/Split";
import { ARTICLES, formatDate, readingMinutes } from "@/content/articles";

export const metadata: Metadata = {
  title: "Articles",
  description: "Short, practical writing on brand partnerships, creators and building a business in esports.",
};

export default function ArticlesPage() {
  return (
    <>
      <header className="phero">
        <div className="wrap">
          <Reveal as="p" className="tag">Articles</Reveal>
          <Split as="h1" className="h-xl" style={{ fontSize: "clamp(2.3rem,6.6vw,6rem)" }}>Notes on gaming.</Split>
          <Reveal as="p" className="lede" delay={400}>Short, practical writing on brand partnerships, creators and esports.</Reveal>
        </div>
      </header>

      <section className="sec--tight sec" style={{ paddingTop: 0 }} aria-label="All articles">
        <div className="wrap">
          <ul className="agrid">
            {ARTICLES.map((article, i) => (
              <Reveal as="li" key={article.slug} delay={i * 100}>
                <Link className="acard" href={`/articles/${article.slug}`}>
                  <p className="tag">{article.category}</p>
                  <h2 className="h-md">{article.title}</h2>
                  <p className="aex">{article.excerpt}</p>
                  <p className="ameta">
                    <time dateTime={article.date}>{formatDate(article.date)}</time> · {readingMinutes(article)} min read
                  </p>
                  <span className="go" aria-hidden="true">→</span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
