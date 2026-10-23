import { adminOnly } from "@/lib/admin-guard";
import Link from "next/link";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { istDate } from "@/lib/time";

export const metadata = { title: "New article" };

export default async function NewArticle() {
  await adminOnly();
  const today = istDate();
  return (
    <div className="adm-page adm-page--wide">
      <Link href="/admin/articles" className="adm-back">← All articles</Link>
      <header className="adm-head"><div><h1>New article</h1></div></header>
      <ArticleEditor initial={{ title: "", slug: "", excerpt: "", category: "", date: today, previewBlocks: 4, status: "draft", body: "" }} />
    </div>
  );
}
