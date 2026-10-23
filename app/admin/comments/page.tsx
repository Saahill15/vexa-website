import { adminOnly } from "@/lib/admin-guard";
import Link from "next/link";
import { deleteCommentAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { listAll } from "@/lib/articles";
import { listAllComments } from "@/lib/comments";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Comments" };

export default async function CommentsAdmin() {
  await adminOnly();
  const [comments, articles] = await Promise.all([listAllComments(), listAll()]);
  const title = (slug: string) => articles.find((a) => a.slug === slug)?.title ?? slug;
  return (
    <div className="adm-page">
      <header className="adm-head"><div><h1>Comments</h1><p>Everything readers have posted. Delete anything that is off topic or disrespectful.</p></div></header>
      {comments.length === 0 ? <p className="adm-empty adm-card">No comments yet.</p> : (
        <ul className="adm-comments">
          {comments.map((c) => (
            <li key={c.id} className="adm-card">
              <div className="adm-comment-top">
                <strong>{c.name}</strong>
                <span className="adm-faint">{formatDateTime(c.createdAt)}</span>
                <Link href={`/articles/${c.slug}`} target="_blank">on “{title(c.slug)}”</Link>
              </div>
              <p className="adm-body">{c.text}</p>
              <form action={deleteCommentAction}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmButton message="Delete this comment?" className="adm-mini adm-mini--danger">Delete</ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
