export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { ActionButton } from "@/components/admin/actions";
import { Badge, Empty, Header, LoadError, Pager, params, query, when, type SearchParams } from "@/components/admin/ui";
import { COMMENT_STATUSES, listComments } from "@/lib/admin-data";
import { ARTICLES, getArticle } from "@/lib/learn";
import { intParam, staffPage } from "@/lib/staff";

export const metadata: Metadata = { title: "Comments" };

export default async function Comments({ searchParams }: { searchParams: SearchParams }) {
  const staff = await staffPage("comments", "/admin/comments");
  const q = await params(searchParams);
  const status = q.status === "all" || COMMENT_STATUSES.some((s) => s === q.status) ? q.status : "pending";
  const filter = { status, q: q.q, slug: q.slug, page: intParam(q.page, 1) };
  let list: ReturnType<typeof listComments> | null = null;
  try { list = listComments(filter); } catch { list = null; }
  return <>
    <Header title="Comments" intro="Every comment waits for review before readers can see it. Removing an approved comment hides it from readers and keeps the record." />
    <nav className={styles.actions} style={{ marginBottom: 12 }} aria-label="Comment status">{[...COMMENT_STATUSES, "all" as const].map((value) => <Link key={value} href={query("/admin/comments", { status: value, q: filter.q, slug: filter.slug })} className={`${styles.button} ${value === status ? "" : styles.secondary}`} aria-current={value === status ? "true" : undefined}>{value[0].toUpperCase() + value.slice(1)}</Link>)}</nav>
    <form className={styles.filters} method="get" role="search" aria-label="Filter comments">
      <input type="hidden" name="status" value={status} />
      <label>Search<input name="q" defaultValue={filter.q} placeholder="Comment text or author" maxLength={100} /></label>
      <label>Article<select name="slug" defaultValue={filter.slug}><option value="">All articles</option>{ARTICLES.map((a) => <option key={a.slug} value={a.slug}>{a.question}</option>)}</select></label>
      <button className={styles.button}>Apply</button>
    </form>
    {!list ? <LoadError what="Comments" /> : !list.rows.length ? <div className={styles.tableWrap}><Empty>{status === "pending" && !filter.q && !filter.slug ? "No comments are waiting for review." : "No comments match these filters."}</Empty></div> : <>
      <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th scope="col">Comment</th><th scope="col">Article</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
        <tbody>{list.rows.map((row) => {
          const own = row.reader_id === staff.id;
          const endpoint = `/api/admin/comments/${row.id}`;
          return <tr key={row.id}>
            <td style={{ maxWidth: 520 }}><p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{row.body}</p><div className={styles.muted}>{row.author} · {when(row.created_at)}{row.updated_at !== row.created_at ? ` · edited ${when(row.updated_at)}` : ""}</div></td>
            <td><Link href={`/learn/${row.slug}`}>{getArticle(row.slug)?.question ?? row.slug}</Link></td>
            <td><Badge value={row.status} />{row.moderated_at ? <div className={styles.muted}>{row.moderator ?? "Deleted account"} · {when(row.moderated_at)}</div> : null}</td>
            <td>{own && staff.role !== "admin" ? <span className={styles.muted}>Your comment: another moderator decides</span> : <div className={styles.actions}>
              {row.status === "pending" ? <><ActionButton endpoint={endpoint} body={{ action: "approve" }} label="Approve" variant="primary" done="Comment approved and now visible to readers." /><ActionButton endpoint={endpoint} body={{ action: "reject" }} label="Reject" done="Comment rejected." /></> : null}
              {row.status === "approved" ? <ActionButton endpoint={endpoint} body={{ action: "remove" }} label="Remove" variant="danger" confirm={{ title: "Remove this comment?", text: "It is hidden from readers immediately. The record stays for review.", confirmLabel: "Remove comment" }} done="Comment removed." /> : null}
            </div>}</td>
          </tr>;
        })}</tbody>
      </table></div>
      <Pager page={list.page} pages={list.pages} total={list.total} href={(page) => query("/admin/comments", { ...filter, page })} />
    </>}
  </>;
}
