"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type Comment = { id: string; name: string; text: string; date: string };

type Props = {
  slug: string;
  /** Signed-in reader's display name, or null when signed out. */
  userName: string | null;
  loginHref: string;
  signupHref: string;
};

const MAX = 1000;
const key = (slug: string) => `vexa:comments:${slug}`;

/*
 * Comments are kept in this browser's localStorage for now, so the feature can be reviewed
 * without a backend. Replace `load` and `save` with API calls when the database exists.
 */
function load(slug: string): Comment[] {
  try {
    const raw = window.localStorage.getItem(key(slug));
    return raw ? (JSON.parse(raw) as Comment[]) : [];
  } catch {
    return [];
  }
}

function save(slug: string, comments: Comment[]) {
  try {
    window.localStorage.setItem(key(slug), JSON.stringify(comments));
  } catch {
    /* storage unavailable */
  }
}

function when(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function Comments({ slug, userName, loginHref, signupHref }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setComments(load(slug)), [slug]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!userName) return;
    const value = text.trim();
    if (!value) {
      setError("Write something before posting.");
      return;
    }
    const next: Comment[] = [
      { id: `${Date.now()}`, name: userName, text: value, date: new Date().toISOString() },
      ...comments,
    ];
    setComments(next);
    save(slug, next);
    setText("");
    setError("");
  }

  return (
    <section className="comments" aria-labelledby="comments-h">
      <h2 className="h-lg" id="comments-h">
        Comments <span className="count">{comments.length}</span>
      </h2>

      {userName ? (
        <form className="cform" onSubmit={submit} noValidate>
          <label className="fl" htmlFor="comment">Join the conversation as {userName}</label>
          <textarea
            className="ta"
            id="comment"
            rows={3}
            maxLength={MAX}
            value={text}
            onChange={(e) => { setText(e.target.value); setError(""); }}
            aria-invalid={error ? true : undefined}
            placeholder="Share a thought or ask a question"
          />
          {error ? <p className="ferr">{error}</p> : null}
          <div className="cform-row">
            <span className="dim">{text.length}/{MAX}</span>
            <button type="submit" className="btn">Post comment <span className="arr" aria-hidden="true">→</span></button>
          </div>
        </form>
      ) : (
        <div className="clock">
          <p><strong>Log in to comment.</strong> Create a free account or log in to join the conversation.</p>
          <div className="row">
            <Link className="btn" href={signupHref}>Sign up <span className="arr" aria-hidden="true">→</span></Link>
            <Link className="btn btn--line" href={loginHref}>Log in</Link>
          </div>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="dim cempty">No comments yet. Be the first to share a thought.</p>
      ) : (
        <ul className="clist">
          {comments.map((c) => (
            <li key={c.id}>
              <span className="avatar" aria-hidden="true">{c.name.charAt(0).toUpperCase()}</span>
              <div>
                <p className="cmeta"><strong>{c.name}</strong> <time dateTime={c.date}>{when(c.date)}</time></p>
                <p className="ctext">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
