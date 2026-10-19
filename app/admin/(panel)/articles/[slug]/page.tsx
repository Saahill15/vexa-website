export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";
import { ActionButton } from "@/components/admin/actions";
import { Badge, Header, LoadError, when } from "@/components/admin/ui";
import { hiddenSlugs } from "@/lib/article-state";
import { AUDIT_LABELS, auditFor } from "@/lib/audit";
import { getArticle, SERIES, articleDate, type Step } from "@/lib/learn";
import { staffPage } from "@/lib/staff";

export const metadata: Metadata = { title: "Article" };

function Sections({ steps }: { steps: Step[] }) {
  return <div className={styles.prose}>{steps.map((step, index) => <section key={step.title || index}>{step.title ? <h3>{step.title}</h3> : null}{step.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}{step.doThisNow ? <p><strong>Apply the idea:</strong> {step.doThisNow}</p> : null}</section>)}</div>;
}

export default async function ArticleAdmin({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  await staffPage("articles", `/admin/articles/${encodeURIComponent(slug)}`);
  const article = getArticle(slug);
  if (!article) notFound();
  let state: { hidden: boolean; history: ReturnType<typeof auditFor> } | null = null;
  try { state = { hidden: hiddenSlugs().has(slug), history: auditFor("article", slug) }; } catch { state = null; }
  const endpoint = `/api/admin/articles/${slug}`;
  return <>
    <Header title={article.question} intro={`${SERIES[article.series].label} · published ${articleDate(article.published)} · /learn/${article.slug}`} back={{ href: "/admin/articles", label: "Articles" }}>
      {state ? (state.hidden ? <Badge value="hidden" label="withdrawn" /> : <Badge value="published" />) : null}
      <Link className={`${styles.button} ${styles.secondary}`} href={`/learn/${article.slug}`}>Open public page</Link>
    </Header>
    {!state ? <LoadError what="Article status" /> : <div className={styles.two}>
      <div>
        <section className={styles.panel}><h2>Summary</h2><p>{article.answer}</p></section>
        <section className={styles.panel}><h2>Public introduction</h2><Sections steps={article.free} /></section>
        <section className={styles.panel}><h2>Full article (signed-in readers)</h2><Sections steps={article.full} /></section>
      </div>
      <div>
        <section className={styles.panel}><h2>Visibility</h2>
          <p style={{ marginBottom: 12 }}>{state.hidden ? "Withdrawn: the URL returns “not found” and the article is absent from the article list and sitemap. Comments are kept." : "Published: listed on /learn and in the sitemap."}</p>
          {state.hidden
            ? <ActionButton endpoint={endpoint} body={{ hidden: false }} label="Publish again" variant="primary" done="Article published again." />
            : <ActionButton endpoint={endpoint} body={{ hidden: true }} label="Withdraw from the website" variant="danger" confirm={{ title: "Withdraw this article?", text: "Visitors and search engines will get “not found” at this URL until you publish it again. Links elsewhere on the site, such as the homepage feature, are not changed automatically.", confirmLabel: "Withdraw article" }} done="Article withdrawn." />}
        </section>
        <section className={styles.panel}><h2>History</h2>
          {state.history.length ? <ul className={styles.history}>{state.history.map((row) => <li key={row.id}>{AUDIT_LABELS[row.action] ?? row.action}<div className={styles.muted}>{row.actor_label} · {when(row.at)}</div></li>)}</ul> : <p className={styles.muted}>No visibility changes recorded.</p>}
        </section>
      </div>
    </div>}
  </>;
}
