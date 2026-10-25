import { listAll } from "./articles";
import { db } from "./db";
import { listAllComments, type Comment } from "./comments";
import { listEnquiries, type Enquiry } from "./enquiries";
import { listFolder, mailConfigured, MailError, mailSyncInfo, queryThreads, threadsSignature, type Box, type Folder } from "./gmail";
import { getUserById, listUsers, type User } from "./users";

/*
 * The admin inbox: everything that happened on the site that someone may need to look at, newest first.
 * Read state is kept per admin (see markInboxRead / markAllInboxRead in users.ts).
 */

export type InboxType = "enquiry" | "comment" | "signup" | "mail";
export type InboxItem = { key: string; type: InboxType; at: string; title: string; preview: string; unread: boolean; box?: Box; subject?: string; starred?: boolean };
export type InboxData = { items: InboxItem[]; enquiries: Enquiry[]; comments: Comment[]; users: User[]; articles: { slug: string; title: string }[]; mail: { configured: boolean; error: string | null; syncedAt: string | null; signature: string | null } };

/** Mail is only fetched when asked for (the inbox page), so other admin pages never wait on Gmail. */
export async function loadInbox(adminId: string, options: { mail?: boolean; query?: string; folder?: Folder } = {}): Promise<InboxData> {
  const [enquiries, comments, users, articles, me] = await Promise.all([listEnquiries(), listAllComments(), listUsers(), listAll(), getUserById(adminId)]);
  const readAll = me?.inboxReadAll ? Date.parse(me.inboxReadAll) : 0;
  const read = new Set(me?.inboxRead ?? []);
  const unread = (key: string, at: string) => Date.parse(at) > readAll && !read.has(key);
  const mail: InboxData["mail"] = { configured: mailConfigured(), error: null, syncedAt: null, signature: null };
  const query = (options.query ?? "").trim();
  let mailItems: InboxItem[] = [];
  if (options.mail && mail.configured) {
    try {
      const folder = options.folder ?? "inbox";
      const threads = query ? await queryThreads(query) : await listFolder(folder);
      if (!query && folder === "inbox") mail.signature = threadsSignature(threads);
      mailItems = threads.map((t): InboxItem => ({ key: `mail:${t.id}`, type: "mail", at: t.at, title: t.from, subject: t.subject, preview: t.snippet, unread: t.unread, starred: t.starred, box: t.box }));
    } catch (error) {
      mail.error = error instanceof MailError ? error.message : "Mail could not be loaded right now.";
    }
    // after a failed refresh the last good list is still shown; say so, with the time it is from
    const info = mailSyncInfo(options.folder ?? "inbox");
    mail.syncedAt = info.syncedAt;
    mail.error = info.error ?? mail.error;
  }
  const titleOf = (slug: string) => articles.find((a) => a.slug === slug)?.title ?? slug;

  const items: InboxItem[] = [
    ...mailItems,
    ...enquiries.map((e): InboxItem => ({ key: `enq:${e.id}`, type: "enquiry", at: e.at, title: `${e.name || e.email} sent an enquiry`, preview: e.problem, unread: unread(`enq:${e.id}`, e.at) })),
    ...comments.map((c): InboxItem => ({ key: `com:${c.id}`, type: "comment", at: c.createdAt, title: `${c.name} commented on “${titleOf(c.slug)}”`, preview: c.text, unread: unread(`com:${c.id}`, c.createdAt) })),
    ...users.filter((u) => u.id !== adminId).map((u): InboxItem => ({ key: `usr:${u.id}`, type: "signup", at: u.createdAt, title: `${u.name} joined`, preview: `${u.email} · ${u.googleId ? "Google" : "Email and password"}`, unread: unread(`usr:${u.id}`, u.createdAt) })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 300);

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const found = words.length ? items.filter((i) => i.type === "mail" || words.every((w) => `${i.title} ${i.preview}`.toLowerCase().includes(w))) : items;
  return { items: found, enquiries, comments, users, articles: articles.map((a) => ({ slug: a.slug, title: a.title })), mail };
}

export const unreadCount = (items: InboxItem[]) => items.filter((i) => i.unread).length;

/**
 * The two numbers the admin sidebar shows, counted in the database. Same rules as the inbox list (what is unread for this
 * admin, and enquiries waiting for a first reply), without loading every row on each page.
 */
export async function inboxBadges(adminId: string): Promise<{ unread: number; newEnquiries: number }> {
  const { rows: [me] } = await db.query<{ inbox_read_all: Date | string | null; inbox_read: string[] | null }>("select inbox_read_all, inbox_read from users where id = $1", [adminId]);
  const since = me?.inbox_read_all ? new Date(me.inbox_read_all) : new Date(0);
  const read = me?.inbox_read ?? [];
  const { rows: [counts] } = await db.query<{ enquiries: number; comments: number; users: number; new_enquiries: number }>(
    `select
       (select count(*)::int from enquiries where at > $1 and not ('enq:' || id::text = any($2))) as enquiries,
       (select count(*)::int from comments where created_at > $1 and not ('com:' || id::text = any($2))) as comments,
       (select count(*)::int from users where created_at > $1 and id <> $3 and not ('usr:' || id::text = any($2))) as users,
       (select count(*)::int from enquiries where status = 'new') as new_enquiries`,
    [since, read, adminId],
  );
  return { unread: counts.enquiries + counts.comments + counts.users, newEnquiries: counts.new_enquiries };
}
