export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { ExportLeads } from "@/components/admin/actions";
import { Badge, Empty, Header, LoadError, Pager, params, query, when, type SearchParams } from "@/components/admin/ui";
import { LEAD_STATUSES, leadSources, listLeads } from "@/lib/admin-data";
import { ROLES } from "@/lib/roles";
import { intParam, staffPage } from "@/lib/staff";

export const metadata: Metadata = { title: "Leads" };

export default async function Leads({ searchParams }: { searchParams: SearchParams }) {
  await staffPage("leads", "/admin/leads");
  const q = await params(searchParams);
  const filter = { q: q.q, role: q.role, source: q.source, consent: q.consent, status: q.status, page: intParam(q.page, 1) };
  let list: ReturnType<typeof listLeads> | null = null;
  let sources: string[] = [];
  try { list = listLeads(filter); sources = leadSources(); } catch { list = null; }
  const exportFilter = Object.fromEntries(Object.entries({ q: q.q, role: q.role, source: q.source, consent: q.consent, status: q.status }).filter(([, value]) => value)) as Record<string, string>;
  return <>
    <Header title="Leads" intro="Waiting-list sign-ups from the website (for example the members' room list). Separate from enquiries: a lead asked to be kept informed, not to start a project.">
      <ExportLeads filter={exportFilter} />
    </Header>
    <form className={styles.filters} method="get" role="search" aria-label="Filter leads">
      <label>Search<input name="q" defaultValue={filter.q} placeholder="Name or email" maxLength={100} /></label>
      <label>Describes themself as<select name="role" defaultValue={filter.role}><option value="">Any</option>{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></label>
      <label>Source<select name="source" defaultValue={filter.source}><option value="">Any</option>{sources.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
      <label>Consent<select name="consent" defaultValue={filter.consent}><option value="">Any</option><option value="whatsapp">WhatsApp consent given</option></select></label>
      <label>Status<select name="status" defaultValue={filter.status}><option value="">Any</option>{LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
      <button className={styles.button}>Apply</button>
      <Link href="/admin/leads" className={`${styles.button} ${styles.secondary}`}>Reset</Link>
    </form>
    <p className={styles.muted} style={{ marginBottom: 10 }}>Exports leave out WhatsApp numbers for people who did not consent to WhatsApp contact. Every export is recorded in the audit log.</p>
    {!list ? <LoadError what="Leads" /> : !list.rows.length ? <div className={styles.tableWrap}><Empty>{list.total === 0 && !Object.keys(exportFilter).length ? "No leads have been collected yet." : "No leads match these filters."}</Empty></div> : <>
      <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th scope="col">Joined</th><th scope="col">Lead</th><th scope="col">Describes themself as</th><th scope="col">Source</th><th scope="col">WhatsApp consent</th><th scope="col">Status</th></tr></thead>
        <tbody>{list.rows.map((row) => <tr key={row.id}>
          <td className={styles.nowrap}>{when(row.created_at)}</td>
          <td><Link href={`/admin/leads/${row.id}`}>{row.name || row.email}</Link>{row.name ? <div className={styles.muted}>{row.email}</div> : null}</td>
          <td>{ROLES.find((r) => r.value === row.role)?.label ?? row.role ?? "—"}</td>
          <td>{row.source_slug || "—"}{row.utm_source ? <div className={styles.muted}>utm: {row.utm_source}</div> : null}</td>
          <td>{row.whatsapp_consent ? "Yes" : "No"}</td>
          <td><Badge value={row.status} label={LEAD_STATUSES.find((s) => s.value === row.status)?.label} /></td>
        </tr>)}</tbody>
      </table></div>
      <Pager page={list.page} pages={list.pages} total={list.total} href={(page) => query("/admin/leads", { ...filter, page })} />
    </>}
  </>;
}
