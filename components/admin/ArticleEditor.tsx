"use client";

import { useActionState, useMemo, useState } from "react";
import { saveArticleAction, type ArticleFormState } from "@/app/admin/actions";
import { readingMinutes, type StoredArticle } from "@/content/articles";
import { textToBlocks } from "@/lib/article-text";
import { ArticleBody } from "../ArticleBody";

type Initial = Pick<StoredArticle, "slug" | "title" | "excerpt" | "category" | "date" | "previewBlocks" | "status"> & { id?: string; body: string };

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

/** Write on the left, see the article on the right. */
export function ArticleEditor({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState<ArticleFormState, FormData>(saveArticleAction, undefined);
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [body, setBody] = useState(initial.body);
  // every field is controlled: React clears uncontrolled fields after a form action, which would wipe the page on an error
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [category, setCategory] = useState(initial.category);
  const [date, setDate] = useState(initial.date);
  const [status, setStatus] = useState<string>(initial.status);
  const [previewBlocks, setPreviewBlocks] = useState(String(initial.previewBlocks));
  const blocks = useMemo(() => textToBlocks(body), [body]);

  return (
    <form action={action} className="adm-editor">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="adm-editor-main">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" className="in" maxLength={160} required value={title} onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
        </div>
        <div className="field">
          <label htmlFor="excerpt">Short summary <span>(shown on the article list and under the title)</span></label>
          <textarea id="excerpt" name="excerpt" className="in" rows={2} maxLength={300} required value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="body">Article</label>
          <textarea id="body" name="body" className="in adm-body-input" rows={22} required value={body} onChange={(e) => setBody(e.target.value)} placeholder={"Start writing. Leave a blank line between paragraphs.\n\n## A heading\n\n> A pull quote\n\n- A list item\n- Another list item"} />
          <p className="adm-hint">Blank line = new paragraph · <code>## </code> heading · <code>&gt; </code> quote · <code>- </code> list item</p>
        </div>
      </div>

      <aside className="adm-editor-side">
        <div className="adm-card">
          <div className="adm-card-head"><h2>Publishing</h2></div>
          <div className="form">
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" className="in" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft (only admins can see it)</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="date">Date shown</label>
              <input id="date" name="date" type="date" className="in" required value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="category">Category</label>
              <input id="category" name="category" className="in" list="categories" maxLength={30} required value={category} onChange={(e) => setCategory(e.target.value)} />
              <datalist id="categories"><option value="Brands" /><option value="Creators" /><option value="Esports" /></datalist>
            </div>
            <div className="field">
              <label htmlFor="slug">Web address <span>(/articles/…)</span></label>
              <input id="slug" name="slug" className="in" maxLength={100} required value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} />
            </div>
            <div className="field">
              <label htmlFor="previewBlocks">Free to read <span>(blocks before the sign-in card)</span></label>
              <input id="previewBlocks" name="previewBlocks" type="number" min={1} max={50} className="in" required value={previewBlocks} onChange={(e) => setPreviewBlocks(e.target.value)} />
            </div>
            {state?.error ? <p className="err" role="alert">{state.error}</p> : null}
            <button type="submit" className="btn" disabled={pending}>{pending ? "Saving…" : "Save article"}</button>
          </div>
        </div>

        <div className="adm-card adm-preview">
          <div className="adm-card-head"><h2>Preview</h2><span className="adm-faint">{blocks.length} blocks · {readingMinutes({ blocks })} min read</span></div>
          <h3 className="adm-preview-title">{title || "Untitled"}</h3>
          <div className="prose-body">{blocks.length ? <ArticleBody blocks={blocks} /> : <p className="adm-empty">Your article appears here as you write.</p>}</div>
        </div>
      </aside>
    </form>
  );
}
