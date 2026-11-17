import { headers } from "next/headers";
import { db } from "./db";

/*
 * The activity log. Sign-ins (and refused ones), sign-outs and every change made in the admin panel are written here with the
 * time, the account, what was touched and the IP address. Recording never blocks or fails the action it describes. Entries are
 * kept for a year (the Privacy Policy says so) and older ones are removed now and then.
 */

/** Every kind of entry, grouped for the filters on the Logs page. */
export const AUDIT_ACTIONS = {
  "auth.login": "Signed in",
  "auth.login_failed": "Sign-in refused",
  "auth.google": "Signed in with Google",
  "auth.logout": "Signed out",
  "auth.idle": "Signed out after 45 minutes idle",
  "auth.second_step": "Second step confirmed",
  "auth.password_changed": "Password changed",
  "auth.password_reset": "Password reset",
  "auth.signup": "Account created",
  "auth.account_deleted": "Account deleted",
  "enquiry.update": "Enquiry updated",
  "enquiry.status": "Enquiry status changed",
  "enquiry.delete": "Enquiry deleted",
  "enquiry.export": "Enquiries exported",
  "article.create": "Article created",
  "article.update": "Article updated",
  "article.publish": "Article published",
  "article.unpublish": "Article unpublished",
  "article.delete": "Article deleted",
  "comment.delete": "Comment deleted",
  "user.role": "Role changed",
  "user.disable": "Account disabled or enabled",
  "mail.send": "Email sent",
  "mail.reply": "Email reply sent",
  "mail.action": "Email moved, starred or deleted",
  "mail.draft": "Draft saved or discarded",
  "security.ip_ban": "Address banned",
  "security.ip_unban": "Address allowed again",
} as const;
export type AuditAction = keyof typeof AUDIT_ACTIONS;

export type AuditActor = { id?: string | null; email?: string | null; name?: string | null } | null;

const cut = (v: string | null | undefined, n: number) => (v ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, n);

export async function audit(action: AuditAction, o: { actor?: AuditActor; target?: string; detail?: string; ip?: string; agent?: string } = {}): Promise<void> {
  try {
    let { ip, agent } = o;
    if (ip === undefined || agent === undefined) {
      try {
        const h = await headers();
        if (ip === undefined) ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
        agent = h.get("user-agent") ?? "";
      } catch {
        ip ??= ""; // not inside a request
      }
    }
    const who = o.actor ? cut(o.actor.email || o.actor.name, 160) : "";
    await db.query(
      "insert into audit_log (actor_id, actor, action, target, detail, ip, agent) values ($1, $2, $3, $4, $5, $6, $7)",
      [o.actor?.id && /^[0-9a-f-]{36}$/i.test(o.actor.id) ? o.actor.id : null, who, action, cut(o.target, 240), cut(o.detail, 500), cut(ip, 64), cut(agent, 200)],
    );
    if (Math.random() < 0.01) await db.query("delete from audit_log where at < now() - interval '1 year'").catch(() => undefined);
  } catch {
    /* the log must never break what it records */
  }
}

/* ---------- reading the log (for the admin Logs page) ---------- */

export const AUDIT_GROUPS = [
  { key: "all", label: "Everything", like: [] as string[] },
  { key: "signins", label: "Sign-ins", like: ["auth.%"] },
  { key: "enquiries", label: "Enquiries", like: ["enquiry.%"] },
  { key: "articles", label: "Articles", like: ["article.%"] },
  { key: "mail", label: "Email", like: ["mail.%"] },
  { key: "people", label: "People and comments", like: ["user.%", "comment.%"] },
  { key: "security", label: "Security", like: ["security.%", "auth.login_failed"] },
  // not a filter on the log itself: this tab lists the addresses that are banned right now
  { key: "banned", label: "Banned IPs", like: [] as string[] },
] as const;

export const AUDIT_RANGES = [
  { key: "day", label: "Last 24 hours", hours: 24 },
  { key: "week", label: "7 days", hours: 24 * 7 },
  { key: "month", label: "30 days", hours: 24 * 30 },
  { key: "all", label: "All time", hours: 0 },
] as const;

export type AuditRow = { id: string; at: string; actor: string; action: string; target: string; detail: string; ip: string; agent: string };
export type AuditFilter = { group?: string; range?: string; q?: string; page?: number; perPage?: number };

function where(f: AuditFilter) {
  const parts: string[] = [];
  const params: unknown[] = [];
  const group = AUDIT_GROUPS.find((g) => g.key === f.group);
  if (group && group.like.length) {
    params.push(group.like);
    parts.push(`action like any($${params.length}::text[])`);
  }
  const range = AUDIT_RANGES.find((r) => r.key === (f.range ?? "month"));
  if (range && range.hours) {
    params.push(range.hours);
    parts.push(`at > now() - make_interval(hours => $${params.length})`);
  }
  const q = (f.q ?? "").trim().slice(0, 80);
  if (q) {
    params.push(`%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`);
    parts.push(`(actor ilike $${params.length} or target ilike $${params.length} or detail ilike $${params.length} or ip ilike $${params.length} or action ilike $${params.length})`);
  }
  return { sql: parts.length ? `where ${parts.join(" and ")}` : "", params };
}

export async function queryAudit(f: AuditFilter): Promise<{ rows: AuditRow[]; total: number }> {
  const { sql, params } = where(f);
  const perPage = Math.min(Math.max(f.perPage ?? 50, 1), 5000);
  const offset = Math.max((f.page ?? 1) - 1, 0) * perPage;
  // the count and the page are asked for together, not one after the other
  const [total, list] = await Promise.all([
    db.query<{ n: number }>(`select count(*)::int as n from audit_log ${sql}`, params),
    db.query<{ id: string; at: Date; actor: string; action: string; target: string; detail: string; ip: string; agent: string }>(
      `select id::text, at, actor, action, target, detail, ip, agent from audit_log ${sql} order by at desc, id desc limit ${perPage} offset ${offset}`,
      params,
    ),
  ]);
  return { total: total.rows[0]?.n ?? 0, rows: list.rows.map((r) => ({ ...r, at: new Date(r.at).toISOString() })) };
}

/** The numbers above the log: what happened in the last 24 hours. */
export async function auditStats(): Promise<{ events: number; signIns: number; failed: number; changes: number }> {
  const { rows } = await db.query<{ events: number; sign_ins: number; failed: number; changes: number }>(
    `select count(*)::int as events,
            count(*) filter (where action in ('auth.login', 'auth.google'))::int as sign_ins,
            count(*) filter (where action = 'auth.login_failed')::int as failed,
            count(*) filter (where action not like 'auth.%')::int as changes
       from audit_log where at > now() - interval '24 hours'`,
  );
  const r = rows[0];
  return { events: r?.events ?? 0, signIns: r?.sign_ins ?? 0, failed: r?.failed ?? 0, changes: r?.changes ?? 0 };
}

export type ActivityItem = { at: string; action: string; actor: string; target: string; detail: string };

/** Everything the team did about one enquiry: status and note changes, and mail sent to the person who wrote in. */
export async function enquiryActivity(id: string, email: string): Promise<ActivityItem[]> {
  const ref = `Enquiry VX-${id.slice(0, 4).toUpperCase()}`;
  const like = `%${email.toLowerCase().replace(/[\\%_]/g, "\\$&")}%`;
  try {
    const { rows } = await db.query<{ at: Date; action: string; actor: string; target: string; detail: string }>(
      `select at, action, actor, target, detail from audit_log
        where (action in ('enquiry.update', 'enquiry.status') and target = $1)
           or (action in ('mail.send', 'mail.reply') and lower(detail) like $2)
        order by at desc limit 100`,
      [ref, like],
    );
    return rows.map((r) => ({ ...r, at: new Date(r.at).toISOString() }));
  } catch {
    return [];
  }
}
