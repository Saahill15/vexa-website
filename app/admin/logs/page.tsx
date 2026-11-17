import Link from "next/link";
import { adminOnly } from "@/lib/admin-guard";
import { AUDIT_ACTIONS, AUDIT_GROUPS, AUDIT_RANGES, auditStats, queryAudit, type AuditAction } from "@/lib/audit";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Activity log" };
const PER_PAGE = 50;

import { banIpAction, unbanIpAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { currentIp, ipKey, isV6, listBanned } from "@/lib/ipblock";

type SP = { group?: string; range?: string; q?: string; page?: string; ban?: string };
const BAN_NOTE: Record<string, string> = { done: "Address banned.", lifted: "Address allowed again.", self: "That is the address you are using now, so it was not banned.", invalid: "That is not a valid address." };

/** What the ip and browser columns say, shortened for the table. */
const browser = (ua: string) => (/Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : ua ? "Other" : "");
const device = (ua: string) => (/iPhone|iPad|Android|Mobile/i.test(ua) ? "phone" : ua ? "computer" : "");

const tone = (a: string) => (a.endsWith("failed") ? "bad" : a === "auth.idle" ? "warn" : a.endsWith("delete") || a === "auth.account_deleted" ? "warn" : a.startsWith("auth.") ? "calm" : "info");

export default async function LogsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await adminOnly();
  const sp = await searchParams;
  const group = AUDIT_GROUPS.some((g) => g.key === sp.group) ? sp.group! : "all";
  const range = AUDIT_RANGES.some((r) => r.key === sp.range) ? sp.range! : "week";
  const q = (sp.q ?? "").slice(0, 80);
  const page = Math.max(parseInt(sp.page ?? "1", 10) || 1, 1);
  const [{ rows, total }, stats, banned, mine] = await Promise.all([queryAudit({ group, range, q, page, perPage: PER_PAGE }), auditStats(), listBanned().catch(() => []), currentIp()]);
  const myKey = ipKey(mine);
  const bannedKeys = new Set(banned.map((b) => b.key));
  const pages = Math.max(Math.ceil(total / PER_PAGE), 1);
  const href = (over: Partial<SP>) => {
    const p = new URLSearchParams();
    const m = { group, range, q, ...over };
    for (const [k, v] of Object.entries(m)) if (v && !(k === "group" && v === "all") && !(k === "page" && v === "1")) p.set(k, String(v));
    const s = p.toString();
    return `/admin/logs${s ? `?${s}` : ""}`;
  };
  const exportHref = `/admin/logs/export?${new URLSearchParams({ group, range, ...(q ? { q } : {}) }).toString()}`;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Activity log</h1>
          <p>Every sign-in and every change made in the admin panel, with who, when and from where. Entries are kept for a year.</p>
        </div>
        <div className="adm-head-actions">
          <a className="btn btn--line btn--sm" href={exportHref}>Download CSV</a>
        </div>
      </header>

      {sp.ban && BAN_NOTE[sp.ban] ? <p className={`adm-note${sp.ban === "self" || sp.ban === "invalid" ? " adm-note--error" : ""}`} role="status">{BAN_NOTE[sp.ban]}</p> : null}

      <div className="adm-strip">
        <div className="adm-stat"><span>Events, last 24 hours</span><strong>{stats.events}</strong><small>everything recorded</small></div>
        <div className="adm-stat"><span>Sign-ins</span><strong>{stats.signIns}</strong><small>successful, last 24 hours</small></div>
        <div className={`adm-stat${stats.failed ? " is-hot" : ""}`}><span>Refused sign-ins</span><strong>{stats.failed}</strong><small>{stats.failed ? "worth a look below" : "none in 24 hours"}</small></div>
        <div className="adm-stat"><span>Changes made</span><strong>{stats.changes}</strong><small>articles, enquiries, email, people</small></div>
      </div>

      {banned.length ? (
        <section className="adm-card adm-banned" aria-labelledby="ban-h">
          <div className="adm-card-head"><h2 id="ban-h">Banned addresses <em>{banned.length}</em></h2></div>
          <ul>
            {banned.map((b) => (
              <li key={b.key}>
                <div><code>{isV6(b.key) ? `${b.key}` : b.key}</code><span className="adm-ip-kind">{isV6(b.key) ? "IPv6, whole block" : "IPv4"}</span>{b.reason ? <small>{b.reason}</small> : null}<small>by {b.by || "an admin"} · {formatDateTime(b.at)}</small></div>
                <form action={unbanIpAction}><input type="hidden" name="key" value={b.key} /><ConfirmButton message={`Let ${b.key} use the site again?`} className="adm-mini">Unban</ConfirmButton></form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="adm-card">
        <div className="adm-toolbar adm-log-tools">
          <nav className="adm-tabs" aria-label="Kind of activity">
            {AUDIT_GROUPS.map((g) => (
              <Link key={g.key} href={href({ group: g.key, page: "1" })} aria-current={group === g.key ? "page" : undefined}>{g.label}</Link>
            ))}
          </nav>
          <form className="adm-log-search" action="/admin/logs" method="get">
            {group !== "all" ? <input type="hidden" name="group" value={group} /> : null}
            <select name="range" className="in" defaultValue={range} aria-label="Time range">
              {AUDIT_RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
            <input name="q" className="in" type="search" defaultValue={q} placeholder="Search who, what or IP" aria-label="Search the log" />
            <button className="btn btn--sm" type="submit">Search</button>
          </form>
        </div>

        {rows.length ? (
          <div className="adm-table-wrap adm-log-wrap">
            <table className="adm-table adm-log">
              <thead><tr><th>When</th><th>Who</th><th>What happened</th><th>Details</th><th>From</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="adm-log-when"><time dateTime={r.at}>{formatDateTime(r.at)}</time></td>
                    <td className="adm-log-who">{r.actor || <span className="adm-faint">Not signed in</span>}</td>
                    <td><span className={`adm-log-tag is-${tone(r.action)}`}>{AUDIT_ACTIONS[r.action as AuditAction] ?? r.action}</span></td>
                    <td className="adm-log-detail">{r.target ? <strong>{r.target}</strong> : null}{r.detail ? <span>{r.detail}</span> : null}</td>
                    <td className="adm-log-from">
                      <code>{r.ip || "—"}</code>{r.ip && ipKey(r.ip) ? <span className="adm-ip-kind">{isV6(ipKey(r.ip)!) ? "IPv6" : "IPv4"}</span> : null}
                      {browser(r.agent) ? <small>{browser(r.agent)} · {device(r.agent)}</small> : null}
                      {r.ip && ipKey(r.ip) && ipKey(r.ip) !== myKey ? (bannedKeys.has(ipKey(r.ip)!) ? <small className="adm-ip-banned">Banned</small> : (
                        <form action={banIpAction} className="adm-ban"><input type="hidden" name="ip" value={r.ip} /><ConfirmButton message={`Ban ${r.ip}${isV6(ipKey(r.ip)!) ? " and the rest of its IPv6 block" : ""}? It will not be able to sign in, sign up, send forms or comment, or open the admin panel.`} className="adm-ban-btn">Ban</ConfirmButton></form>
                      )) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="adm-empty">Nothing recorded for this filter yet. New activity appears here as it happens.</p>
        )}

        <div className="adm-log-pager">
          <span className="adm-faint">{total ? `${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, total)} of ${total}` : "0 events"}</span>
          <span>
            {page > 1 ? <Link className="btn btn--line btn--sm" href={href({ page: String(page - 1) })}>← Newer</Link> : null}
            {page < pages ? <Link className="btn btn--line btn--sm" href={href({ page: String(page + 1) })}>Older →</Link> : null}
          </span>
        </div>
      </section>
    </div>
  );
}
