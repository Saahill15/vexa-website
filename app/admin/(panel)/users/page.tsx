export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { Badge, Empty, Header, LoadError, Pager, params, query, when, type SearchParams } from "@/components/admin/ui";
import { listUsers } from "@/lib/admin-data";
import { intParam, staffPage } from "@/lib/staff";

export const metadata: Metadata = { title: "Users" };

export default async function Users({ searchParams }: { searchParams: SearchParams }) {
  await staffPage("users", "/admin/users");
  const q = await params(searchParams);
  const filter = { q: q.q, status: q.status, page: intParam(q.page, 1) };
  let list: ReturnType<typeof listUsers> | null = null;
  try { list = listUsers(filter); } catch { list = null; }
  return <>
    <Header title="Users" intro="Reader accounts on the website. Passwords and sign-in tokens are never shown." />
    <form className={styles.filters} method="get" role="search" aria-label="Filter users">
      <label>Search<input name="q" defaultValue={filter.q} placeholder="Email or display name" maxLength={100} /></label>
      <label>Show<select name="status" defaultValue={filter.status}><option value="">All accounts</option><option value="active">Active</option><option value="disabled">Disabled</option><option value="unverified">Email not verified</option><option value="staff">Staff</option></select></label>
      <button className={styles.button}>Apply</button>
      <Link href="/admin/users" className={`${styles.button} ${styles.secondary}`}>Reset</Link>
    </form>
    {!list ? <LoadError what="Users" /> : !list.rows.length ? <div className={styles.tableWrap}><Empty>{list.total === 0 && !filter.q && !filter.status ? "No accounts have been registered yet." : "No accounts match these filters."}</Empty></div> : <>
      <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th scope="col">Account</th><th scope="col">Registered</th><th scope="col">Sign-in</th><th scope="col">Profile</th><th scope="col">Status</th><th scope="col">Comments</th></tr></thead>
        <tbody>{list.rows.map((row) => <tr key={row.id}>
          <td><Link href={`/admin/users/${row.id}`}>{row.email}</Link><div className={styles.muted}>{row.name || "No display name"}</div></td>
          <td className={styles.nowrap}>{when(row.created_at)}</td>
          <td>{[row.has_password ? "Password" : "", row.has_google ? "Google" : ""].filter(Boolean).join(" + ") || "—"}{!row.email_verified ? <div className={styles.muted}>Email not verified</div> : null}</td>
          <td>{row.name && row.role ? "Complete" : "Incomplete"}</td>
          <td>{row.disabled_at ? <Badge value="disabled" /> : <Badge value="active" />} {row.admin ? <Badge value="neutral" label="administrator" /> : row.moderator ? <Badge value="neutral" label="moderator" /> : null}</td>
          <td>{row.comments}</td>
        </tr>)}</tbody>
      </table></div>
      <Pager page={list.page} pages={list.pages} total={list.total} href={(page) => query("/admin/users", { ...filter, page })} />
    </>}
  </>;
}
