"use client";

import { useState } from "react";
import { mailThreadAction } from "@/app/admin/actions";
import { MailBody } from "./MailBody";
import { MailIcon } from "./MailIcons";
import { MailMenu, PrintButton } from "./MailMenu";

export type FileView = { id: string; name: string; size: string; blocked: boolean };
export type MessageView = {
  id: string;
  mine: boolean;
  name: string;
  email: string;
  initials: string;
  hue: number;
  toLine: string;
  details: [string, string][];
  date: string;
  ago: string;
  peek: string;
  html: string;
  hasRemoteImages: boolean;
  hasQuoted: boolean;
  guess: number;
  files: FileView[];
};

const ask = (event: "vexa:reply" | "vexa:forward") => window.dispatchEvent(new Event(event));

/** One message, laid out like Gmail's: a sender line you can click to fold it, then the message itself. */
export function MailMessage({ m, thread, ctx, starred, startOpen, gmailUrl }: { m: MessageView; thread: string; ctx: string; starred: boolean; startOpen: boolean; gmailUrl: string }) {
  const [open, setOpen] = useState(startOpen);
  const [showDetails, setShowDetails] = useState(false);
  const hidden = { thread, ctx };

  return (
    <article className={`adm-gm-msg${open ? " is-open" : ""}${m.mine ? " is-mine" : ""}`}>
      <header className="adm-gm-head" onClick={() => setOpen((o) => !o)}>
        <span className="adm-ava" style={m.mine ? undefined : { background: `hsl(${m.hue} 45% 90%)`, color: `hsl(${m.hue} 55% 26%)` }}>{m.mine ? "V" : m.initials}</span>

        <div className="adm-gm-who">
          <div className="adm-gm-name">
            <strong>{m.name}</strong>
            <span>&lt;{m.email}&gt;</span>
          </div>
          {open ? (
            <button type="button" className="adm-gm-to" aria-expanded={showDetails} onClick={(e) => { e.stopPropagation(); setShowDetails((v) => !v); }}>
              to {m.toLine} <MailIcon name="caret" size={14} />
            </button>
          ) : (
            <span className="adm-gm-peek">{m.peek}</span>
          )}
        </div>

        <div className="adm-gm-right" onClick={(e) => e.stopPropagation()}>
          <span className="adm-gm-date">{m.date}{m.ago ? <em> ({m.ago})</em> : null}</span>
          {open ? (
            <>
              <form action={mailThreadAction}>
                <input type="hidden" name="thread" value={hidden.thread} />
                <input type="hidden" name="ctx" value={hidden.ctx} />
                <input type="hidden" name="op" value={starred ? "unstar" : "star"} />
                <button type="submit" className={`adm-icon-btn${starred ? " is-on" : ""}`} title={starred ? "Starred" : "Not starred"} aria-label={starred ? "Remove the star" : "Add a star"}>
                  <MailIcon name="star" filled={starred} />
                </button>
              </form>
              <button type="button" className="adm-icon-btn" title="Reply" aria-label="Reply" onClick={() => ask("vexa:reply")}>
                <MailIcon name="reply" />
              </button>
              <MailMenu label="More">
                <button type="button" role="menuitem" onClick={() => ask("vexa:reply")}>Reply</button>
                <button type="button" role="menuitem" onClick={() => ask("vexa:forward")}>Forward</button>
                <form action={mailThreadAction}>
                  <input type="hidden" name="thread" value={hidden.thread} />
                  <input type="hidden" name="ctx" value={hidden.ctx} />
                  <input type="hidden" name="op" value="unread" />
                  <button type="submit" role="menuitem">Mark as unread</button>
                </form>
                <PrintButton asItem />
                <a href={gmailUrl} target="_blank" rel="noopener noreferrer" role="menuitem">Open in Gmail</a>
              </MailMenu>
            </>
          ) : null}
        </div>
      </header>

      {open && showDetails ? (
        <dl className="adm-gm-details">
          {m.details.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {open ? (
        <div className="adm-gm-body">
          <MailBody html={m.html} hasRemoteImages={m.hasRemoteImages} hasQuoted={m.hasQuoted} guess={m.guess} />
          {m.files.length ? (
            <ul className="adm-files" aria-label="Attachments">
              {m.files.map((f) =>
                f.blocked ? (
                  <li key={f.id}><span className="adm-file is-blocked" title="This kind of file can run on a computer, so it is not offered here. Open it in Gmail if you trust the sender.">{f.name} · blocked</span></li>
                ) : (
                  <li key={f.id}>
                    <a className="adm-file" href={`/admin/inbox/attachment?message=${encodeURIComponent(m.id)}&attachment=${encodeURIComponent(f.id)}`} download>
                      {f.name}{f.size ? ` · ${f.size}` : ""}
                    </a>
                  </li>
                ),
              )}
            </ul>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
