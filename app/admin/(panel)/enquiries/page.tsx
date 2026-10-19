export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { ActionButton } from "@/components/admin/actions";
import { Badge, Empty, Header, LoadError, Pager, params, query, when, type SearchParams } from "@/components/admin/ui";
import { listEnquiries } from "@/lib/admin-data";
import { ENQUIRY_STATUSES, scanFallback } from "@/lib/enquiries";
import { intParam, staffPage } from "@/lib/staff";

export const metadata: Metadata = { title: "Enquiries" };
const AUDIENCE: Record<string, string> = { brand: "Brand", organisation: "Esports business", other: "Creator / other" };

export default async function Enquiries({ searchParams }: { searchParams: SearchParams }) {
  await staffPage("enquiries", "/admin/enquiries");
  const q = await params(searchParams);
  const filter = { q: q.q, status: q.status, from: q.from, to: q.to, sort: q.sort === "oldest" ? "oldest" : "newest", page: intParam(q.page, 1) };
  let list: ReturnType<typeof listEnquiries> | null = null;
  let fallback: ReturnType<typeof scanFallback> | null = null;
  try { list = listEnquiries(filter); } catch { list = null; }
  try { fallback = scanFallback(); } catch { fallback = null; }
  const href = (page: number) => query("/admin/enquiries", { ...filter, page });

  return <>
    <Header title="Enquiries" intro="Every message sent through the contact form and the team programme form." />
    {fallback === null ? <p role="alert" className={styles.errorState}>The fallback file could not be checked. Submissions saved there while the database was unavailable may be missing from this list.</p> : null}
    {fallback && (fallback.pending.length || fallback.unreadable) ? <div role="alert" className={styles.warn}>
      <p><strong>{fallback.pending.length} {fallback.pending.length === 1 ? "submission was" : "submissions were"} saved to the fallback file</strong> because the database was unavailable at the time, and {fallback.pending.length === 1 ? "is" : "are"} not yet in this list.{fallback.unreadable ? ` ${fallback.unreadable} line(s) in the file could not be read and need a manual check on the server.` : ""}</p>
      {fallback.pending.length ? <><ul className={styles.history} style={{ margin: "10px 0" }}>{fallback.pending.slice(0, 5).map((line) => <li key={line.key}>{line.entry.name || line.entry.email} · {when(line.entry.at)}</li>)}</ul>
      <ActionButton endpoint="/api/admin/enquiries/import-fallback" body={{}} label="Import into the enquiry list" variant="primary" done="Fallback submissions imported." /></> : null}
    </div> : null}
    <form className={styles.filters} method="get" role="search" aria-label="Filter enquiries">
      <label>Search<input name="q" defaultValue={filter.q} placeholder="Name, email or company" maxLength={100} /></label>
      <label>Status<select name="status" defaultValue={filter.status}><option value="">All</option><option value="open">Open (not resolved)</option>{ENQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
      <label>From<input type="date" name="from" defaultValue={filter.from} /></label>
      <label>To<input type="date" name="to" defaultValue={filter.to} /></label>
      <label>Sort<select name="sort" defaultValue={filter.sort}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
      <button className={styles.button}>Apply</button>
      <Link href="/admin/enquiries" className={`${styles.button} ${styles.secondary}`}>Reset</Link>
    </form>
    {!list ? <LoadError what="Enquiries" /> : !list.rows.length ? <div className={styles.tableWrap}><Empty>{list.total === 0 && !filter.q && !filter.status && !filter.from && !filter.to ? "No enquiries have been received yet." : "No enquiries match these filters."}</Empty></div> : <>
      <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th scope="col">Received</th><th scope="col">From</th><th scope="col">Audience</th><th scope="col">Message</th><th scope="col">Status</th><th scope="col">Owner</th></tr></thead>
        <tbody>{list.rows.map((row) => <tr key={row.id}>
          <td className={styles.nowrap}>{when(row.created_at)}</td>
          <td><Link href={`/admin/enquiries/${row.id}`}>{row.name || row.email}</Link><div className={styles.muted}>{row.name ? row.email : ""}{row.company ? `${row.name ? " · " : ""}${row.company}` : ""}</div></td>
          <td>{AUDIENCE[row.role ?? ""] ?? row.role ?? "—"}{row.interest ? <div className={styles.muted}>{row.interest}</div> : null}</td>
          <td><div className={styles.excerpt}>{row.problem}</div>{row.webhook_status === "failed" ? <Badge value="failed" label="notification failed" /> : null}{row.origin === "fallback-file" ? <> <Badge value="neutral" label="from fallback file" /></> : null}</td>
          <td><Badge value={row.status} label={ENQUIRY_STATUSES.find((s) => s.value === row.status)?.label} /></td>
          <td>{row.assignee ?? <span className={styles.muted}>Unassigned</span>}</td>
        </tr>)}</tbody>
      </table></div>
      <Pager page={list.page} pages={list.pages} total={list.total} href={href} />
    </>}
  </>;
}
