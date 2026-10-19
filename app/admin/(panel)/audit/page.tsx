export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { Empty, Header, LoadError, Pager, params, query, when, type SearchParams } from "@/components/admin/ui";
import { listAudit } from "@/lib/admin-data";
import { AUDIT_LABELS } from "@/lib/audit";
import { intParam, staffPage } from "@/lib/staff";

export const metadata: Metadata = { title: "Audit log" };
const AREAS = [{ value: "auth", label: "Sign-in" }, { value: "enquiry", label: "Enquiries" }, { value: "lead", label: "Leads" }, { value: "user", label: "Accounts" }, { value: "comment", label: "Comments" }, { value: "article", label: "Articles" }, { value: "settings", label: "Settings" }, { value: "admin", label: "Access refused" }];
const TARGET_LINK: Record<string, string> = { enquiry: "/admin/enquiries/", lead: "/admin/leads/", user: "/admin/users/", article: "/admin/articles/" };

export default async function Audit({ searchParams }: { searchParams: SearchParams }) {
  await staffPage("audit", "/admin/audit");
  const q = await params(searchParams);
  const filter = { action: AREAS.some((a) => a.value === q.action) ? q.action : "", actor: q.actor, page: intParam(q.page, 1) };
  let list: ReturnType<typeof listAudit> | null = null;
  try { list = listAudit(filter); } catch { list = null; }
  return <>
    <Header title="Audit log" intro="Append-only record of staff sign-ins and administrative changes. Entries cannot be edited or deleted from the application." />
    <form className={styles.filters} method="get" role="search" aria-label="Filter audit log">
      <label>Area<select name="action" defaultValue={filter.action}><option value="">All</option>{AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select></label>
      <label>Actor<input name="actor" defaultValue={filter.actor} placeholder="Email" maxLength={100} /></label>
      <button className={styles.button}>Apply</button>
      <Link href="/admin/audit" className={`${styles.button} ${styles.secondary}`}>Reset</Link>
    </form>
    {!list ? <LoadError what="The audit log" /> : !list.rows.length ? <div className={styles.tableWrap}><Empty>No audit entries match.</Empty></div> : <>
      <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th scope="col">When</th><th scope="col">Actor</th><th scope="col">Action</th><th scope="col">Record</th><th scope="col">Details</th></tr></thead>
        <tbody>{list.rows.map((row) => <tr key={row.id}>
          <td className={styles.nowrap}>{when(row.at)}</td>
          <td>{row.actor_label}</td>
          <td>{AUDIT_LABELS[row.action] ?? row.action}</td>
          <td>{row.target_type && row.target_id ? (TARGET_LINK[row.target_type] ? <Link href={`${TARGET_LINK[row.target_type]}${encodeURIComponent(row.target_id)}`}>{row.target_type} {row.target_type === "user" ? row.target_id.slice(0, 8) : row.target_id}</Link> : `${row.target_type} ${row.target_id.slice(0, 8)}`) : "—"}</td>
          <td className={styles.muted}>{row.metadata ? Object.entries(JSON.parse(row.metadata) as Record<string, unknown>).map(([key, value]) => `${key}: ${String(value)}`).join(", ") : ""}</td>
        </tr>)}</tbody>
      </table></div>
      <Pager page={list.page} pages={list.pages} total={list.total} href={(page) => query("/admin/audit", { ...filter, page })} />
    </>}
  </>;
}
