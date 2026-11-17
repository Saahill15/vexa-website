import { adminOnly } from "@/lib/admin-guard";
import Link from "next/link";
import { deleteArticleAction, setArticleStatusAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { RowMenu } from "@/components/admin/RowMenu";
import { formatDate } from "@/content/articles";
import { listAll } from "@/lib/articles";
import { listAllComments } from "@/lib/comments";

export const metadata = { title: "Articles" };

export default async function ArticlesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  await adminOnly();
  const [articles, comments, { saved, deleted }] = await Promise.all([listAll(), listAllComments(), searchParams]);
  return (
    <div className="adm-page">
      <header className="adm-head">
        <div><h1>Articles</h1><p>Write, edit and publish. Drafts are only visible to admins.</p></div>
        <Link href="/admin/articles/new" className="btn btn--sm">New article</Link>
      </header>
      {saved ? <p className="adm-note">Saved “{saved}”.</p> : null}
      {deleted ? <p className="adm-note">Article deleted.</p> : null}

      {articles.length === 0 ? <p className="adm-empty adm-card">No articles yet. Write the first one.</p> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Comments</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id}>
                  <td><Link href={`/admin/articles/${a.id}`}><strong>{a.title}</strong></Link><small>/articles/{a.slug}</small></td>
                  <td>{a.category}</td>
                  <td className="nowrap">{formatDate(a.date)}</td>
                  <td>{comments.filter((c) => c.slug === a.slug).length}</td>
                  <td><span className={`adm-badge adm-badge--${a.status}`}>{a.status === "published" ? "Published" : "Draft"}</span></td>
                  <td className="adm-actions">
                    <RowMenu label={`Actions for ${a.title}`}>
                      <Link href={`/articles/${a.slug}`} target="_blank" role="menuitem">{a.status === "published" ? "View on the site" : "Preview"}</Link>
                      <Link href={`/admin/articles/${a.id}`} role="menuitem">Edit</Link>
                      <form action={setArticleStatusAction}><input type="hidden" name="id" value={a.id} /><button role="menuitem">{a.status === "published" ? "Unpublish" : "Publish"}</button></form>
                      <form action={deleteArticleAction}><input type="hidden" name="id" value={a.id} /><ConfirmButton role="menuitem" message={`Delete “${a.title}” and keep no copy?`} className="is-danger">Delete</ConfirmButton></form>
                    </RowMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
