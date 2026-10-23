import { SEED_ARTICLES, type Article, type ArticleStatus, type StoredArticle } from "@/content/articles";
import { db, isUniqueViolation, isUuid, iso, transaction } from "./db";

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  status: ArticleStatus;
  preview_blocks: number;
  blocks: Article["blocks"];
  created_at: Date;
  updated_at: Date;
};

const toArticle = (r: ArticleRow): StoredArticle => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  category: r.category,
  date: r.date,
  status: r.status,
  previewBlocks: r.preview_blocks,
  blocks: r.blocks,
  createdAt: iso(r.created_at),
  updatedAt: iso(r.updated_at),
});

/**
 * On first run the site starts with the seed articles; after that the database is the only source. The flag is
 * set in the same transaction as the insert, so the seeds are written once even if two requests race.
 */
async function ensureSeeded() {
  await transaction(async (client) => {
    const flag = await client.query("insert into app_meta (key) values ('articles_seeded') on conflict do nothing returning key");
    if (!flag.rowCount) return;
    for (const a of SEED_ARTICLES) {
      await client.query(
        `insert into articles (slug, title, excerpt, category, date, status, preview_blocks, blocks)
         values ($1, $2, $3, $4, $5, 'published', $6, $7)`,
        [a.slug, a.title, a.excerpt, a.category, a.date, a.previewBlocks, JSON.stringify(a.blocks)],
      );
    }
  });
}

export async function listAll(): Promise<StoredArticle[]> {
  await ensureSeeded();
  const { rows } = await db.query<ArticleRow>("select * from articles order by date desc");
  return rows.map(toArticle);
}
export async function listPublished(): Promise<StoredArticle[]> {
  await ensureSeeded();
  const { rows } = await db.query<ArticleRow>("select * from articles where status = 'published' order by date desc");
  return rows.map(toArticle);
}
export async function getBySlug(slug: string): Promise<StoredArticle | null> {
  await ensureSeeded();
  const { rows } = await db.query<ArticleRow>("select * from articles where slug = $1", [slug]);
  return rows[0] ? toArticle(rows[0]) : null;
}
export async function getById(id: string): Promise<StoredArticle | null> {
  await ensureSeeded();
  if (!isUuid(id)) return null;
  const { rows } = await db.query<ArticleRow>("select * from articles where id = $1", [id]);
  return rows[0] ? toArticle(rows[0]) : null;
}

export type ArticleInput = Pick<Article, "slug" | "title" | "excerpt" | "category" | "date" | "previewBlocks" | "blocks"> & { status: ArticleStatus };

const SLUG_TAKEN = { error: "Another article already uses that address. Choose a different one." };

/** Create (no id) or update an article. Returns an error message, or the saved id. */
export async function saveArticle(input: ArticleInput, id?: string): Promise<{ error: string } | { id: string }> {
  await ensureSeeded();
  if (id && !isUuid(id)) return { error: "That article no longer exists." };
  const values = [input.slug, input.title, input.excerpt, input.category, input.date, input.status, input.previewBlocks, JSON.stringify(input.blocks)];
  try {
    if (id) {
      const { rows } = await db.query<{ id: string }>(
        `update articles set slug = $1, title = $2, excerpt = $3, category = $4, date = $5, status = $6,
           preview_blocks = $7, blocks = $8, updated_at = now() where id = $9 returning id`,
        [...values, id],
      );
      return rows[0] ? { id: rows[0].id } : { error: "That article no longer exists." };
    }
    const { rows } = await db.query<{ id: string }>(
      `insert into articles (slug, title, excerpt, category, date, status, preview_blocks, blocks)
       values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
      values,
    );
    return { id: rows[0].id };
  } catch (error) {
    if (isUniqueViolation(error)) return SLUG_TAKEN;
    throw error;
  }
}

export async function deleteArticle(id: string) {
  if (!isUuid(id)) return;
  await db.query("delete from articles where id = $1", [id]);
}
