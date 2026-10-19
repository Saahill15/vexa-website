import { getDb } from "@/lib/db";
import { completeReader, endAllReaderSessions, readerById, type Reader } from "@/lib/accounts";
import { audit, type AuditActor, type AuditRow } from "@/lib/audit";
import { scanFallback } from "@/lib/enquiries";
import { ARTICLES } from "@/lib/learn";
import { hiddenSlugs } from "@/lib/article-state";
import { staffRole } from "@/lib/staff";

export const PAGE_SIZE = 25;
export type Page<T> = { rows: T[]; total: number; page: number; pages: number };

function paged<T>(sqlFrom: string, params: unknown[], select: string, order: string, page: number): Page<T> {
  const db = getDb();
  const total = (db.prepare(`SELECT COUNT(*) AS n ${sqlFrom}`).get(...params) as { n: number }).n;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);
  const rows = db.prepare(`SELECT ${select} ${sqlFrom} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...params, PAGE_SIZE, (current - 1) * PAGE_SIZE) as T[];
  return { rows, total, page: current, pages };
}
const like = (value: string) => `%${value.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
const DAY = 86_400_000;
const isoDate = (value: string | undefined) => (value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) ? value : "");

// ---------- Dashboard ----------
export function dashboardStats(periodDays: number) {
  const db = getDb();
  const since = new Date(Date.now() - periodDays * DAY).toISOString();
  const n = (sql: string, ...params: unknown[]) => (db.prepare(sql).get(...params) as { n: number }).n;
  const hidden = hiddenSlugs();
  return {
    users: n("SELECT COUNT(*) AS n FROM readers"),
    newUsers: n("SELECT COUNT(*) AS n FROM readers WHERE created_at >= ?", since),
    enquiries: n("SELECT COUNT(*) AS n FROM briefs"),
    newEnquiries: n("SELECT COUNT(*) AS n FROM briefs WHERE status = 'new'"),
    openEnquiries: n("SELECT COUNT(*) AS n FROM briefs WHERE status IN ('new','in_progress','waiting')"),
    periodEnquiries: n("SELECT COUNT(*) AS n FROM briefs WHERE created_at >= ?", since),
    leads: n("SELECT COUNT(*) AS n FROM leads"),
    periodLeads: n("SELECT COUNT(*) AS n FROM leads WHERE created_at >= ?", since),
    publishedArticles: ARTICLES.filter((article) => !hidden.has(article.slug)).length,
    hiddenArticles: ARTICLES.filter((article) => hidden.has(article.slug)).length,
    pendingComments: n("SELECT COUNT(*) AS n FROM reader_comments WHERE status = 'pending'"),
    failedNotifications: n("SELECT COUNT(*) AS n FROM briefs WHERE webhook_status = 'failed'"),
    fallbackPending: scanFallback().pending.length,
  };
}
export function moderatorStats() {
  return { pendingComments: (getDb().prepare("SELECT COUNT(*) AS n FROM reader_comments WHERE status = 'pending'").get() as { n: number }).n };
}
export function recentAudit(limit = 10): AuditRow[] {
  return getDb().prepare("SELECT * FROM admin_audit ORDER BY id DESC LIMIT ?").all(limit) as AuditRow[];
}

// ---------- Enquiries ----------
export type EnquiryRow = { id: number; created_at: string; name: string | null; email: string; company: string | null; role: string | null; interest: string | null; problem: string; status: string; assigned_to: string | null; assignee: string | null; updated_at: string | null; webhook_status: string | null; origin: string };
export type EnquiryFilter = { q?: string; status?: string; from?: string; to?: string; sort?: string; page?: number };
export function listEnquiries(filter: EnquiryFilter): Page<EnquiryRow> {
  const where: string[] = [];
  const params: unknown[] = [];
  const q = filter.q?.trim().slice(0, 100);
  if (q) { where.push("(b.name LIKE ? ESCAPE '\\' OR b.email LIKE ? ESCAPE '\\' OR b.company LIKE ? ESCAPE '\\')"); params.push(like(q), like(q), like(q)); }
  if (filter.status && ["new", "in_progress", "waiting", "resolved"].includes(filter.status)) { where.push("b.status = ?"); params.push(filter.status); }
  if (filter.status === "open") where.push("b.status IN ('new','in_progress','waiting')");
  const from = isoDate(filter.from), to = isoDate(filter.to);
  if (from) { where.push("b.created_at >= ?"); params.push(`${from}T00:00:00.000Z`); }
  if (to) { where.push("b.created_at < ?"); params.push(new Date(Date.parse(`${to}T00:00:00.000Z`) + DAY).toISOString()); }
  const from_ = `FROM briefs b LEFT JOIN readers r ON r.id = b.assigned_to ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`;
  return paged<EnquiryRow>(from_, params, "b.id, b.created_at, b.name, b.email, b.company, b.role, b.interest, substr(b.problem, 1, 180) AS problem, b.status, b.assigned_to, COALESCE(NULLIF(r.name, ''), r.email) AS assignee, b.updated_at, b.webhook_status, b.origin", filter.sort === "oldest" ? "b.created_at ASC, b.id ASC" : "b.created_at DESC, b.id DESC", filter.page ?? 1);
}
export type EnquiryDetail = EnquiryRow & { problem: string; budget: string | null; launch: string | null; source: string | null; consent: number; webhook_detail: string | null; webhook_at: string | null };
export function getEnquiry(id: number): EnquiryDetail | null {
  return (getDb().prepare("SELECT b.*, COALESCE(NULLIF(r.name, ''), r.email) AS assignee FROM briefs b LEFT JOIN readers r ON r.id = b.assigned_to WHERE b.id = ?").get(id) as EnquiryDetail | undefined) ?? null;
}
export function assignableStaff(): { id: string; label: string }[] {
  return getDb().prepare("SELECT id, COALESCE(NULLIF(name, ''), email) AS label FROM readers WHERE admin = 1 AND disabled_at IS NULL ORDER BY label").all() as { id: string; label: string }[];
}

// ---------- Notes ----------
export type Note = { id: number; author_label: string; body: string; created_at: string };
export function notesFor(type: "enquiry" | "lead", id: number): Note[] {
  return getDb().prepare("SELECT id, author_label, body, created_at FROM admin_notes WHERE subject_type = ? AND subject_id = ? ORDER BY id DESC LIMIT 100").all(type, String(id)) as Note[];
}
export function addNote(type: "enquiry" | "lead", id: number, actor: AuditActor, body: string): void {
  getDb().transaction(() => {
    getDb().prepare("INSERT INTO admin_notes (subject_type, subject_id, author_id, author_label, body, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(type, String(id), actor.id, actor.label, body, new Date().toISOString());
    getDb().prepare(`UPDATE ${type === "enquiry" ? "briefs" : "leads"} SET updated_at = ? WHERE id = ?`).run(new Date().toISOString(), id);
    audit(actor, `${type}.note`, { type, id }, { length: body.length });
  })();
}

// ---------- Leads ----------
export const LEAD_STATUSES = [{ value: "new", label: "New" }, { value: "contacted", label: "Contacted" }, { value: "closed", label: "Closed" }] as const;
export type LeadRow = { id: number; created_at: string; last_seen: string; name: string | null; email: string; role: string | null; whatsapp: string | null; whatsapp_consent: number; source_slug: string | null; utm_source: string | null; signed_in_with: string | null; status: string; updated_at: string | null };
export type LeadFilter = { q?: string; role?: string; source?: string; consent?: string; status?: string; page?: number };
function leadWhere(filter: LeadFilter): { sql: string; params: unknown[] } {
  const where: string[] = [];
  const params: unknown[] = [];
  const q = filter.q?.trim().slice(0, 100);
  if (q) { where.push("(name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\')"); params.push(like(q), like(q)); }
  if (filter.role && /^[a-z-]{1,30}$/.test(filter.role)) { where.push("role = ?"); params.push(filter.role); }
  if (filter.source && /^[a-z0-9-]{1,80}$/.test(filter.source)) { where.push("source_slug = ?"); params.push(filter.source); }
  if (filter.consent === "whatsapp") where.push("whatsapp_consent = 1");
  if (filter.status && LEAD_STATUSES.some((s) => s.value === filter.status)) { where.push("status = ?"); params.push(filter.status); }
  return { sql: `FROM leads ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`, params };
}
export function listLeads(filter: LeadFilter): Page<LeadRow> {
  const { sql, params } = leadWhere(filter);
  return paged<LeadRow>(sql, params, "*", "created_at DESC, id DESC", filter.page ?? 1);
}
export function leadSources(): string[] {
  return (getDb().prepare("SELECT DISTINCT source_slug FROM leads WHERE source_slug IS NOT NULL ORDER BY source_slug LIMIT 50").all() as { source_slug: string }[]).map((row) => row.source_slug);
}
export function getLead(id: number): LeadRow | null {
  return (getDb().prepare("SELECT * FROM leads WHERE id = ?").get(id) as LeadRow | undefined) ?? null;
}
/** CSV for spreadsheet use. WhatsApp numbers are included only with WhatsApp consent; cells cannot start a formula. */
export function leadsCsv(filter: LeadFilter): { csv: string; count: number } {
  const { sql, params } = leadWhere(filter);
  const rows = getDb().prepare(`SELECT * ${sql} ORDER BY created_at DESC, id DESC LIMIT 10000`).all(...params) as LeadRow[];
  const cell = (value: unknown) => {
    let text = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const header = ["id", "created_at", "last_seen", "name", "email", "role", "whatsapp", "whatsapp_consent", "source", "utm_source", "signed_in_with", "status"];
  const lines = rows.map((r) => [r.id, r.created_at, r.last_seen, r.name, r.email, r.role, r.whatsapp_consent ? r.whatsapp : "", r.whatsapp_consent ? "yes" : "no", r.source_slug, r.utm_source, r.signed_in_with, r.status].map(cell).join(","));
  return { csv: [header.join(","), ...lines].join("\r\n") + "\r\n", count: rows.length };
}

// ---------- Users ----------
export type UserRow = { id: string; email: string; name: string; role: string; created_at: string; email_verified: number; has_password: number; has_google: number; disabled_at: string | null; admin: number; moderator: number; comments: number };
export type UserFilter = { q?: string; status?: string; page?: number };
export function listUsers(filter: UserFilter): Page<UserRow> {
  const where: string[] = [];
  const params: unknown[] = [];
  const q = filter.q?.trim().slice(0, 100);
  if (q) { where.push("(email LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\')"); params.push(like(q), like(q)); }
  if (filter.status === "active") where.push("disabled_at IS NULL");
  if (filter.status === "disabled") where.push("disabled_at IS NOT NULL");
  if (filter.status === "unverified") where.push("email_verified = 0");
  if (filter.status === "staff") where.push("(admin = 1 OR moderator = 1)");
  // Only presence flags are selected for credentials; hashes and Google subject ids never leave the database.
  return paged<UserRow>(`FROM readers ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`, params, "id, email, name, role, created_at, email_verified, password_hash IS NOT NULL AS has_password, google_sub IS NOT NULL AS has_google, disabled_at, admin, moderator, (SELECT COUNT(*) FROM reader_comments c WHERE c.reader_id = readers.id) AS comments", "created_at DESC", filter.page ?? 1);
}
export type UserDetail = { id: string; email: string; name: string; role: string; industry: string; job: string; organisation: string; publicDetails: boolean; createdAt: string; emailVerified: boolean; hasPassword: boolean; hasGoogle: boolean; complete: boolean; disabledAt: string | null; staffRole: "admin" | "moderator" | null; moderator: boolean; admin: boolean; activeSessions: number; comments: { status: string; n: number }[]; twoStep: boolean };
export function getUser(id: string): UserDetail | null {
  const reader = readerById(id);
  if (!reader) return null;
  const db = getDb();
  return {
    id: reader.id, email: reader.email, name: reader.name, role: reader.role, industry: reader.industry, job: reader.job, organisation: reader.organisation,
    publicDetails: Boolean(reader.public_details), createdAt: reader.created_at, emailVerified: Boolean(reader.email_verified), hasPassword: Boolean(reader.password_hash), hasGoogle: Boolean(reader.google_sub),
    complete: completeReader(reader), disabledAt: reader.disabled_at, staffRole: staffRole({ ...reader, disabled_at: null }), moderator: Boolean(reader.moderator), admin: Boolean(reader.admin),
    activeSessions: (db.prepare("SELECT COUNT(*) AS n FROM reader_sessions WHERE reader_id = ? AND expires_at > ?").get(id, Date.now()) as { n: number }).n,
    comments: db.prepare("SELECT status, COUNT(*) AS n FROM reader_comments WHERE reader_id = ? GROUP BY status").all(id) as { status: string; n: number }[],
    // Presence only: the encrypted authenticator key itself never leaves the database.
    twoStep: Boolean((db.prepare("SELECT totp_secret IS NOT NULL AS on_ FROM readers WHERE id = ?").get(id) as { on_: number }).on_),
  };
}
export function setDisabled(reader: Reader, disabled: boolean): void {
  getDb().transaction(() => {
    getDb().prepare("UPDATE readers SET disabled_at = ? WHERE id = ?").run(disabled ? new Date().toISOString() : null, reader.id);
    if (disabled) endAllReaderSessions(reader.id);
  })();
}
/** Removes the account and, through foreign keys, its sessions, tokens and comments. Audit entries keep only the id. */
export function deleteReader(reader: Reader): { comments: number } {
  const db = getDb();
  return db.transaction(() => {
    const comments = (db.prepare("SELECT COUNT(*) AS n FROM reader_comments WHERE reader_id = ?").get(reader.id) as { n: number }).n;
    db.prepare("UPDATE briefs SET assigned_to = NULL WHERE assigned_to = ?").run(reader.id);
    db.prepare("DELETE FROM readers WHERE id = ?").run(reader.id);
    return { comments };
  })();
}

// ---------- Comments ----------
export const COMMENT_STATUSES = ["pending", "approved", "rejected", "removed"] as const;
export type CommentRow = { id: string; slug: string; body: string; status: string; created_at: string; updated_at: string; reader_id: string; author: string; moderated_at: string | null; moderator: string | null };
export type CommentFilter = { status?: string; q?: string; slug?: string; page?: number };
export function listComments(filter: CommentFilter): Page<CommentRow> {
  const where: string[] = [];
  const params: unknown[] = [];
  const status = COMMENT_STATUSES.find((s) => s === filter.status) ?? (filter.status === "all" ? null : "pending");
  if (status) { where.push("c.status = ?"); params.push(status); }
  const q = filter.q?.trim().slice(0, 100);
  if (q) { where.push("(c.body LIKE ? ESCAPE '\\' OR r.name LIKE ? ESCAPE '\\')"); params.push(like(q), like(q)); }
  if (filter.slug && /^[a-z0-9-]{1,80}$/.test(filter.slug)) { where.push("c.slug = ?"); params.push(filter.slug); }
  return paged<CommentRow>(`FROM reader_comments c JOIN readers r ON r.id = c.reader_id LEFT JOIN readers m ON m.id = c.moderated_by ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`, params, "c.id, c.slug, c.body, c.status, c.created_at, c.updated_at, c.reader_id, r.name AS author, c.moderated_at, COALESCE(NULLIF(m.name, ''), m.email) AS moderator", status === "pending" ? "c.created_at ASC" : "c.created_at DESC", filter.page ?? 1);
}
export function commentCounts(): Record<string, { pending: number; approved: number }> {
  const out: Record<string, { pending: number; approved: number }> = {};
  for (const row of getDb().prepare("SELECT slug, status, COUNT(*) AS n FROM reader_comments WHERE status IN ('pending','approved') GROUP BY slug, status").all() as { slug: string; status: "pending" | "approved"; n: number }[]) {
    out[row.slug] ??= { pending: 0, approved: 0 };
    out[row.slug][row.status] = row.n;
  }
  return out;
}

const TRANSITIONS: Record<string, { from: string; to: string }> = { approve: { from: "pending", to: "approved" }, reject: { from: "pending", to: "rejected" }, remove: { from: "approved", to: "removed" } };
export type ModerationResult = "ok" | "not_found" | "invalid" | "own_comment";
/**
 * Shared by /admin/comments and the original /account/moderation queue. "remove" is a soft removal: the row stays
 * with status "removed" and is hidden from readers. Moderators cannot decide on their own comments.
 */
export function moderateComment(id: string, action: string, actor: AuditActor & { id: string; role: "admin" | "moderator" }): ModerationResult {
  const transition = TRANSITIONS[action];
  if (!transition) return "invalid";
  const db = getDb();
  return db.transaction((): ModerationResult => {
    const comment = db.prepare("SELECT id, reader_id, status, slug FROM reader_comments WHERE id = ?").get(id) as { id: string; reader_id: string; status: string; slug: string } | undefined;
    if (!comment || comment.status !== transition.from) return "not_found";
    if (comment.reader_id === actor.id && actor.role !== "admin") return "own_comment";
    db.prepare("UPDATE reader_comments SET status = ?, moderated_by = ?, moderated_at = ? WHERE id = ? AND status = ?").run(transition.to, actor.id, new Date().toISOString(), id, transition.from);
    audit(actor, `comment.${transition.to}`, { type: "comment", id }, { article: comment.slug, own: comment.reader_id === actor.id || undefined });
    return "ok";
  })();
}

// ---------- Audit ----------
export function listAudit(filter: { action?: string; actor?: string; page?: number }): Page<AuditRow> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.action && /^[a-z_.]{1,40}$/.test(filter.action)) { where.push("action LIKE ? ESCAPE '\\'"); params.push(`${filter.action.replace(/_/g, "\\_")}%`); }
  const actor = filter.actor?.trim().slice(0, 100);
  if (actor) { where.push("actor_label LIKE ? ESCAPE '\\'"); params.push(like(actor)); }
  return paged<AuditRow>(`FROM admin_audit ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`, params, "*", "id DESC", filter.page ?? 1);
}

// ---------- Settings overview ----------
export function deliveryStats() {
  const db = getDb();
  const since = new Date(Date.now() - 30 * DAY).toISOString();
  return db.prepare("SELECT COALESCE(webhook_status, 'not recorded') AS status, COUNT(*) AS n FROM briefs WHERE created_at >= ? GROUP BY status").all(since) as { status: string; n: number }[];
}
