import Link from "next/link";
import { Suspense } from "react";
import { inboxDeleteCommentAction, inboxStatusAction, markAllReadAction, syncMailAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DraftOpener } from "@/components/admin/DraftOpener";
import { FolderMenu } from "@/components/admin/FolderMenu";
import { LinkPending } from "@/components/admin/LinkPending";
import { MailAutoRefresh } from "@/components/admin/MailAutoRefresh";
import { ComposeButton, MailToast } from "@/components/admin/MailToast";
import { ComposeWindow } from "@/components/admin/ComposeWindow";
import { MailThread, type ThreadNav } from "@/components/admin/MailThread";
import { MarkRead } from "@/components/admin/MarkRead";
import { SplitHandle } from "@/components/admin/SplitHandle";
import { StatusDot } from "@/components/admin/StatusDot";
import { SyncButton } from "@/components/admin/SyncButton";
import { Icon, type IconName } from "@/components/Icon";
import { InboxListSkeleton, ThreadSkeleton } from "@/components/Skeletons";
import { adminOnly } from "@/lib/admin-guard";
import { ADDRESSES, BOX_LABEL, FOLDERS, getDraft, isFolder, listFolder, mailConfigured, queryThreads, type Address, type Box, type Folder } from "@/lib/gmail";
import { STATUSES } from "@/lib/enquiries";
import { formatDateTime, ROLE_LABEL } from "@/lib/format";
import { loadInbox, unreadCount, type InboxItem, type InboxType } from "@/lib/inbox";
import { istIso } from "@/lib/time";

export const metadata = { title: "Inbox" };

const FILTERS: { value: "all" | InboxType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mail", label: "Mail" },
  { value: "enquiry", label: "Enquiries" },
  { value: "comment", label: "Comments" },
  { value: "signup", label: "Sign-ups" },
];
const ICON: Record<InboxType, IconName> = { enquiry: "mail", comment: "chat", signup: "users", mail: "inbox" };
const BOXES: ("all" | Box)[] = ["all", "partnerships", "support", "contact", "other"];
const OPTIONS = (Object.keys(ADDRESSES) as Address[]).map((a) => ({ value: a, label: ADDRESSES[a] }));

const IST = "Asia/Kolkata";
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: IST });
function dayLabel(iso: string): string {
  const today = dayKey(istIso());
  const yesterday = dayKey(istIso(Date.now() - 86400_000));
  const k = dayKey(iso);
  if (k === today) return "Today";
  if (k === yesterday) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: IST });
}
const clock = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: IST });
const initials = (name: string) => name.split(/[\s._@-]+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";
const hue = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

type Params = { filter?: string; item?: string; box?: string; folder?: string; q?: string; unread?: string; starred?: string; compose?: string; sent?: string; error?: string };
type View = { active: "all" | InboxType; box: "all" | Box; folder: Folder; q: string; unread: boolean; starred: boolean; compose: boolean; selectedKey: string };

function readView(params: Params): View {
  const active = FILTERS.find((f) => f.value === params.filter)?.value ?? "all";
  const box = (BOXES as string[]).includes(params.box ?? "") ? (params.box as "all" | Box) : "all";
  const folder: Folder = isFolder(params.folder) ? params.folder : "inbox";
  return { active, box, folder, q: (params.q ?? "").trim().slice(0, 200), unread: params.unread === "1", starred: params.starred === "1", compose: params.compose === "1", selectedKey: params.item ?? "" };
}

/** The address of a view, with any settings changed. Only what matters is written, so addresses stay short. */
function hrefFor(view: View, change: Partial<View> = {}): string {
  const v = { ...view, ...change };
  const p = new URLSearchParams({ filter: v.active });
  if (v.active === "mail" && v.folder !== "inbox") p.set("folder", v.folder);
  if (v.active === "mail" && v.box !== "all") p.set("box", v.box);
  if (v.q) p.set("q", v.q);
  if (v.unread) p.set("unread", "1");
  if (v.starred) p.set("starred", "1");
  if (v.compose) p.set("compose", "1");
  if (v.selectedKey) p.set("item", v.selectedKey);
  return `/admin/inbox?${p.toString()}`;
}
const listHref = (view: View) => hrefFor(view, { selectedKey: "", compose: false });
const contextOf = (view: View) => listHref(view).split("?")[1];

/*
 * The page frame is sent at once. The list and the open item each load inside their own Suspense, keyed so that choosing a
 * filter, an address tab or a message shows a placeholder straight away instead of leaving the old screen in place.
 */
export default async function InboxPage({ searchParams }: { searchParams: Promise<Params> }) {
  const admin = await adminOnly();
  const params = await searchParams;
  const view = readView(params);

  return (
    <>
    <div className={`adm-inbox${view.selectedKey ? " has-item" : ""}`}>
      <section className="adm-inbox-list" aria-label="Inbox">
        <Suspense key={`${view.active}:${view.folder}:${view.box}:${view.q}:${view.unread}:${view.starred}`} fallback={<InboxListSkeleton />}>
          <InboxList adminId={admin.id} view={view} />
        </Suspense>
      </section>

      <SplitHandle />

      <section className="adm-inbox-detail" aria-label="Selected message">
        <Suspense key={`${view.selectedKey}:${view.compose}`} fallback={view.selectedKey ? <ThreadSkeleton /> : null}>
          <InboxDetail adminId={admin.id} view={view} sent={params.sent === "1"} error={params.error ?? ""} />
        </Suspense>
      </section>
    </div>
    <ComposeWindow options={OPTIONS} />
    <MailToast />
    </>
  );
}

function Avatar({ item }: { item: InboxItem }) {
  if (item.type !== "mail") return <span className="adm-ava adm-ava--icon"><Icon name={ICON[item.type]} size={16} /></span>;
  const h = hue(item.title);
  return <span className="adm-ava" style={{ background: `hsl(${h} 45% 90%)`, color: `hsl(${h} 55% 26%)` }}>{initials(item.title)}</span>;
}

async function InboxList({ adminId, view }: { adminId: string; view: View }) {
  const { active, box, q } = view;
  const wantsMail = active === "all" || active === "mail";
  // the folder numbers are quick once saved; the first time they get 1.5 seconds before the page goes on without them
  // the folder numbers are not loaded here: each one costs a Gmail call, and the menu fetches them only when it is opened
  const data = await loadInbox(adminId, { mail: wantsMail, query: q, folder: view.folder });
  const shown = data.items.filter(
    (i) =>
      (active === "all" || i.type === active) &&
      (active !== "mail" || box === "all" || i.box === box) &&
      (!view.unread || i.unread) &&
      (!view.starred || i.starred),
  );
  const unread = unreadCount(data.items);
  const countOf = (t: string) => data.items.filter((i) => (t === "all" || i.type === t) && i.unread).length;
  const countOfBox = (b: "all" | Box) => data.items.filter((i) => i.type === "mail" && i.unread && (b === "all" || i.box === b)).length;
  const mailOn = data.mail.configured;

  // group the list by day
  const groups: { label: string; items: InboxItem[] }[] = [];
  for (const i of shown) {
    const label = dayLabel(i.at);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(i);
    else groups.push({ label, items: [i] });
  }
  const filtered = Boolean(q || view.unread || view.starred);

  return (
    <>
      <header className="adm-inbox-head">
        <h1>Inbox {unread > 0 ? <em>{unread} unread</em> : null}</h1>
        <div className="adm-inbox-tools">
          {mailOn ? (
            <ComposeButton />
          ) : null}
          <form action={markAllReadAction}><button type="submit" className="adm-mini" disabled={unread === 0}>Mark all read</button></form>
        </div>
      </header>

      <form action="/admin/inbox" method="get" className="adm-search" role="search">
        <input type="hidden" name="filter" value={active} />
        {active === "mail" && box !== "all" ? <input type="hidden" name="box" value={box} /> : null}
        {view.unread ? <input type="hidden" name="unread" value="1" /> : null}
        {view.starred ? <input type="hidden" name="starred" value="1" /> : null}
        <Icon name="search" size={15} />
        <input type="search" name="q" defaultValue={q} placeholder={mailOn ? "Search mail and messages" : "Search messages"} aria-label="Search the inbox" maxLength={200} />
        {q ? <Link href={hrefFor(view, { q: "" })} className="adm-search-clear" aria-label="Clear the search">Clear</Link> : null}
      </form>

      <nav className="adm-tabs adm-inbox-tabs" aria-label="Filter inbox">
        {FILTERS.filter((f) => mailOn || f.value !== "mail").map((f) => (
          <Link key={f.value} href={hrefFor(view, { active: f.value, box: "all", selectedKey: "", compose: false })} aria-current={active === f.value ? "page" : undefined}>
            {f.label}{countOf(f.value) > 0 ? <span>{countOf(f.value)}</span> : null}<LinkPending />
          </Link>
        ))}
      </nav>

      {active === "mail" && mailOn ? (
        <div className="adm-pills" aria-label="Narrow the mail">
          <FolderMenu
            current={view.folder}
            items={FOLDERS.map((f) => ({ id: f.id, label: f.label, group: f.group, href: hrefFor(view, { folder: f.id, box: "all", q: "", unread: false, starred: false, selectedKey: "" }) }))}
          />
          <span className="adm-pills-sep" aria-hidden="true" />
          {BOXES.map((b) => (
            <Link key={b} href={hrefFor(view, { box: b, selectedKey: "", compose: false })} className="adm-pill" aria-current={box === b ? "page" : undefined}>
              {b === "all" ? "All addresses" : BOX_LABEL[b]}{countOfBox(b) > 0 ? <span>{countOfBox(b)}</span> : null}<LinkPending />
            </Link>
          ))}
          <span className="adm-pills-sep" aria-hidden="true" />
          <Link href={hrefFor(view, { unread: !view.unread, selectedKey: "", compose: false })} className="adm-pill" aria-pressed={view.unread}>Unread</Link>
          <Link href={hrefFor(view, { starred: !view.starred, selectedKey: "", compose: false })} className="adm-pill" aria-pressed={view.starred}>★ Starred</Link>
        </div>
      ) : null}

      {mailOn && (active === "mail" || active === "all") ? (
        <form action={syncMailAction} className="adm-sync">
          <input type="hidden" name="box" value={box} />
          <input type="hidden" name="folder" value={view.folder} />
          <span className="adm-faint">{data.mail.syncedAt ? `Mail synced ${clock(data.mail.syncedAt)}` : "Mail not synced yet"}</span>
          <SyncButton />
        </form>
      ) : null}
      {!mailOn && active === "mail" ? <p className="adm-note">Mail is not connected yet. Follow docs/gmail-inbox.md to connect partnerships@, support@ and contact@.</p> : null}
      {data.mail.error && (active === "mail" || active === "all") ? (
        <p className="adm-note adm-note--error" role="alert">{data.mail.error}{data.mail.syncedAt ? ` Showing the list from ${clock(data.mail.syncedAt)}.` : ""}</p>
      ) : null}
      {data.mail.signature && !q ? <MailAutoRefresh signature={data.mail.signature} /> : null}

      {shown.length === 0 ? (
        <div className="adm-inbox-empty">
          <Icon name={filtered ? "search" : "inbox"} size={26} />
          <strong>{filtered ? "No matches" : data.items.length === 0 ? "Nothing here yet" : "Nothing in this view"}</strong>
          <p>{filtered ? "Try different words, or clear the search and filters." : active === "mail" ? (view.folder === "inbox" ? "Mail sent to partnerships@, support@ and contact@ arrives here." : `Nothing in ${FOLDERS.find((f) => f.id === view.folder)?.label ?? "this folder"}.`) : "Enquiries from the contact form, new comments, sign-ups and mail arrive here."}</p>
        </div>
      ) : (
        <div className="adm-inbox-scroll">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="adm-inbox-day">{g.label}</p>
              <ul>
                {g.items.map((i) => (
                  <li key={i.key}>
                    <Link
                      href={hrefFor(view, { selectedKey: i.key, compose: false })}
                      className={`adm-row${i.unread ? " is-unread" : ""}${view.selectedKey === i.key ? " is-open" : ""}`}
                      aria-current={view.selectedKey === i.key ? "true" : undefined}
                    >
                      <Avatar item={i} />
                      <span className="adm-row-main">
                        <span className="adm-row-top">
                          <strong>{i.title}</strong>
                          <span className="adm-row-time"><time dateTime={i.at}>{clock(i.at)}</time><LinkPending /></span>
                        </span>
                        {i.subject ? <span className="adm-row-subject">{i.starred ? <b aria-label="Starred">★ </b> : null}{i.subject}</span> : null}
                        <small>{i.preview}</small>
                      </span>
                      {i.unread ? <span className="adm-dot" aria-label="Unread" /> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/** "5 of 13" and the neighbouring conversations, among the mail in the current view (the list is already saved, so this is quick). */
async function mailNav(view: View): Promise<ThreadNav | undefined> {
  try {
    const threads = view.q ? await queryThreads(view.q) : await listFolder(view.folder);
    const inView = threads.filter((t) => (view.box === "all" || view.active !== "mail" || t.box === view.box) && (!view.unread || t.unread) && (!view.starred || t.starred));
    const at = inView.findIndex((t) => `mail:${t.id}` === view.selectedKey);
    if (at < 0) return undefined;
    const to = (i: number) => (inView[i] ? hrefFor(view, { selectedKey: `mail:${inView[i].id}`, compose: false }) : undefined);
    return { index: at + 1, total: inView.length, prev: to(at - 1), next: to(at + 1) };
  } catch {
    return undefined;
  }
}

async function InboxDetail({ adminId, view, sent, error }: { adminId: string; view: View; sent: boolean; error: string }) {
  const { selectedKey } = view;
  if (/^mail:[0-9a-f]{8,32}$/.test(selectedKey)) {
    if (view.folder === "drafts") {
      const draft = await getDraft(selectedKey.slice(5)).catch(() => null);
      if (draft) return <DraftOpener draft={draft} back={listHref(view)} />;
    }
    const nav = await mailNav(view);
    return <MailThread id={selectedKey.slice(5)} ctx={contextOf(view)} back={listHref(view)} sent={sent} error={error} nav={nav} />;
  }
  if (!selectedKey) {
    return (
      <div className="adm-inbox-empty adm-inbox-pick">
        {sent ? <p className="adm-note">Sent.</p> : null}
        <Icon name="mail" size={26} />
        <strong>Select a message</strong>
        <p>Pick something from the list to read it here and act on it.</p>
      </div>
    );
  }
  const data = await loadInbox(adminId);
  const item = data.items.find((i) => i.key === selectedKey);
  return item ? <Detail item={item} data={data} filter={view.active} back={listHref(view)} /> : <p className="adm-empty">That item is no longer in the inbox.</p>;
}

function Detail({ item, data, filter, back }: { item: InboxItem; data: Awaited<ReturnType<typeof loadInbox>>; filter: string; back: string }) {
  const id = item.key.slice(4);
  const mark = <MarkRead itemKey={item.key} unread={item.unread} />;
  const backLink = <Link href={back} className="adm-back adm-inbox-back">← Inbox</Link>;

  if (item.type === "enquiry") {
    const e = data.enquiries.find((x) => x.id === id);
    if (!e) return <p className="adm-empty">This enquiry no longer exists.</p>;
    const subject = encodeURIComponent("Re: your message to Vexa Digital");
    const rows: [string, React.ReactNode][] = [
      ["From", e.name ? `${e.name} · ${e.email}` : e.email],
      ["Is", ROLE_LABEL[e.role] ?? e.role],
      ["Interested in", e.interest || "Not specified"],
      ["Company or channel", e.company || "Not given"],
      ["Timing", e.launch || "Not given"],
    ];
    return (
      <article className="adm-msgview">
        {mark}{backLink}
        <header>
          <h2>{e.name || e.email}</h2>
          <p>{formatDateTime(e.at)}</p>
        </header>
        <div className="adm-msgview-actions">
          <a className="btn btn--sm" href={`mailto:${e.email}?subject=${subject}`}>Reply by email</a>
          <form action={inboxStatusAction} className="adm-inline">
            <input type="hidden" name="id" value={e.id} /><input type="hidden" name="filter" value={filter} />
            <StatusDot status={e.status} />
            <select name="status" defaultValue={e.status} aria-label="Status">{STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
            <button type="submit" className="adm-mini">Save</button>
          </form>
          <Link className="adm-mini" href={`/admin/enquiries/${e.id}`}>Open full page</Link>
        </div>
        <p className="adm-body">{e.problem}</p>
        <dl className="adm-dl">{rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}</dl>
        {e.notes ? <p className="adm-faint">Private notes: {e.notes}</p> : null}
      </article>
    );
  }

  if (item.type === "comment") {
    const c = data.comments.find((x) => x.id === id);
    if (!c) return <p className="adm-empty">This comment no longer exists.</p>;
    const article = data.articles.find((a) => a.slug === c.slug);
    return (
      <article className="adm-msgview">
        {mark}{backLink}
        <header>
          <h2>{c.name}</h2>
          <p>{formatDateTime(c.createdAt)} · on {article ? `“${article.title}”` : c.slug}</p>
        </header>
        <p className="adm-body">{c.text}</p>
        <div className="adm-msgview-actions">
          <Link className="adm-mini" href={`/articles/${c.slug}`} target="_blank">View on the site ↗</Link>
          <form action={inboxDeleteCommentAction}>
            <input type="hidden" name="id" value={c.id} /><input type="hidden" name="filter" value={filter} />
            <ConfirmButton message="Delete this comment?" className="adm-mini adm-mini--danger">Delete comment</ConfirmButton>
          </form>
        </div>
      </article>
    );
  }

  const u = data.users.find((x) => x.id === id);
  if (!u) return <p className="adm-empty">This account no longer exists.</p>;
  return (
    <article className="adm-msgview">
      {mark}{backLink}
      <header>
        <h2>{u.name}</h2>
        <p>Joined {formatDateTime(u.createdAt)}</p>
      </header>
      <dl className="adm-dl">
        <div><dt>Email</dt><dd>{u.email}</dd></div>
        <div><dt>Signed up with</dt><dd>{[u.googleId ? "Google" : "", u.passwordHash ? "Email and password" : ""].filter(Boolean).join(" and ")}</dd></div>
        <div><dt>Last login</dt><dd>{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}</dd></div>
      </dl>
      <div className="adm-msgview-actions"><Link className="adm-mini" href="/admin/users">Manage in Users</Link></div>
    </article>
  );
}
