"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { DraftContent } from "@/lib/gmail";
import { composeMailAction, discardDraftAction, saveDraftAction, type MailFormState } from "@/app/admin/actions";
import { MailIcon } from "./MailIcons";

type Option = { value: string; label: string };
type Mode = "closed" | "open" | "min" | "max";
const idle: MailFormState = { error: "" };
const MAX_FILES = 10;
const MAX_BYTES = 20 * 1024 * 1024;
const EMOJI = ["😀", "😊", "😉", "😍", "😎", "🤔", "😅", "😂", "🙏", "👍", "👏", "🎉", "🔥", "✨", "💡", "✅", "❌", "⭐", "❤️", "👋", "🙌", "📎", "📅", "🚀"];
const size = (n: number) => (n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function Send() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="adm-gm-send" disabled={pending} aria-busy={pending}>
      {pending ? "Sending…" : "Send"}
    </button>
  );
}

const Icon = ({ d, size: s = 18 }: { d: string; size?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

/** Run a formatting command on the selected text in the message area. */
const format = (command: string, value?: string) => document.execCommand(command, false, value);

/**
 * Gmail-style compose window. It floats in the bottom-right corner, so whatever is open underneath stays open. It can be
 * minimised to its title bar, expanded, or closed. The message can be formatted, linked, given emoji and files.
 */
export function ComposeWindow({ options }: { options: Option[] }) {
  const [mode, setMode] = useState<Mode>("closed");
  const [state, action] = useActionState(composeMailAction, idle);
  const [files, setFiles] = useState<File[]>([]);
  const [cc, setCc] = useState(false);
  const [bcc, setBcc] = useState(false);
  const [bar, setBar] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const [problem, setProblem] = useState("");
  const [draft, setDraft] = useState("");
  const [seed, setSeed] = useState<DraftContent | null>(null);
  const editor = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  const modeRef = useRef<Mode>("closed");
  const contentRef = useRef<() => boolean>(() => false);

  const reset = () => {
    form.current?.reset();
    if (editor.current) editor.current.innerHTML = "";
    setFiles([]);
    setCc(false);
    setBcc(false);
    setBar(false);
    setEmoji(false);
    setProblem("");
    setDraft("");
    setSeed(null);
    setMode("closed");
  };

  useEffect(() => {
    const open = (e: Event) => {
      const saved = (e as CustomEvent<DraftContent | undefined>).detail;
      if (saved && typeof saved === "object" && "id" in saved) {
        // opening a saved draft; a message being written is not replaced
        if (modeRef.current !== "closed" && contentRef.current()) return window.dispatchEvent(new CustomEvent("vexa:toast", { detail: "Close the message you are writing first" }));
        setSeed(saved);
        setDraft(saved.id);
        setCc(Boolean(saved.cc));
        setBcc(Boolean(saved.bcc));
        setFiles(saved.files.map((f) => new File([Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0))], f.name, { type: f.type })));
        setProblem(saved.lostFiles ? `${saved.lostFiles} attachment${saved.lostFiles === 1 ? "" : "s"} of this draft could not be loaded. Attach again if needed.` : "");
        setMode("open");
        return;
      }
      setMode((m) => (m === "closed" || m === "min" ? "open" : m));
      window.setTimeout(() => form.current?.querySelector<HTMLInputElement>("input[name=to]")?.focus(), 60);
    };
    window.addEventListener("vexa:compose", open);
    return () => window.removeEventListener("vexa:compose", open);
  }, []);

  useEffect(() => {
    if (!state.sent) return;
    reset();
    window.dispatchEvent(new CustomEvent("vexa:toast", { detail: "Message sent" }));
  }, [state]);

  modeRef.current = mode;
  useEffect(() => {
    if (editor.current && seed) editor.current.innerHTML = seed.html;
  }, [seed, mode]);

  if (mode === "closed") return null;

  const hasContent = () => Boolean(editor.current?.innerText.trim() || form.current?.querySelector<HTMLInputElement>("input[name=subject]")?.value.trim() || files.length);
  contentRef.current = hasContent;
  const collect = () => {
    const fd = new FormData(form.current ?? undefined);
    fd.set("html", editor.current?.innerHTML ?? "");
    fd.set("body", editor.current?.innerText ?? "");
    fd.delete("files");
    for (const f of files) fd.append("files", f);
    fd.set("draft", draft);
    return fd;
  };
  const toast = (text: string) => window.dispatchEvent(new CustomEvent("vexa:toast", { detail: text }));
  // closing keeps the message as a draft, as Gmail does; an empty window just closes
  const close = async () => {
    if (!hasContent()) {
      if (draft) void discardDraftAction(draft);
      return reset();
    }
    const result = await saveDraftAction(collect());
    if (result.error) {
      setProblem(`${result.error} The message is still here.`);
      return;
    }
    toast("Draft saved");
    reset();
  };
  const discard = () => {
    if (draft) void discardDraftAction(draft);
    toast("Draft discarded");
    reset();
  };

  const send = (fd: FormData) => {
    fd.set("html", editor.current?.innerHTML ?? "");
    fd.set("body", editor.current?.innerText ?? "");
    fd.delete("files");
    for (const f of files) fd.append("files", f);
    setProblem("");
    return action(fd);
  };

  const addFiles = (picked: FileList | null) => {
    if (!picked?.length) return;
    const next = [...files, ...Array.from(picked)];
    if (next.length > MAX_FILES) return setProblem(`You can attach up to ${MAX_FILES} files.`);
    if (next.reduce((n, f) => n + f.size, 0) > MAX_BYTES) return setProblem("The attachments can be 20 MB in all.");
    setProblem("");
    setFiles(next);
    if (picker.current) picker.current.value = "";
  };

  const link = () => {
    const url = window.prompt("Link address (starting with https://)");
    if (url && /^(https?:\/\/|mailto:)/i.test(url.trim())) format("createLink", url.trim());
  };
  const insert = (text: string) => {
    editor.current?.focus();
    format("insertText", text);
    setEmoji(false);
  };
  const keep = (e: React.MouseEvent) => e.preventDefault(); // keeps the text selected while a toolbar button is pressed

  return (
    <>
      {mode === "max" ? <div className="adm-cw-backdrop" onClick={() => setMode("open")} /> : null}
      <form ref={form} action={send} className={`adm-cw adm-cw--${mode}`} aria-label="New message">
        <header className="adm-cw-head" onClick={() => mode === "min" && setMode("open")}>
          <strong>New Message</strong>
          <div className="adm-cw-ctl" onClick={(e) => e.stopPropagation()}>
            <button type="button" title="Minimise" aria-label="Minimise" onClick={() => setMode(mode === "min" ? "open" : "min")}><Icon d="M6 18h12" size={16} /></button>
            <button type="button" title={mode === "max" ? "Exit full screen" : "Full screen"} aria-label="Full screen" onClick={() => setMode(mode === "max" ? "open" : "max")}><Icon d={mode === "max" ? "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" : "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"} size={16} /></button>
            <button type="button" title="Save & close" aria-label="Save and close" onClick={close}><Icon d="M6 6l12 12M18 6 6 18" size={16} /></button>
          </div>
        </header>

        <div className="adm-cw-body">
          <input type="hidden" name="draft" value={draft} />
          <label className="adm-cw-row">
            <span>From</span>
            <select name="from" className="adm-gm-input" defaultValue={state.values?.from ?? seed?.from ?? "partnerships"}>
              {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="adm-cw-row">
            <span>To</span>
            <input name="to" className="adm-gm-input" maxLength={600} autoComplete="off" defaultValue={state.values?.to ?? seed?.to} />
            <span className="adm-cw-links">
              {!cc ? <button type="button" onClick={() => setCc(true)}>Cc</button> : null}
              {!bcc ? <button type="button" onClick={() => setBcc(true)}>Bcc</button> : null}
            </span>
          </label>
          {cc || state.values?.cc ? (
            <label className="adm-cw-row"><span>Cc</span><input name="cc" className="adm-gm-input" maxLength={600} defaultValue={state.values?.cc ?? seed?.cc} /></label>
          ) : null}
          {bcc || state.values?.bcc ? (
            <label className="adm-cw-row"><span>Bcc</span><input name="bcc" className="adm-gm-input" maxLength={600} defaultValue={state.values?.bcc ?? seed?.bcc} /></label>
          ) : null}
          <label className="adm-cw-row">
            <span className="sr-only">Subject</span>
            <input name="subject" className="adm-gm-input" placeholder="Subject" maxLength={300} defaultValue={state.values?.subject ?? seed?.subject} />
          </label>

          <div
            ref={editor}
            className="adm-cw-editor"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Message"
            onPaste={(e) => {
              e.preventDefault();
              format("insertText", e.clipboardData.getData("text/plain"));
            }}
          />

          {files.length ? (
            <ul className="adm-cw-files" aria-label="Attachments">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`}>
                  <span>{f.name} <small>{size(f.size)}</small></span>
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</button>
                </li>
              ))}
            </ul>
          ) : null}
          {problem || state.error ? <p className="adm-note adm-note--error adm-gm-error" role="alert">{problem || state.error}</p> : null}
        </div>

        {bar ? (
          <div className="adm-cw-format" role="toolbar" aria-label="Formatting">
            <button type="button" title="Bold" aria-label="Bold" onMouseDown={keep} onClick={() => format("bold")}><b>B</b></button>
            <button type="button" title="Italic" aria-label="Italic" onMouseDown={keep} onClick={() => format("italic")}><i>I</i></button>
            <button type="button" title="Underline" aria-label="Underline" onMouseDown={keep} onClick={() => format("underline")}><u>U</u></button>
            <span className="adm-gm-sep" aria-hidden="true" />
            <button type="button" title="Bulleted list" aria-label="Bulleted list" onMouseDown={keep} onClick={() => format("insertUnorderedList")}><Icon d="M9 6h11M9 12h11M9 18h11M4.5 6v.01M4.5 12v.01M4.5 18v.01" /></button>
            <button type="button" title="Numbered list" aria-label="Numbered list" onMouseDown={keep} onClick={() => format("insertOrderedList")}><Icon d="M10 6h10M10 12h10M10 18h10M4 5l1-1v4M4 13h2l-2 3h2M4 19h2v1H4" /></button>
            <button type="button" title="Quote" aria-label="Quote" onMouseDown={keep} onClick={() => format("formatBlock", "blockquote")}><Icon d="M6 8h4v4H6zM14 8h4v4h-4zM8 12v2M16 12v2" /></button>
            <span className="adm-gm-sep" aria-hidden="true" />
            <button type="button" title="Clear formatting" aria-label="Clear formatting" onMouseDown={keep} onClick={() => format("removeFormat")}><Icon d="M5 5h14M9 5l-2 14M15 5l-2 14M4 19l16-14" /></button>
          </div>
        ) : null}

        {emoji ? (
          <div className="adm-cw-emoji" role="listbox" aria-label="Emoji">
            {EMOJI.map((e) => <button type="button" key={e} onMouseDown={keep} onClick={() => insert(e)}>{e}</button>)}
          </div>
        ) : null}

        <footer className="adm-cw-foot">
          <Send />
          <div className="adm-cw-tools">
            <button type="button" className={bar ? "is-on" : ""} title="Formatting options" aria-label="Formatting options" aria-pressed={bar} onClick={() => setBar((v) => !v)}><span aria-hidden="true">Aa</span></button>
            <button type="button" title="Attach files" aria-label="Attach files" onClick={() => picker.current?.click()}><Icon d="M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7L9.2 17.2a1.7 1.7 0 0 1-2.4-2.4L14 7.6" /></button>
            <button type="button" title="Insert link" aria-label="Insert link" onMouseDown={keep} onClick={link}><Icon d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></button>
            <button type="button" className={emoji ? "is-on" : ""} title="Insert emoji" aria-label="Insert emoji" aria-expanded={emoji} onClick={() => setEmoji((v) => !v)}><Icon d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14a4 4 0 0 0 7 0M9 9.5v.01M15 9.5v.01" /></button>
          </div>
          <input ref={picker} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
          <button type="button" className="adm-icon-btn" title="Discard draft" aria-label="Discard draft" onClick={discard}><MailIcon name="trash" /></button>
        </footer>
      </form>
    </>
  );
}
