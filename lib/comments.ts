import { db, isUuid, iso } from "./db";

export type Comment = { id: string; slug: string; userId: string; name: string; text: string; createdAt: string };

export const COMMENT_MAX = 1000;

type CommentRow = { id: string; slug: string; user_id: string | null; name: string; text: string; created_at: Date };

const toComment = (r: CommentRow): Comment => ({ id: r.id, slug: r.slug, userId: r.user_id ?? "", name: r.name, text: r.text, createdAt: iso(r.created_at) });

export async function listForArticle(slug: string): Promise<Comment[]> {
  const { rows } = await db.query<CommentRow>("select * from comments where slug = $1 order by created_at desc", [slug]);
  return rows.map(toComment);
}

export async function listAllComments(): Promise<Comment[]> {
  const { rows } = await db.query<CommentRow>("select * from comments order by created_at desc");
  return rows.map(toComment);
}

export async function addComment(input: { slug: string; userId: string; name: string; text: string }): Promise<Comment> {
  const { rows } = await db.query<CommentRow>(
    "insert into comments (slug, user_id, name, text) values ($1, $2, $3, $4) returning *",
    [input.slug, input.userId, input.name, input.text],
  );
  return toComment(rows[0]);
}

/** An admin can remove any comment; a reader can remove their own. */
export async function removeComment(id: string, by: { id: string; admin: boolean }): Promise<boolean> {
  if (!isUuid(id)) return false;
  const { rowCount } = await db.query("delete from comments where id = $1 and ($2::boolean or user_id = $3)", [id, by.admin, by.id]);
  return Boolean(rowCount);
}

/** The comments one reader has posted. */
export async function listForUser(userId: string): Promise<Comment[]> {
  const { rows } = await db.query<CommentRow>("select * from comments where user_id = $1 order by created_at desc", [userId]);
  return rows.map(toComment);
}

/** Keeps a reader's name on their comments in step with their profile. */
export async function renameCommenter(userId: string, name: string): Promise<void> {
  await db.query("update comments set name = $2 where user_id = $1", [userId, name]);
}

