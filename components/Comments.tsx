"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { formatShortDate } from "@/lib/format";

type Comment = { id: string; userId: string; name: string; text: string; createdAt: string };

type Props = {
  slug: string;
  /** The reader, or null when signed out. Signed-out readers are never sent the comments. */
  user: { id: string; name: string; admin: boolean } | null;
  initial: Comment[];
  /** The article's own sign-in card is on screen, so no second sign-in prompt here. */
  gated: boolean;
  loginHref: string;
  signupHref: string;
};

const MAX = 1000;

function when(iso: string): string {
  return formatShortDate(iso);
}

export function Comments({ slug, user, initial, gated, loginHref, signupHref }: Props) {
  const [comments, setComments] = useState<Comment[]>(initial);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!text.trim()) return setError("Write something before posting.");
    setBusy(true);
    try {
      const res = await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, text }) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; comment?: Comment };
      if (!res.ok || !data.ok || !data.comment) return setError(data.error || "Your comment could not be posted. Please try again.");
      setComments((c) => [data.comment as Comment, ...c]);
      setText("");
      setError("");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this comment?")) return;
    const res = await fetch(`/api/comments?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) setComments((c) => c.filter((x) => x.id !== id));
  }

  return (
    <section className="comments" aria-labelledby="comments-h">
      <h2 className="h-lg" id="comments-h">
        Comments {user ? <span className="count">{comments.length}</span> : null}
      </h2>

      {user ? (
        <>
          <form className="cform" onSubmit={submit} noValidate>
            <label className="fl" htmlFor="comment">Join the conversation as {user.name}</label>
            <textarea className="ta" id="comment" rows={3} maxLength={MAX} value={text} onChange={(e) => { setText(e.target.value); setError(""); }} aria-invalid={error ? true : undefined} placeholder="Share a thought or ask a question" />
            {error ? <p className="ferr" role="alert">{error}</p> : null}
            <div className="cform-row">
              <span className="dim">{text.length}/{MAX}</span>
              <button type="submit" className="btn" disabled={busy}>{busy ? "Posting…" : "Post comment"} <span className="arr" aria-hidden="true">→</span></button>
            </div>
          </form>

          {comments.length === 0 ? (
            <p className="dim cempty">No comments yet. Be the first to share a thought.</p>
          ) : (
            <ul className="clist">
              {comments.map((c) => (
                <li key={c.id}>
                  <span className="avatar" aria-hidden="true">{c.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <p className="cmeta">
                      <strong>{c.name}</strong> <time dateTime={c.createdAt}>{when(c.createdAt)}</time>
                      {user.admin || c.userId === user.id ? <button type="button" className="cdel" onClick={() => remove(c.id)}>Delete</button> : null}
                    </p>
                    <p className="ctext">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : gated ? (
        <p className="dim">Sign up or log in above to read and join the comments.</p>
      ) : (
        <p className="dim">
          <Link className="tl-inline" href={signupHref}>Sign up</Link> or <Link className="tl-inline" href={loginHref}>log in</Link> to read and join the comments.
        </p>
      )}
    </section>
  );
}
