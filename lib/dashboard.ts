import { db, iso } from "./db";
import type { EnquiryStatus } from "./enquiries";

/**
 * Everything the admin dashboard shows, counted and limited in the database. The page used to load every enquiry, article
 * (with its full text), comment and account just to show a few numbers and five rows of each.
 */
export type DashboardData = {
  enq: { total: number; week: number; byStatus: Record<EnquiryStatus, number>; oldestNew: string | null };
  queue: { id: string; at: string; name: string | null; email: string; role: string; interest: string | null; problem: string; status: EnquiryStatus }[];
  articles: { total: number; published: number; latest: { id: string; title: string; category: string; status: "draft" | "published"; date: string; comments: number }[] };
  comments: { id: string; name: string; text: string; createdAt: string }[];
  users: { total: number; week: number; latest: { id: string; name: string; googleId: boolean; role: string; createdAt: string }[] };
};

export async function dashboardData(): Promise<DashboardData> {
  const [counts, queue, arts, comments, usr] = await Promise.all([
    db.query<{ status: EnquiryStatus; n: number; week: number; oldest: Date | null }>(
      `select status, count(*)::int as n, count(*) filter (where at > now() - interval '7 days')::int as week, min(at) as oldest from enquiries group by status`,
    ),
    db.query<{ id: string; at: Date; name: string | null; email: string; role: string; interest: string | null; problem: string; status: EnquiryStatus }>(
      `select id, at, name, email, role, interest, left(problem, 240) as problem, status from enquiries where status <> 'resolved'
        order by case status when 'new' then 0 when 'waiting' then 1 else 2 end, at limit 6`,
    ),
    db.query<{ id: string; title: string; category: string; status: "draft" | "published"; date: string; comments: number; total: number; published: number }>(
      `select a.id, a.title, a.category, a.status, a.date,
              (select count(*)::int from comments c where c.slug = a.slug) as comments,
              count(*) over ()::int as total, count(*) filter (where a.status = 'published') over ()::int as published
         from articles a order by a.date desc limit 5`,
    ),
    db.query<{ id: string; name: string; text: string; created_at: Date }>(`select id, name, left(text, 200) as text, created_at from comments order by created_at desc limit 5`),
    db.query<{ id: string; name: string; google: boolean; role: string; created_at: Date; total: number; week: number }>(
      `select id, name, (google_id is not null) as google, role, created_at,
              count(*) over ()::int as total, count(*) filter (where created_at > now() - interval '7 days') over ()::int as week
         from users order by created_at desc limit 5`,
    ),
  ]);

  const byStatus: Record<EnquiryStatus, number> = { new: 0, in_progress: 0, waiting: 0, resolved: 0 };
  let total = 0;
  let week = 0;
  let oldestNew: string | null = null;
  for (const r of counts.rows) {
    byStatus[r.status] = r.n;
    total += r.n;
    week += r.week;
    if (r.status === "new" && r.oldest) oldestNew = iso(r.oldest);
  }
  return {
    enq: { total, week, byStatus, oldestNew },
    queue: queue.rows.map((r) => ({ ...r, at: iso(r.at) })),
    articles: { total: arts.rows[0]?.total ?? 0, published: arts.rows[0]?.published ?? 0, latest: arts.rows.map(({ total: _t, published: _p, ...a }) => a) },
    comments: comments.rows.map((r) => ({ id: r.id, name: r.name, text: r.text, createdAt: iso(r.created_at) })),
    users: { total: usr.rows[0]?.total ?? 0, week: usr.rows[0]?.week ?? 0, latest: usr.rows.map((r) => ({ id: r.id, name: r.name, googleId: r.google, role: r.role, createdAt: iso(r.created_at) })) },
  };
}
