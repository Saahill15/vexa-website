import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { Comments } from "@/components/Comments";
import { Gate } from "@/components/Gate";
import { ARTICLES, formatDate, getArticle, readingMinutes } from "@/content/articles";
import { authHref, getSession } from "@/lib/session";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { type: "article", title: article.title, description: article.excerpt, publishedTime: article.date },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  const session = await getSession();
  const path = `/articles/${article.slug}`;

  // The server only sends the rest of the article to signed-in readers.
  const blocks = session ? article.blocks : article.blocks.slice(0, article.previewBlocks);
  const locked = !session && article.blocks.length > article.previewBlocks;

  return (
    <article>
      <header className="phero art-head">
        <div className="wrap">
          <Link className="tl back-link" href="/articles">All articles</Link>
          <p className="tag" style={{ marginTop: 22 }}>{article.category}</p>
          <h1 className="h-xl art-title">{article.title}</h1>
          <p className="ameta">
            <time dateTime={article.date}>{formatDate(article.date)}</time> · {readingMinutes(article)} min read
          </p>
        </div>
      </header>

      <div className="wrap">
        <div className="prose">
          <div className={locked ? "prose-body is-locked" : "prose-body"}>
            <ArticleBody blocks={blocks} />
          </div>
          {locked ? <Gate next={path} /> : null}
        </div>

        <div className="prose">
          <Comments
            slug={article.slug}
            userName={session?.name ?? null}
            loginHref={authHref("login", path)}
            signupHref={authHref("signup", path)}
          />
        </div>
      </div>
    </article>
  );
}
