import Link from "next/link";
import { StatusDot } from "@/components/admin/StatusDot";
import { adminOnly } from "@/lib/admin-guard";
import { listAll } from "@/lib/articles";
import { listAllComments } from "@/lib/comments";
import { listEnquiries, STATUSES } from "@/lib/enquiries";
import { formatShortDate, preview, ROLE_LABEL } from "@/lib/format";
import { listUsers } from "@/lib/users";

const shortId = (id: string) => `VX-${id.slice(0, 4).toUpperCase()}`;
const day = (iso: string) => formatShortDate(iso).replace(/ \d{4}$/, "");

export default async function Dashboard() {
  const session = await adminOnly();
  const [enquiries, articles, comments, users] = await Promise.all([listEnquiries(), listAll(), listAllComments(), listUsers()]);
  const fresh = enquiries.filter((e) => e.status === "new").length;
  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.length - published.length;
  const hour = new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" });
  const greeting = Number(hour) < 12 ? "Good morning" : Number(hour) < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "New enquiries", value: fresh, note: `${enquiries.length} in total`, href: "/admin/enquiries?status=new", hot: fresh > 0 },
    { label: "Published articles", value: published.length, note: drafts ? `${drafts} draft${drafts === 1 ? "" : "s"}` : "No drafts", href: "/admin/articles" },
    { label: "Comments", value: comments.length, note: "on all articles", href: "/admin/comments" },
    { label: "Accounts", value: users.length, note: `${users.filter((u) => u.googleId).length} with Google`, href: "/admin/users" },
  ];

  const setup = [
    { done: !!process.env.GOOGLE_CLIENT_ID, label: "Google sign-in", hint: "Set GOOGLE_CLIENT_ID to show the Google button on the login and signup pages." },
    { done: !!process.env.CONTACT_WEBHOOK_URL, label: "Enquiry emails", hint: "Set CONTACT_WEBHOOK_URL so each enquiry is also emailed. Until then they are only saved here." },
    { done: published.length > 0, label: "A published article", hint: "Readers see published articles on the Articles page." },
    { done: !!process.env.ADMIN_EMAILS, label: "Admin emails", hint: "ADMIN_EMAILS makes those addresses admins when they sign in with Google. Optional." },
  ];

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>{greeting}, {session.name.split(" ")[0]}</h1>
          <p>{fresh > 0 ? `${fresh} enquir${fresh === 1 ? "y is" : "ies are"} waiting for a reply.` : "You're all caught up."}</p>
        </div>
        <div className="adm-head-actions">
          <Link href="/admin/enquiries" className="btn btn--line btn--sm">All enquiries</Link>
          <Link href="/admin/articles/new" className="btn btn--sm">New article</Link>
        </div>
      </header>

      <div className="adm-strip">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`adm-stat${s.hot ? " is-hot" : ""}`}>
            <span>{s.label}</span>
            <strong>{s.value}</strong>
            <small>{s.note}</small>
          </Link>
        ))}
      </div>

      <section className="adm-card" aria-label="Enquiry board">
        <div className="adm-card-head"><h2>Enquiries <em>{enquiries.length}</em></h2><Link href="/admin/enquiries">Open list</Link></div>
        <div className="adm-board">
          {STATUSES.map((s) => {
            const items = enquiries.filter((e) => e.status === s.value);
            return (
              <div key={s.value} className="adm-col">
                <div className="adm-col-head"><StatusDot status={s.value} /> {s.label} <em>{items.length}</em></div>
                {items.slice(0, 5).map((e) => (
                  <Link key={e.id} href={`/admin/enquiries/${e.id}`} className="adm-ticket">
                    <span className="adm-ticket-top"><code>{shortId(e.id)}</code><span>{day(e.at)}</span></span>
                    <strong>{e.name || e.email}</strong>
                    <p>{preview(e.problem, 110)}</p>
                    <span className="adm-tags"><span className="adm-tag">{ROLE_LABEL[e.role] ?? e.role}</span>{e.interest ? <span className="adm-tag">{preview(e.interest, 22)}</span> : null}</span>
                  </Link>
                ))}
                {items.length > 5 ? <Link href={`/admin/enquiries?status=${s.value}`} className="adm-faint">+{items.length - 5} more</Link> : null}
                {items.length === 0 ? <div className="adm-col-empty">Nothing here</div> : null}
              </div>
            );
          })}
        </div>
      </section>

      <div className="adm-cols">
        <section className="adm-card">
          <div className="adm-card-head"><h2>Latest comments</h2><Link href="/admin/comments">View all</Link></div>
          {comments.length === 0 ? <p className="adm-empty">No comments yet.</p> : (
            <ul className="adm-list">
              {comments.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link href="/admin/comments">
                    <span className="avatar-mini" aria-hidden="true">{c.name.charAt(0).toUpperCase()}</span>
                    <span className="main"><strong>{c.name}</strong><small>{preview(c.text, 80)}</small></span>
                    <time dateTime={c.createdAt}>{day(c.createdAt)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="adm-card">
          <div className="adm-card-head"><h2>Articles</h2><Link href="/admin/articles">Manage</Link></div>
          <ul className="adm-list">
            {articles.slice(0, 5).map((a) => (
              <li key={a.id}>
                <Link href={`/admin/articles/${a.id}`}>
                  <span className={`adm-badge adm-badge--${a.status}`}>{a.status === "published" ? "Live" : "Draft"}</span>
                  <span className="main"><strong>{a.title}</strong><small>{a.category} · {comments.filter((c) => c.slug === a.slug).length} comments</small></span>
                  <time dateTime={a.date}>{day(a.date + "T00:00:00Z")}</time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="adm-card">
        <div className="adm-card-head"><h2>Setup</h2><span className="adm-faint">{setup.filter((s) => s.done).length} of {setup.length} done</span></div>
        <ul className="adm-setup">
          {setup.map((s) => (
            <li key={s.label} className={s.done ? "is-done" : ""}>
              <span aria-hidden="true">✓</span>
              <div><strong>{s.label}</strong><small>{s.done ? "Connected" : s.hint}</small></div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
