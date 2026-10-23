import Link from "next/link";
import { mailThreadAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { MailIcon, type MailIconName } from "@/components/admin/MailIcons";
import { ThreadComposer } from "@/components/admin/MailForms";
import { MailMessage, type MessageView } from "@/components/admin/MailMessage";
import { MailMenu, PrintButton } from "@/components/admin/MailMenu";
import { MarkRead } from "@/components/admin/MarkRead";
import { ago, gmailDate } from "@/lib/format";
import { ADDRESSES, BOX_LABEL, getThread, isRiskyFile, MailError, type Address, type MailThread as Thread } from "@/lib/gmail";

const OPTIONS = (Object.keys(ADDRESSES) as Address[]).map((a) => ({ value: a, label: ADDRESSES[a] }));

export type ThreadNav = { index: number; total: number; prev?: string; next?: string };

function sender(value: string) {
  const m = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>/);
  const email = (m?.[2] ?? value).trim();
  const name = (m?.[1] ?? "").trim() || email.split("@")[0] || "Unknown";
  return { name, email };
}

/** Splits a header such as `"A" <a@x.com>, B <b@x.com>` at the commas that are not inside quotes. */
function splitAddresses(value: string): string[] {
  const parts: string[] = [];
  let current = "";
  let quoted = false;
  let angle = false;
  for (const ch of value) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch === "<") angle = true;
    else if (!quoted && ch === ">") angle = false;
    if (ch === "," && !quoted && !angle) {
      parts.push(current);
      current = "";
    } else current += ch;
  }
  parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/** Recipients in plain words: our own addresses by their name (Support, Contact, Partnerships), others by name or address. */
function recipients(value: string): string {
  const names = splitAddresses(value).map((part) => {
    const { name, email } = sender(part);
    const mine = (Object.keys(ADDRESSES) as Address[]).find((a) => ADDRESSES[a] === email.toLowerCase());
    return mine ? BOX_LABEL[mine] : name === email.split("@")[0] ? email : name;
  });
  if (!names.length) return "—";
  return names.length > 3 ? `${names.slice(0, 3).join(", ")} +${names.length - 3}` : names.join(", ");
}

const initials = (name: string) => name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";
const hue = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const fileSize = (n: number) => (n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : n ? `${n} B` : "");

function view(m: Thread["messages"][number]): MessageView {
  const from = sender(m.from);
  return {
    id: m.id,
    mine: m.mine,
    name: m.mine ? "Vexa" : from.name,
    email: from.email,
    initials: initials(from.name),
    hue: hue(from.email),
    toLine: recipients(m.to),
    details: [
      ["from", m.from || "—"],
      ["to", m.to || "—"],
      ...(m.cc ? ([["cc", m.cc]] as [string, string][]) : []),
      ["date", `${gmailDate(m.at)} (IST)`],
    ],
    date: gmailDate(m.at),
    ago: ago(m.at),
    peek: m.text.replace(/\s+/g, " ").slice(0, 120),
    html: m.html,
    hasRemoteImages: m.hasRemoteImages,
    hasQuoted: m.hasQuoted,
    guess: Math.min(900, Math.max(48, Math.round((m.text.split("\n").length + m.text.length / 90) * 25 + 12))),
    files: m.attachments.map((a) => ({ id: a.id, name: a.name, size: fileSize(a.size), blocked: isRiskyFile(a.name) })),
  };
}

/** One mail conversation, laid out like Gmail: an icon toolbar, the subject, the messages, then Reply and Forward. */
export async function MailThread({ id, ctx, back, sent, error, nav }: { id: string; ctx: string; back: string; sent: boolean; error: string; nav?: ThreadNav }) {
  let thread: Thread;
  try {
    thread = await getThread(id);
  } catch (e) {
    return (
      <article className="adm-msgview">
        <Link href={back} className="adm-back adm-inbox-back">← Inbox</Link>
        <p className="adm-empty">{e instanceof MailError ? e.message : "This conversation could not be loaded."}</p>
      </article>
    );
  }
  const last = thread.messages[thread.messages.length - 1];
  const defaultFrom = thread.box === "other" ? "partnerships" : thread.box;
  const gmailUrl = `https://mail.google.com/mail/u/0/#all/${thread.id}`;
  const fwdSubject = /^fwd?:/i.test(thread.subject) ? thread.subject : `Fwd: ${thread.subject}`;
  const fwdBody = `\n\n---------- Forwarded message ---------\nFrom: ${last.from}\nDate: ${gmailDate(last.at)} (IST)\nSubject: ${thread.subject}\nTo: ${last.to}\n\n${last.text}`.slice(0, 19_000);

  const tool = (op: string, title: string, icon: MailIconName, confirm?: string) => (
    <form action={mailThreadAction}>
      <input type="hidden" name="thread" value={thread.id} />
      <input type="hidden" name="ctx" value={ctx} />
      <input type="hidden" name="op" value={op} />
      {confirm ? (
        <ConfirmButton message={confirm} className="adm-icon-btn" title={title} aria-label={title}><MailIcon name={icon} /></ConfirmButton>
      ) : (
        <button type="submit" className="adm-icon-btn" title={title} aria-label={title}><MailIcon name={icon} /></button>
      )}
    </form>
  );

  return (
    <article className="adm-gm">
      <MarkRead itemKey={`mail:${thread.id}`} unread={thread.unread} />

      <div className="adm-gm-bar">
        <Link href={back} className="adm-icon-btn" title="Back to the inbox" aria-label="Back to the inbox"><MailIcon name="back" /></Link>
        <div className="adm-gm-tools">
          {thread.trashed || thread.spam || !thread.inInbox ? tool("inbox", "Move to inbox", "inbox") : tool("archive", "Archive", "archive")}
          {!thread.spam && !thread.trashed ? tool("spam", "Report spam", "spam", "Report this conversation as spam?") : null}
          {!thread.trashed ? tool("trash", "Delete", "trash", "Move this conversation to the trash?") : null}
          <span className="adm-gm-sep" aria-hidden="true" />
          {tool("unread", "Mark as unread", "unread")}
          <MailMenu label="More">
            <form action={mailThreadAction}>
              <input type="hidden" name="thread" value={thread.id} />
              <input type="hidden" name="ctx" value={ctx} />
              <input type="hidden" name="op" value={thread.starred ? "unstar" : "star"} />
              <button type="submit" role="menuitem">{thread.starred ? "Remove the star" : "Add a star"}</button>
            </form>
            <PrintButton asItem />
            <a href={gmailUrl} target="_blank" rel="noopener noreferrer" role="menuitem">Open in Gmail</a>
          </MailMenu>
        </div>
        {nav && nav.total > 0 ? (
          <div className="adm-gm-pos">
            <span>{nav.index} of {nav.total}</span>
            {nav.prev ? <Link href={nav.prev} className="adm-icon-btn" title="Newer" aria-label="Newer conversation"><MailIcon name="prev" size={16} /></Link> : <span className="adm-icon-btn is-off"><MailIcon name="prev" size={16} /></span>}
            {nav.next ? <Link href={nav.next} className="adm-icon-btn" title="Older" aria-label="Older conversation"><MailIcon name="next" size={16} /></Link> : <span className="adm-icon-btn is-off"><MailIcon name="next" size={16} /></span>}
          </div>
        ) : null}
      </div>

      <div className="adm-gm-page">
        <header className="adm-gm-subject">
          <h2>{thread.subject}</h2>
          <span className="adm-chip">{BOX_LABEL[thread.box]}</span>
          {thread.starred ? <span className="adm-chip adm-chip--star">Starred</span> : null}
          <span className="adm-gm-subject-tools">
            <PrintButton />
            <a className="adm-icon-btn" href={gmailUrl} target="_blank" rel="noopener noreferrer" title="Open in Gmail" aria-label="Open in Gmail"><MailIcon name="open" /></a>
          </span>
        </header>

        {sent ? <p className="adm-note">Sent.</p> : null}
        {error ? <p className="adm-note adm-note--error" role="alert">{error}</p> : null}

        <div className="adm-gm-msgs">
          {thread.messages.map((m, i) => (
            <MailMessage key={m.id} m={view(m)} thread={thread.id} ctx={ctx} starred={thread.starred} startOpen={i === thread.messages.length - 1} gmailUrl={gmailUrl} />
          ))}
        </div>

        <ThreadComposer thread={thread.id} ctx={ctx} options={OPTIONS} defaultFrom={defaultFrom} defaultTo={thread.replyTo} forward={{ subject: fwdSubject, body: fwdBody }} />
      </div>
    </article>
  );
}
