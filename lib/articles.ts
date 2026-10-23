import { SEED_ARTICLES, type Article, type ArticleStatus, type StoredArticle } from "@/content/articles";
import { exists, newId, readAll, update } from "./store";
import { istIso } from "./time";

const COLLECTION = "articles";

/** On first run the site starts with the seed articles; after that the data store is the only source. */
async function ensureSeeded() {
  if (await exists(COLLECTION)) return;
  const now = istIso();
  await update<StoredArticle>(COLLECTION, (rows) => {
    if (rows.length) return;
    for (const a of SEED_ARTICLES) rows.push({ ...a, id: newId(), status: "published", createdAt: now, updatedAt: now });
  });
}

const byDateDesc = (a: StoredArticle, b: StoredArticle) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

export async function listAll(): Promise<StoredArticle[]> {
  await ensureSeeded();
  return (await readAll<StoredArticle>(COLLECTION)).sort(byDateDesc);
}
export async function listPublished(): Promise<StoredArticle[]> {
  return (await listAll()).filter((a) => a.status === "published");
}
export async function getBySlug(slug: string): Promise<StoredArticle | null> {
  return (await listAll()).find((a) => a.slug === slug) ?? null;
}
export async function getById(id: string): Promise<StoredArticle | null> {
  return (await listAll()).find((a) => a.id === id) ?? null;
}

export type ArticleInput = Pick<Article, "slug" | "title" | "excerpt" | "category" | "date" | "previewBlocks" | "blocks"> & { status: ArticleStatus };

/** Create (no id) or update an article. Returns an error message, or null and the saved id. */
export async function saveArticle(input: ArticleInput, id?: string): Promise<{ error: string } | { id: string }> {
  await ensureSeeded();
  return update<StoredArticle, { error: string } | { id: string }>(COLLECTION, (rows) => {
    if (rows.some((a) => a.slug === input.slug && a.id !== id)) return { error: "Another article already uses that address. Choose a different one." };
    const now = istIso();
    if (id) {
      const existing = rows.find((a) => a.id === id);
      if (!existing) return { error: "That article no longer exists." };
      Object.assign(existing, input, { updatedAt: now });
      return { id };
    }
    const created: StoredArticle = { ...input, id: newId(), createdAt: now, updatedAt: now };
    rows.push(created);
    return { id: created.id };
  });
}

export async function deleteArticle(id: string) {
  await update<StoredArticle>(COLLECTION, (rows) => {
    const i = rows.findIndex((a) => a.id === id);
    if (i >= 0) rows.splice(i, 1);
  });
}
