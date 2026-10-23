import { newId, readAll, update } from "./store";
import { istIso } from "./time";

export type Comment = { id: string; slug: string; userId: string; name: string; text: string; createdAt: string };

const COLLECTION = "comments";
export const COMMENT_MAX = 1000;

export async function listForArticle(slug: string): Promise<Comment[]> {
  return (await readAll<Comment>(COLLECTION)).filter((c) => c.slug === slug).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
export async function listAllComments(): Promise<Comment[]> {
  return (await readAll<Comment>(COLLECTION)).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function addComment(input: { slug: string; userId: string; name: string; text: string }): Promise<Comment> {
  const comment: Comment = { id: newId(), createdAt: istIso(), ...input };
  await update<Comment>(COLLECTION, (rows) => void rows.push(comment));
  return comment;
}

/** An admin can remove any comment; a reader can remove their own. */
export async function removeComment(id: string, by: { id: string; admin: boolean }): Promise<boolean> {
  return update<Comment, boolean>(COLLECTION, (rows) => {
    const i = rows.findIndex((c) => c.id === id && (by.admin || c.userId === by.id));
    if (i < 0) return false;
    rows.splice(i, 1);
    return true;
  });
}

/** The comments one reader has posted. */
export async function listForUser(userId: string): Promise<Comment[]> {
  return (await readAll<Comment>(COLLECTION)).filter((c) => c.userId === userId).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Keeps a reader's name on their comments in step with their profile. */
export async function renameCommenter(userId: string, name: string): Promise<void> {
  await update<Comment>(COLLECTION, (rows) => {
    for (const c of rows) if (c.userId === userId) c.name = name;
  });
}
