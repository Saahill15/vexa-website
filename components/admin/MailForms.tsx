"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { composeMailAction, replyMailAction, type MailFormState } from "@/app/admin/actions";
import { MailIcon } from "./MailIcons";

type Option = { value: string; label: string };
type Draft = { subject: string; body: string };
const idle: MailFormState = { error: "" };

function Send({ label = "Send" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="adm-gm-send" disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <span className="spin spin--small" aria-hidden="true" style={{ borderColor: "rgba(255,255,255,.35)", borderTopColor: "#fff", marginLeft: 0, marginRight: 8 }} />
          Sending…
        </>
      ) : (
        label
      )}
    </button>
  );
}

/** A labelled line in the compose card, like Gmail's "To" and "Subject" lines. */
function Line({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="adm-gm-row">
      <span>{label}</span>
      {children}
    </label>
  );
}

const MAX_FILES = 10;
const MAX_BYTES = 20 * 1024 * 1024;
const EMOJI = ["😀", "😊", "😉", "😍", "😎", "🤔", "😅", "😂", "🙏", "👍", "👏", "🎉", "🔥", "✨", "💡", "✅", "❌", "⭐", "❤️", "👋", "🙌", "📎", "📅", "🚀"];
const size = (n: number) => (n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const format = (command: string, value?: string) => document.execCommand(command, false, value);
const keep = (e: React.MouseEvent) => e.preventDefault(); // keeps the text selected while a toolbar button is pressed
const escapeHtml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

const Svg = ({ d, size: n = 18 }: { d: string; size?: number }) => (
  <svg width={n} height={n} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

type CardProps = {
  title: string;
  icon: "reply" | "forward";
  action: (payload: FormData) => void;
  state: MailFormState;
  onClose: () => void;
  sendLabel?: string;
  children: ReactNode;
  textRows?: { placeholder?: string; defaultValue?: string };
};

/**
 * The shared compose card for Reply and Forward. It has the same tools as the floating New Message window: Cc and Bcc,
 * formatting, files, links and emoji.
 */
function ComposeCard({ title, icon, action, state, onClose, sendLabel, children, textRows }: CardProps) {
  const form = useRef<HTMLFormElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [cc, setCc] = useState(false);
  const [bcc, setBcc] = useState(false);
  const [bar, setBar] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const [problem, setProblem] = useState("");

  // the starting text (a forward's quoted message); typed text stays in the editor if sending fails
  useEffect(() => {
    if (editor.current && textRows?.defaultValue) editor.current.innerHTML = escapeHtml(textRows.defaultValue);
  }, [textRows?.defaultValue]);

  const typed = () => Boolean(editor.current?.innerText.trim() || files.length);
  const close = () => {
    if (typed() && !window.confirm("Discard this message?")) return;
    onClose();
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

  return (
    <form ref={form} action={send} className="adm-gm-compose">
      <header className="adm-gm-compose-head">
        <span><MailIcon name={icon} size={16} /> {title}</span>
        <button type="button" className="adm-icon-btn adm-icon-btn--small" title="Close" aria-label="Close" onClick={close}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </header>
      {children}
      {!cc || !bcc ? (
        <div className="adm-cw-links" style={{ justifyContent: "flex-end", padding: "6px 16px 0" }}>
          {!cc && !state.values?.cc ? <button type="button" onClick={() => setCc(true)}>Cc</button> : null}
          {!bcc && !state.values?.bcc ? <button type="button" onClick={() => setBcc(true)}>Bcc</button> : null}
        </div>
      ) : null}
      {cc || state.values?.cc ? <Line label="Cc"><input name="cc" className="adm-gm-input" maxLength={600} defaultValue={state.values?.cc} /></Line> : null}
      {bcc || state.values?.bcc ? <Line label="Bcc"><input name="bcc" className="adm-gm-input" maxLength={600} defaultValue={state.values?.bcc} /></Line> : null}

      <div
        ref={editor}
        className="adm-cw-editor"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Message"
        data-placeholder={textRows?.placeholder}
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

      {bar ? (
        <div className="adm-cw-format" role="toolbar" aria-label="Formatting">
          <button type="button" title="Bold" aria-label="Bold" onMouseDown={keep} onClick={() => format("bold")}><b>B</b></button>
          <button type="button" title="Italic" aria-label="Italic" onMouseDown={keep} onClick={() => format("italic")}><i>I</i></button>
          <button type="button" title="Underline" aria-label="Underline" onMouseDown={keep} onClick={() => format("underline")}><u>U</u></button>
          <span className="adm-gm-sep" aria-hidden="true" />
          <button type="button" title="Bulleted list" aria-label="Bulleted list" onMouseDown={keep} onClick={() => format("insertUnorderedList")}><Svg d="M9 6h11M9 12h11M9 18h11M4.5 6v.01M4.5 12v.01M4.5 18v.01" /></button>
          <button type="button" title="Numbered list" aria-label="Numbered list" onMouseDown={keep} onClick={() => format("insertOrderedList")}><Svg d="M10 6h10M10 12h10M10 18h10M4 5l1-1v4M4 13h2l-2 3h2M4 19h2v1H4" /></button>
          <button type="button" title="Quote" aria-label="Quote" onMouseDown={keep} onClick={() => format("formatBlock", "blockquote")}><Svg d="M6 8h4v4H6zM14 8h4v4h-4zM8 12v2M16 12v2" /></button>
          <span className="adm-gm-sep" aria-hidden="true" />
          <button type="button" title="Clear formatting" aria-label="Clear formatting" onMouseDown={keep} onClick={() => format("removeFormat")}><Svg d="M5 5h14M9 5l-2 14M15 5l-2 14M4 19l16-14" /></button>
        </div>
      ) : null}
      {emoji ? (
        <div className="adm-cw-emoji" role="listbox" aria-label="Emoji">
          {EMOJI.map((e) => <button type="button" key={e} onMouseDown={keep} onClick={() => insert(e)}>{e}</button>)}
        </div>
      ) : null}

      <footer className="adm-cw-foot">
        <Send label={sendLabel} />
        <div className="adm-cw-tools">
          <button type="button" className={bar ? "is-on" : ""} title="Formatting options" aria-label="Formatting options" aria-pressed={bar} onClick={() => setBar((v) => !v)}><span aria-hidden="true">Aa</span></button>
          <button type="button" title="Attach files" aria-label="Attach files" onClick={() => picker.current?.click()}><Svg d="M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7L9.2 17.2a1.7 1.7 0 0 1-2.4-2.4L14 7.6" /></button>
          <button type="button" title="Insert link" aria-label="Insert link" onMouseDown={keep} onClick={link}><Svg d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></button>
          <button type="button" className={emoji ? "is-on" : ""} title="Insert emoji" aria-label="Insert emoji" aria-expanded={emoji} onClick={() => setEmoji((v) => !v)}><Svg d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14a4 4 0 0 0 7 0M9 9.5v.01M15 9.5v.01" /></button>
        </div>
        <input ref={picker} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        <button type="button" className="adm-icon-btn" title="Discard" aria-label="Discard" onClick={close}>
          <MailIcon name="trash" />
        </button>
      </footer>
    </form>
  );
}

function FromSelect({ options, value }: { options: Option[]; value: string }) {
  return (
    <select name="from" className="adm-gm-input" defaultValue={value}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/**
 * The two buttons under a conversation, like Gmail's (Reply, Forward). Each opens its box in place, and the reply/forward
 * buttons elsewhere on the page (top bar, message menu) open the same boxes. What was typed stays if something goes wrong.
 */
export function ThreadComposer({ thread, ctx, options, defaultFrom, defaultTo, forward }: { thread: string; ctx: string; options: Option[]; defaultFrom: string; defaultTo: string; forward: Draft }) {
  const [mode, setMode] = useState<"reply" | "forward" | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const open = (next: "reply" | "forward") => () => {
      setMode(next);
      window.setTimeout(() => {
        box.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        box.current?.querySelector<HTMLElement>(next === "reply" ? "[contenteditable]" : "input[name=to]")?.focus();
      }, 60);
    };
    const reply = open("reply");
    const fwd = open("forward");
    window.addEventListener("vexa:reply", reply);
    window.addEventListener("vexa:forward", fwd);
    return () => {
      window.removeEventListener("vexa:reply", reply);
      window.removeEventListener("vexa:forward", fwd);
    };
  }, []);

  return (
    <div ref={box} className="adm-composer">
      {mode === null ? (
        <div className="adm-reply-bar">
          <button type="button" className="adm-reply-open" onClick={() => window.dispatchEvent(new Event("vexa:reply"))}>
            <MailIcon name="reply" size={18} /> Reply
          </button>
          <button type="button" className="adm-reply-open" onClick={() => window.dispatchEvent(new Event("vexa:forward"))}>
            <MailIcon name="forward" size={18} /> Forward
          </button>
        </div>
      ) : mode === "reply" ? (
        <ReplyCard thread={thread} ctx={ctx} options={options} defaultFrom={defaultFrom} defaultTo={defaultTo} onClose={() => setMode(null)} />
      ) : (
        <ForwardCard ctx={ctx} options={options} defaults={forward} onClose={() => setMode(null)} />
      )}
    </div>
  );
}

function ReplyCard({ thread, ctx, options, defaultFrom, defaultTo, onClose }: { thread: string; ctx: string; options: Option[]; defaultFrom: string; defaultTo: string; onClose: () => void }) {
  const [state, action] = useActionState(replyMailAction, idle);
  return (
    <ComposeCard title="Reply" icon="reply" action={action} state={state} onClose={onClose}>
      <input type="hidden" name="thread" value={thread} />
      <input type="hidden" name="ctx" value={ctx} />
      <Line label="From"><FromSelect options={options} value={state.values?.from ?? defaultFrom} /></Line>
      <Line label="To"><input name="to" className="adm-gm-input" defaultValue={state.values?.to ?? defaultTo} maxLength={600} required /></Line>
    </ComposeCard>
  );
}

/** Forward: a new message with the original quoted. Attachments are not carried along. */
function ForwardCard({ ctx, options, defaults, onClose }: { ctx: string; options: Option[]; defaults: Draft; onClose: () => void }) {
  const [state, action] = useActionState(composeMailAction, idle);
  useEffect(() => {
    if (!state.sent) return;
    onClose();
    window.dispatchEvent(new CustomEvent("vexa:toast", { detail: "Message sent" }));
  }, [state]);
  return (
    <ComposeCard title="Forward" icon="forward" action={action} state={state} onClose={onClose} textRows={{ defaultValue: defaults.body }}>
      <input type="hidden" name="ctx" value={ctx} />
      <Line label="From"><FromSelect options={options} value={state.values?.from ?? "partnerships"} /></Line>
      <Line label="To"><input name="to" className="adm-gm-input" maxLength={600} placeholder="name@example.com" defaultValue={state.values?.to} required /></Line>
      <Line label="Subject"><input name="subject" className="adm-gm-input" maxLength={300} defaultValue={state.values?.subject ?? defaults.subject} required /></Line>
    </ComposeCard>
  );
}
