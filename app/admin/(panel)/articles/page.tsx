export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { Badge, Header, LoadError } from "@/components/admin/ui";
import { commentCounts } from "@/lib/admin-data";
import { hiddenSlugs, slugProblems } from "@/lib/article-state";
import { ARTICLES, SERIES, articleDate, articleReadTime } from "@/lib/learn";
import { staffPage } from "@/lib/staff";

export const metadata: Metadata = { title: "Articles" };

export default async function Articles() {
  await staffPage("articles", "/admin/articles");
  let loaded: { hidden: Set<string>; counts: ReturnType<typeof commentCounts> } | null = null;
  try { loaded = { hidden: hiddenSlugs(), counts: commentCounts() }; } catch { loaded = null; }
  const state = loaded;
  const problems = slugProblems();
  return <>
    <Header title="Articles" intro="Article text lives in reviewed source files (content/learn) and is released with the site. From here you can preview articles and withdraw or restore a published one without a release." />
    {problems.length ? <div role="alert" className={styles.errorState}><strong>Article source problems:</strong><ul>{problems.map((p) => <li key={p}>{p}</li>)}</ul></div> : null}
    {!state ? <LoadError what="Article status" /> : <div className={styles.tableWrap}><table className={styles.table}>
      <thead><tr><th scope="col">Article</th><th scope="col">URL</th><th scope="col">Published</th><th scope="col">Comments</th><th scope="col">Status</th></tr></thead>
      <tbody>{ARTICLES.map((article) => {
        const hidden = state.hidden.has(article.slug);
        const counts = state.counts[article.slug] ?? { pending: 0, approved: 0 };
        return <tr key={article.slug}>
          <td><Link href={`/admin/articles/${article.slug}`}>{article.question}</Link><div className={styles.muted}>{SERIES[article.series].label} · {articleReadTime(article)} min read</div></td>
          <td className={styles.nowrap}>/learn/{article.slug}</td>
          <td className={styles.nowrap}>{articleDate(article.published)}</td>
          <td>{counts.approved} published{counts.pending ? <div><Link href={`/admin/comments?slug=${article.slug}`}>{counts.pending} pending</Link></div> : null}</td>
          <td>{hidden ? <Badge value="hidden" label="withdrawn" /> : <Badge value="published" />}</td>
        </tr>;
      })}</tbody>
    </table></div>}
    <section className={styles.panel} style={{ marginTop: 20 }}><h2>Adding or editing an article</h2>
      <div className={styles.prose}><p>Write or change the article in <code>content/learn/&lt;slug&gt;.ts</code>, add it to the list in <code>lib/learn.ts</code>, and open a pull request. The release puts it live. Keep an existing slug unchanged: it is the article&apos;s public URL and inbound links depend on it. A draft is simply an article file not yet added to that list.</p></div>
    </section>
  </>;
}
