import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { ReadingProgress, ShareLinks } from "@/components/ArticleTools";
import { Comments } from "@/components/Comments";
import { Gate } from "@/components/Gate";
import { Icon, type IconName } from "@/components/Icon";
import { formatDate, headingId, readingMinutes } from "@/content/articles";
import { getBySlug, listPublished } from "@/lib/articles";
import { listForArticle } from "@/lib/comments";
import { authHref, getSession } from "@/lib/session";

type Params = { slug: string };

const CATEGORY_ICON: Record<string, IconName> = { Brands: "target", Creators: "video", Esports: "trophy" };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const article = await getBySlug((await params).slug);
  if (!article || article.status !== "published") return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { type: "article", title: article.title, description: article.excerpt, publishedTime: article.date },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const article = await getBySlug((await params).slug);
  const session = await getSession();
  // drafts can only be previewed by an admin
  if (!article || (article.status !== "published" && session?.role !== "admin")) notFound();
  const path = `/articles/${article.slug}`;

  // The server only sends the rest of the article to signed-in readers.
  const blocks = session ? article.blocks : article.blocks.slice(0, article.previewBlocks);
  const locked = !session && article.blocks.length > article.previewBlocks;

  // Section list: every heading in the article; the ones past the wall are shown as locked.
  const sections = article.blocks
    .map((b, i) => (b.type === "h2" ? { text: b.text, id: headingId(b.text), open: !locked || i < article.previewBlocks } : null))
    .filter((s): s is { text: string; id: string; open: boolean } => s !== null);

  const related = (await listPublished()).filter((a) => a.slug !== article.slug).slice(0, 2);
  const comments = session ? await listForArticle(article.slug) : [];

  return (
    <article className="art">
      <ReadingProgress />

      <header className="art-hero">
        <div className="wrap art-hero-in">
          <nav className="art-crumbs" aria-label="Breadcrumb">
            <Link href="/articles">Articles</Link>
            <span aria-hidden="true">/</span>
            <span>{article.category}</span>
          </nav>
          {article.status !== "published" ? <p className="art-draft">Draft: only admins can see this page.</p> : null}
          <h1 className="art-h1">{article.title}</h1>
          <p className="art-dek">{article.excerpt}</p>
          <div className="art-meta">
            <span className="art-by"><span className="art-by-mark" aria-hidden="true">V</span>Vexa Digital</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{readingMinutes(article)} min read</span>
          </div>
        </div>
      </header>

      <div className="wrap art-layout">
        <aside className="art-rail">
          <ShareLinks title={article.title} />
        </aside>

        <div className="art-main">
          <div className={locked ? "prose-body art-body is-locked" : "prose-body art-body"}>
            <ArticleBody blocks={blocks} />
          </div>
          {locked ? <Gate next={path} /> : null}
          <Comments
            slug={article.slug}
            user={session ? { id: session.id, name: session.name, admin: session.role === "admin" } : null}
            initial={comments.map(({ id, userId, name, text, createdAt }) => ({ id, userId, name, text, createdAt }))}
            gated={locked}
            loginHref={authHref("login", path)}
            signupHref={authHref("signup", path)}
          />
        </div>

        {sections.length ? (
          <aside className="art-toc" aria-label="In this article">
            <span className="art-toc-h">In this article</span>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  {s.open ? <a href={`#${s.id}`}>{s.text}</a> : <span className="is-locked"><Icon name="shield" size={14} />{s.text}</span>}
                </li>
              ))}
            </ol>
          </aside>
        ) : null}
      </div>

      {related.length ? (
        <section className="sec sec--tint art-more" aria-labelledby="more-h">
          <div className="wrap">
            <div className="art-more-head">
              <h2 className="h2" id="more-h">Keep reading</h2>
              <Link className="tl" href="/articles">All articles</Link>
            </div>
            <ul className="agrid art-more-grid">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link className="acard" href={`/articles/${a.slug}`}>
                    <span className="tag">{a.category}</span>
                    <h2>{a.title}</h2>
                    <p className="aex">{a.excerpt}</p>
                    <p className="ameta">{formatDate(a.date)} · {readingMinutes(a)} min read</p>
                    <span className="go">Read article →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  );
}
