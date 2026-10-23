import { StatusDot } from "@/components/admin/StatusDot";
import { adminOnly } from "@/lib/admin-guard";
import Link from "next/link";
import { setEnquiryStatusAction } from "@/app/admin/actions";
import { listEnquiries, STATUSES } from "@/lib/enquiries";
import { formatDateTime, preview, ROLE_LABEL } from "@/lib/format";

export const metadata = { title: "Enquiries" };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; deleted?: string }> }) {
  await adminOnly();
  const { status = "all", q = "", deleted } = await searchParams;
  const all = await listEnquiries();
  const needle = q.trim().toLowerCase();
  const shown = all
    .filter((e) => status === "all" || e.status === status)
    .filter((e) => !needle || `${e.name ?? ""} ${e.email} ${e.company ?? ""} ${e.problem} ${e.interest ?? ""}`.toLowerCase().includes(needle))
    .slice(0, 300);
  const count = (s: string) => (s === "all" ? all.length : all.filter((e) => e.status === s).length);
  const tabs = [{ value: "all", label: "All" }, ...STATUSES];

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div><h1>Enquiries</h1><p>Messages sent through the contact form.</p></div>
        <a href="/admin/enquiries/export" className="btn btn--sm btn--line">Export CSV</a>
      </header>
      {deleted ? <p className="adm-note">Enquiry deleted.</p> : null}

      <div className="adm-toolbar">
        <nav className="adm-tabs" aria-label="Filter by status">
          {tabs.map((t) => (
            <Link key={t.value} href={`/admin/enquiries?status=${t.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`} aria-current={status === t.value ? "page" : undefined}>
              {t.label} <span>{count(t.value)}</span>
            </Link>
          ))}
        </nav>
        <form className="adm-search" action="/admin/enquiries">
          <input type="hidden" name="status" value={status} />
          <input className="in" type="search" name="q" defaultValue={q} placeholder="Search name, email or message" aria-label="Search enquiries" />
        </form>
      </div>

      {shown.length === 0 ? (
        <p className="adm-empty adm-card">{all.length === 0 ? "No enquiries yet. They appear here when someone sends the contact form." : "No enquiries match that filter."}</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Received</th><th>From</th><th>About</th><th>Message</th><th>Status</th></tr></thead>
            <tbody>
              {shown.map((e) => (
                <tr key={e.id}>
                  <td className="nowrap">{formatDateTime(e.at)}</td>
                  <td><div className="adm-who"><StatusDot status={e.status} /><div><Link href={`/admin/enquiries/${e.id}`}><strong>{e.name || e.email}</strong></Link>{e.name ? <small>{e.email}</small> : null}{e.company ? <small>{e.company}</small> : null}</div></div></td>
                  <td>{ROLE_LABEL[e.role] ?? e.role}{e.interest ? <small>{e.interest}</small> : null}</td>
                  <td className="adm-msg">{preview(e.problem, 110)}</td>
                  <td>
                    <form action={setEnquiryStatusAction} className="adm-inline">
                      <input type="hidden" name="id" value={e.id} />
                      <select name="status" defaultValue={e.status} aria-label={`Status for ${e.name || e.email}`}>
                        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <button type="submit" className="adm-mini">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
