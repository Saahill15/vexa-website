import Link from "next/link";
import { StatusDot } from "@/components/admin/StatusDot";
import { adminOnly } from "@/lib/admin-guard";
import { AUDIT_ACTIONS, queryAudit, type AuditAction } from "@/lib/audit";
import { listAll } from "@/lib/articles";
import { listAllComments } from "@/lib/comments";
import { listEnquiries, STATUSES, type EnquiryStatus } from "@/lib/enquiries";
import { ago, formatShortDate, ROLE_LABEL, preview } from "@/lib/format";
import { inboxBadges } from "@/lib/inbox";
import { listUsers } from "@/lib/users";

export const metadata = { title: "Dashboard" };

const shortId = (id: string) => `VX-${id.slice(0, 4).toUpperCase()}`;
const DAY = 86_400_000;
/** "3 days ago" for recent things, the date for anything older than a month. */
const when = (iso: string) => ago(iso) || formatShortDate(iso);

export default async function Dashboard() {
  const session = await adminOnly();
  const [enquiries, articles, comments, users, badges, recent] = await Promise.all([
    listEnquiries(),
    listAll(),
    listAllComments(),
    listUsers(),
    inboxBadges(session.id).catch(() => ({ unread: 0, newEnquiries: 0 })),
    queryAudit({ group: "all", range: "week", page: 1, perPage: 8 }).catch(() => ({ rows: [], total: 0 })),
  ]);

  const now = Date.now();
  const byStatus = (s: EnquiryStatus) => enquiries.filter((e) => e.status === s);
  const fresh = byStatus("new").length;
  const open = enquiries.filter((e) => e.status !== "resolved");
  const weekEnq = enquiries.filter((e) => now - Date.parse(e.at) < 7 * DAY).length;
  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.length - published.length;
  const newAccounts = users.filter((u) => now - Date.parse(u.createdAt) < 7 * DAY).length;
  const hour = Number(new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const oldestNew = byStatus("new").map((e) => Date.parse(e.at)).sort((a, b) => a - b)[0];

  // enquiries that need attention come first: new, then waiting, then in progress, oldest within each group first
  const rank: Record<EnquiryStatus, number> = { new: 0, waiting: 1, in_progress: 2, resolved: 3 };
  const queue = [...open].sort((a, b) => rank[a.status] - rank[b.status] || Date.parse(a.at) - Date.parse(b.at)).slice(0, 6);

  const tiles = [
    { label: "Need a reply", value: fresh, note: fresh ? `oldest is ${when(new Date(oldestNew).toISOString())}` : "all caught up", href: "/admin/enquiries?status=new", hot: fresh > 0 },
    { label: "Unread in the inbox", value: badges.unread, note: "mail, enquiries, comments and sign-ups", href: "/admin/inbox" },
    { label: "Enquiries this week", value: weekEnq, note: `${enquiries.length} in total`, href: "/admin/enquiries" },
    { label: "Articles live", value: published.length, note: drafts ? `${drafts} draft${drafts === 1 ? "" : "s"} waiting` : "no drafts", href: "/admin/articles" },
    { label: "Accounts", value: users.length, note: newAccounts ? `${newAccounts} new this week` : "none new this week", href: "/admin/users" },
  ];

  return (
    <div className="adm-page dash">
      <header className="adm-head">
        <div>
          <h1>{greeting}, {session.name.split(" ")[0]}</h1>
          <p>{fresh > 0 ? `${fresh} enquir${fresh === 1 ? "y is" : "ies are"} waiting for a first reply.` : "Every enquiry has had a first reply."}</p>
        </div>
        <div className="adm-head-actions">
          <Link href="/admin/inbox" className="btn btn--line btn--sm">Open inbox</Link>
          <Link href="/admin/articles/new" className="btn btn--sm">New article</Link>
        </div>
      </header>

      <div className="dash-tiles">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className={`dash-tile${t.hot ? " is-hot" : ""}`}>
            <span>{t.label}</span>
            <strong>{t.value}</strong>
            <small>{t.note}</small>
          </Link>
        ))}
      </div>

      <div className="dash-main">
        <section className="adm-card dash-enq" aria-labelledby="enq-h">
          <div className="adm-card-head">
            <h2 id="enq-h">Enquiries to deal with</h2>
            <Link href="/admin/enquiries">View all {enquiries.length}</Link>
          </div>
          <div className="dash-chips" role="list">
            {STATUSES.map((s) => (
              <Link key={s.value} href={`/admin/enquiries?status=${s.value}`} className="dash-chip" role="listitem">
                <StatusDot status={s.value} /> {s.label} <b>{byStatus(s.value).length}</b>
              </Link>
            ))}
          </div>
          {queue.length ? (
            <ul className="dash-queue">
              {queue.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries/${e.id}`}>
                    <span className="dash-q-status"><StatusDot status={e.status} /></span>
                    <span className="dash-q-main">
                      <strong>{e.name || e.email}</strong>
                      <small>{preview(e.problem, 96)}</small>
                      <em>{ROLE_LABEL[e.role] ?? e.role}{e.interest ? ` · ${preview(e.interest, 36)}` : ""}</em>
                    </span>
                    <span className="dash-q-when"><code>{shortId(e.id)}</code><time dateTime={e.at}>{when(e.at)}</time></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adm-empty">Nothing open. New enquiries from the website appear here.</p>
          )}
          {open.length > queue.length ? <Link className="dash-more" href="/admin/enquiries">+{open.length - queue.length} more open</Link> : null}
        </section>

        <section className="adm-card dash-act" aria-labelledby="act-h">
          <div className="adm-card-head">
            <h2 id="act-h">Recent activity</h2>
            <Link href="/admin/logs">Open the log</Link>
          </div>
          {recent.rows.length ? (
            <ul className="dash-feed">
              {recent.rows.map((r) => (
                <li key={r.id}>
                  <span className="dash-feed-dot" aria-hidden="true" />
                  <span className="dash-feed-main">
                    <strong>{AUDIT_ACTIONS[r.action as AuditAction] ?? r.action}</strong>
                    <small>{r.actor || "Not signed in"}{r.target ? ` · ${preview(r.target, 40)}` : ""}</small>
                  </span>
                  <time dateTime={r.at}>{when(r.at)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adm-empty">Sign-ins and changes will be listed here.</p>
          )}
        </section>
      </div>

      <div className="dash-row">
        <section className="adm-card" aria-labelledby="art-h">
          <div className="adm-card-head"><h2 id="art-h">Articles</h2><Link href="/admin/articles">Manage</Link></div>
          {articles.length ? (
            <ul className="adm-list">
              {articles.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/articles/${a.id}`}>
                    <span className={`adm-badge adm-badge--${a.status}`}>{a.status === "published" ? "Live" : "Draft"}</span>
                    <span className="main"><strong>{a.title}</strong><small>{a.category} · {comments.filter((c) => c.slug === a.slug).length} comments</small></span>
                    <time dateTime={a.date}>{when(a.date + "T00:00:00Z")}</time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adm-empty">No articles yet. <Link href="/admin/articles/new">Write the first one.</Link></p>
          )}
        </section>

        <section className="adm-card" aria-labelledby="com-h">
          <div className="adm-card-head"><h2 id="com-h">Latest comments</h2><Link href="/admin/comments">View all</Link></div>
          {comments.length ? (
            <ul className="adm-list">
              {comments.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link href="/admin/comments">
                    <span className="avatar-mini" aria-hidden="true">{c.name.charAt(0).toUpperCase()}</span>
                    <span className="main"><strong>{c.name}</strong><small>{preview(c.text, 80)}</small></span>
                    <time dateTime={c.createdAt}>{when(c.createdAt)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adm-empty">No comments yet. Readers who sign in can comment on articles.</p>
          )}
        </section>

        <section className="adm-card" aria-labelledby="usr-h">
          <div className="adm-card-head"><h2 id="usr-h">New accounts</h2><Link href="/admin/users">All accounts</Link></div>
          <ul className="adm-list">
            {[...users].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5).map((u) => (
              <li key={u.id}>
                <Link href="/admin/users">
                  <span className="avatar-mini" aria-hidden="true">{u.name.charAt(0).toUpperCase()}</span>
                  <span className="main"><strong>{u.name}</strong><small>{u.googleId ? "Google" : "Email"}{u.role === "admin" ? " · Admin" : ""}</small></span>
                  <time dateTime={u.createdAt}>{when(u.createdAt)}</time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
