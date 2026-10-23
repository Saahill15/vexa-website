import { adminOnly } from "@/lib/admin-guard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { blocksToText } from "@/lib/article-text";
import { getById } from "@/lib/articles";

export const metadata = { title: "Edit article" };

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  await adminOnly();
  const a = await getById((await params).id);
  if (!a) notFound();
  return (
    <div className="adm-page adm-page--wide">
      <Link href="/admin/articles" className="adm-back">← All articles</Link>
      <header className="adm-head"><div><h1>Edit article</h1><p>/articles/{a.slug}</p></div></header>
      <ArticleEditor initial={{ id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt, category: a.category, date: a.date, previewBlocks: a.previewBlocks, status: a.status, body: blocksToText(a.blocks) }} />
    </div>
  );
}
