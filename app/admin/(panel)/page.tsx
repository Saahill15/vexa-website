export const dynamic = "force-dynamic";
import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { Badge, Empty, Header, LoadError, params, when, type SearchParams } from "@/components/admin/ui";
import { dashboardStats, listEnquiries, moderatorStats, recentAudit } from "@/lib/admin-data";
import { AUDIT_LABELS } from "@/lib/audit";
import { staffPage } from "@/lib/staff";

const PERIODS = [7, 30, 90];

export default async function Dashboard({ searchParams }: { searchParams: SearchParams }) {
  const staff = await staffPage("dashboard");
  const query = await params(searchParams);
  const denied = query.denied === "1" ? <p role="alert" className={styles.warn}>Your role does not include that area.</p> : null;
  const nudge = staff.secondFactor === "optional" ? <p className={styles.info}>Protect your staff account with a code from your phone. <Link href="/admin/security">Set up two-step sign-in</Link>.</p> : null;

  if (staff.role === "moderator") {
    let pending: number | null = null;
    try { pending = moderatorStats().pendingComments; } catch { /* shown below */ }
    return <>
      <Header title="Overview" intro="Your role covers comment moderation." />
      {denied}
      {nudge}
      {pending === null ? <LoadError what="Comment counts" /> : <div className={styles.grid}><Link className={styles.stat} href="/admin/comments"><span className={styles.label}>Pending comments</span><b>{pending}</b><small>Waiting for review</small></Link></div>}
    </>;
  }

  const period = PERIODS.includes(Number(query.period)) ? Number(query.period) : 30;
  let data: { stats: ReturnType<typeof dashboardStats>; recent: ReturnType<typeof listEnquiries>; audit: ReturnType<typeof recentAudit> } | null = null;
  try {
    data = { stats: dashboardStats(period), recent: listEnquiries({ status: "new", sort: "newest", page: 1 }), audit: recentAudit(8) };
  } catch {
    data = null;
  }

  return <>
    <Header title="Overview" intro="Live figures from the website database. The site has no visitor analytics, so none are shown.">
      <nav className={styles.actions} aria-label="Period">{PERIODS.map((days) => <Link key={days} href={`/admin?period=${days}`} className={`${styles.button} ${days === period ? "" : styles.secondary}`} aria-current={days === period ? "true" : undefined}>{days} days</Link>)}</nav>
    </Header>
    {denied}
    {nudge}
    {!data ? <LoadError what="The overview" /> : <>
      {data.stats.fallbackPending ? <p role="alert" className={styles.warn}><strong>{data.stats.fallbackPending} enquiry {data.stats.fallbackPending === 1 ? "submission is" : "submissions are"} in the fallback file and not yet in the enquiry list.</strong> <Link href="/admin/enquiries">Review and import them</Link>.</p> : null}
      {data.stats.failedNotifications ? <p className={styles.info}>{data.stats.failedNotifications} saved {data.stats.failedNotifications === 1 ? "enquiry" : "enquiries"} could not be forwarded to the notification webhook. {data.stats.failedNotifications === 1 ? "It is" : "They are"} safe in the database; <Link href="/admin/enquiries">check them in the list</Link>.</p> : null}
      <div className={styles.grid}>
        <Link className={styles.stat} href="/admin/enquiries?status=new"><span className={styles.label}>New enquiries</span><b>{data.stats.newEnquiries}</b><small>{data.stats.openEnquiries} open · {data.stats.enquiries} total</small></Link>
        <Link className={styles.stat} href="/admin/enquiries"><span className={styles.label}>Enquiries, {period} days</span><b>{data.stats.periodEnquiries}</b><small>Received in the period</small></Link>
        <Link className={styles.stat} href="/admin/users"><span className={styles.label}>Registered users</span><b>{data.stats.users}</b><small>{data.stats.newUsers} new in {period} days</small></Link>
        <Link className={styles.stat} href="/admin/leads"><span className={styles.label}>Leads</span><b>{data.stats.leads}</b><small>{data.stats.periodLeads} new in {period} days</small></Link>
        <Link className={styles.stat} href="/admin/articles"><span className={styles.label}>Published articles</span><b>{data.stats.publishedArticles}</b><small>{data.stats.hiddenArticles ? `${data.stats.hiddenArticles} withdrawn` : "None withdrawn"}</small></Link>
        <Link className={styles.stat} href="/admin/comments"><span className={styles.label}>Pending comments</span><b>{data.stats.pendingComments}</b><small>Waiting for review</small></Link>
      </div>
      <div className={styles.two}>
        <section className={styles.panel}><h2>New enquiries needing attention</h2>
          {data.recent.rows.length ? <ul className={styles.history}>{data.recent.rows.slice(0, 8).map((row) => <li key={row.id}><Link href={`/admin/enquiries/${row.id}`}>{row.name || row.email}</Link>{row.company ? ` · ${row.company}` : ""} <span className={styles.muted}>· {when(row.created_at)}</span></li>)}</ul> : <Empty>No new enquiries. Everything received has been picked up.</Empty>}
        </section>
        <section className={styles.panel}><h2>Recent administrative activity</h2>
          {data.audit.length ? <ul className={styles.history}>{data.audit.map((row) => <li key={row.id}><Badge value="neutral" label={AUDIT_LABELS[row.action] ?? row.action} /> <span className={styles.muted}>{row.actor_label} · {when(row.at)}</span></li>)}</ul> : <Empty>No administrative actions recorded yet.</Empty>}
          <p style={{ marginTop: 12 }}><Link href="/admin/audit">Full audit log</Link></p>
        </section>
      </div>
    </>}
  </>;
}
