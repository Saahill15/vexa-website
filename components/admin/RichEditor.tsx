"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

type Tool = { label: string; title: string; active: boolean; run: () => void; cls?: string; disabled?: boolean };

/**
 * Formatting editor for articles. The press council site's news editor was the reference for what it can do (headings, bold,
 * italic, underline, links, lists, quotes, undo); the look and the toolbar are Vexa's own. The HTML goes in a hidden input
 * named `name`, and the server cleans it again on save.
 */
export function RichEditor({ name, initialHtml, label, onHtml }: { name: string; initialHtml: string; label: string; onHtml?: (html: string) => void }) {
  const [html, setHtml] = useState(initialHtml);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true } })],
    content: initialHtml,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true, // so the buttons always show what the selected words are (heading, bold, link…)
    onUpdate: ({ editor: e }) => {
      const h = e.isEmpty ? "" : e.getHTML();
      setHtml(h);
      onHtml?.(h);
    },
    editorProps: { attributes: { class: "prose-body adm-rich-area", "aria-label": label, role: "textbox", "aria-multiline": "true" } },
  });

  const setLink = (e: Editor) => {
    const prev = e.getAttributes("link").href as string | undefined;
    const url = window.prompt("Web address for this link (starts with https://). Leave empty to remove the link.", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") e.chain().focus().extendMarkRange("link").unsetLink().run();
    else e.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const groups: Tool[][] = editor ? [
    [
      { label: "Heading", title: "Heading for a section", active: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
      { label: "Subheading", title: "Smaller heading", active: editor.isActive("heading", { level: 3 }), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    ],
    [
      { label: "B", title: "Bold", cls: "is-b", active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
      { label: "I", title: "Italic", cls: "is-i", active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
      { label: "U", title: "Underline", cls: "is-u", active: editor.isActive("underline"), run: () => editor.chain().focus().toggleUnderline().run() },
      { label: "Link", title: "Link the selected words to a web page", active: editor.isActive("link"), run: () => setLink(editor) },
    ],
    [
      { label: "Bullets", title: "Bulleted list", active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
      { label: "Numbers", title: "Numbered list", active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
      { label: "Quote", title: "Pull quote", active: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
      { label: "Line", title: "Divider line", active: false, run: () => editor.chain().focus().setHorizontalRule().run() },
    ],
    [
      { label: "Undo", title: "Undo", active: false, disabled: !editor.can().undo(), run: () => editor.chain().focus().undo().run() },
      { label: "Redo", title: "Redo", active: false, disabled: !editor.can().redo(), run: () => editor.chain().focus().redo().run() },
    ],
  ] : [];

  return (
    <div className="adm-rich">
      <input type="hidden" name={name} value={html} />
      {editor ? (
        <div role="toolbar" aria-label="Formatting" className="adm-rich-bar">
          {groups.map((g, i) => (
            <div key={i} className="adm-rich-group" role="group">
              {g.map((t) => (
                <button key={t.label} type="button" title={t.title} aria-label={t.title} aria-pressed={t.active} data-on={t.active || undefined} disabled={t.disabled}
                  onMouseDown={(e) => e.preventDefault()} onClick={t.run} className={`adm-rich-btn${t.cls ? ` ${t.cls}` : ""}`}>{t.label}</button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}
