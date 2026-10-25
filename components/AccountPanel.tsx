"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoogleSignIn } from "./GoogleSignIn";

type Account = {
  name: string;
  email: string;
  role: "user" | "admin";
  memberSince: string;
  lastLogin: string | null;
  passwordChanged: string | null;
  emailVerified: boolean;
  hasPassword: boolean;
  hasGoogle: boolean;
};
type CommentItem = { id: string; slug: string; title: string; text: string; date: string };
type EnquiryItem = {
  id: string;
  title: string;
  received: string;
  status: string;
  statusLabel: string;
  statusNote: string;
  problem: string;
  facts: [string, string][];
};
type Props = { account: Account; googleClientId: string | null; comments: CommentItem[]; enquiries: EnquiryItem[] };
type Message = { kind: "ok" | "err"; text: string };
type Data = Record<string, unknown> & { ok?: boolean; error?: string };
type Tab = "overview" | "enquiries" | "comments" | "security";

const TABS: Tab[] = ["overview", "enquiries", "comments", "security"];
const LABEL: Record<Tab, string> = { overview: "Overview", enquiries: "Enquiries", comments: "Comments", security: "Security" };

/** The profile: one tab at a time, so each screen stays short. The tab is kept in the address, so a reload stays on it. */
export function AccountPanel({ account, googleClientId, comments, enquiries }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(account.name);
  const [editingName, setEditingName] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    const fromAddress = window.location.hash.slice(1) as Tab;
    if (TABS.includes(fromAddress)) setTab(fromAddress);
  }, []);

  function choose(next: Tab) {
    setTab(next);
    setMessage(null);
    window.history.replaceState(null, "", `#${next}`);
  }

  // one place for every request: returns the response data when the server accepted it, otherwise null
  async function request(url: string, method: "POST" | "DELETE", body?: Record<string, string>, done?: string): Promise<Data | null> {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const data = (await res.json().catch(() => ({}))) as Data;
      if (!res.ok || !data.ok) {
        setMessage({ kind: "err", text: data.error || "Something went wrong. Please try again." });
        return null;
      }
      if (done) setMessage({ kind: "ok", text: done });
      router.refresh();
      return data;
    } catch {
      setMessage({ kind: "err", text: "Could not reach the server. Check your connection and try again." });
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function saveName(e: FormEvent) {
    e.preventDefault();
    if (busy || !name.trim()) return;
    const saved = await request("/api/account/name", "POST", { name: name.trim() }, "Name saved.");
    if (saved) setEditingName(false);
  }

  async function sendLink() {
    const data = await request("/api/account/verify", "POST");
    if (!data) return;
    if (data.alreadyVerified) return setMessage({ kind: "ok", text: "Your email is already verified." });
    const link = typeof data.devLink === "string" ? data.devLink : null;
    setDevLink(link);
    if (data.sent) return setMessage({ kind: "ok", text: `We sent a verification link to ${account.email}. It works for 24 hours.` });
    // on this machine no mail service is connected, so the link is shown here instead
    if (link) return setMessage({ kind: "ok", text: "Email is not connected on this machine yet. Open the development link below." });
    setMessage({ kind: "err", text: "We could not send the email right now. Please try again later." });
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (newPassword.length < 8) return setMessage({ kind: "err", text: "Use a password of at least 8 characters." });
    if (newPassword !== newPasswordAgain) return setMessage({ kind: "err", text: "The two new passwords do not match. Type the same password in both boxes." });
    const done = account.hasPassword ? "Password changed. You have been signed out everywhere else." : "Password set. You can now log in with your email and password.";
    const saved = await request("/api/account/password", "POST", { password: newPassword, currentPassword }, done);
    if (saved) {
      setPasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordAgain("");
    }
  }

  async function deleteComment(id: string) {
    await request(`/api/comments?id=${encodeURIComponent(id)}`, "DELETE", undefined, "Comment deleted.");
  }

  async function signOutEverywhere() {
    await request("/api/account/sessions", "POST", undefined, "Every other device has been signed out.");
  }

  async function deleteAccount(e: FormEvent) {
    e.preventDefault();
    if (busy || confirmEmail.trim().toLowerCase() !== account.email) return;
    const removed = await request("/api/account/delete", "POST", { email: confirmEmail.trim(), password: deletePassword });
    if (removed) router.replace("/");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/");
    router.refresh();
  }

  const nameChanged = name.trim() !== "" && name.trim() !== account.name;
  const canDelete = confirmEmail.trim().toLowerCase() === account.email;
  const methods = [account.hasPassword && "Password", account.hasGoogle && "Google"].filter(Boolean).join(" + ") || "None";
  const latest = enquiries[0];
  const latestComment = comments[0];
  const firstName = account.name.split(" ")[0];
  const counts: Record<Tab, string> = {
    overview: "",
    enquiries: account.emailVerified && enquiries.length ? String(enquiries.length) : "",
    comments: comments.length ? String(comments.length) : "",
    security: "",
  };

  return (
    <div className="acc-page">
      <header className="acc-top">
        <div>
          <h1 className="acc-title">Your account</h1>
          <p className="acc-email">
            {account.email}
            {account.role === "admin" ? <span className="acc-badge">Admin</span> : null}
          </p>
        </div>
        <button type="button" className="btn btn--line btn--sm" onClick={logout}>Log out</button>
      </header>

      <nav className="acc-tabs" role="tablist" aria-label="Account sections">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" id={`tab-${t}`} aria-selected={tab === t} aria-controls={`panel-${t}`} className={tab === t ? "acc-tab is-on" : "acc-tab"} onClick={() => choose(t)}>
            {LABEL[t]}
            {counts[t] ? <span className="acc-count">{counts[t]}</span> : null}
          </button>
        ))}
      </nav>

      <div className="acc-panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {message ? <p className={message.kind === "ok" ? "auth-info acc-message" : "err acc-message"} role={message.kind === "ok" ? "status" : "alert"}>{message.text}</p> : null}

        {tab === "overview" ? (
          <>
            <div className="acc-hello">
              <div>
                <h2 className="acc-greet">Hello, {firstName}</h2>
                <p className="acc-meta">
                  Member since {account.memberSince}
                  {account.lastLogin ? ` · Last login ${account.lastLogin}` : ""}
                </p>
              </div>
              {editingName ? null : (
                <button type="button" className="btn btn--line btn--sm" onClick={() => setEditingName(true)}>Edit name</button>
              )}
            </div>

            {editingName ? (
              <form className="form acc-form" onSubmit={saveName} noValidate>
                <div className="field">
                  <label htmlFor="acc-name">Name shown on your comments</label>
                  <input className="in" id="acc-name" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="acc-inline">
                  <button type="submit" className="btn btn--sm" disabled={busy || !nameChanged}>Save name</button>
                  <button type="button" className="btn btn--line btn--sm" onClick={() => { setName(account.name); setEditingName(false); }}>Cancel</button>
                </div>
              </form>
            ) : null}

            <div className="acc-status-list" aria-label="Account status">
              <div className="acc-status-row">
                <span className={account.emailVerified ? "acc-dot acc-dot--ok" : "acc-dot acc-dot--warn"} aria-hidden="true" />
                <div className="acc-status-text">
                  <strong>Email</strong>
                  <span>{account.emailVerified ? `${account.email} is verified.` : `${account.email} is not verified yet. Enquiries sent with it only show once it is.`}</span>
                  {devLink ? <span className="acc-dev">Development link: <a href={devLink}>{devLink}</a></span> : null}
                </div>
                {account.emailVerified ? null : (
                  <button type="button" className="btn btn--sm" disabled={busy} onClick={sendLink}>Send verification link</button>
                )}
              </div>
              <div className="acc-status-row">
                <span className="acc-dot acc-dot--ok" aria-hidden="true" />
                <div className="acc-status-text">
                  <strong>Sign in with</strong>
                  <span>{methods}</span>
                </div>
                <button type="button" className="btn btn--line btn--sm" onClick={() => choose("security")}>Manage</button>
              </div>
            </div>

            <div className="acc-recent">
              <h2 className="acc-heading">Recent</h2>
              {latest || latestComment ? (
                <ul className="acc-recent-list">
                  {latest ? (
                    <li>
                      <button type="button" className="acc-recent-item" onClick={() => choose("enquiries")}>
                        <span className="acc-recent-kind">Enquiry</span>
                        <span className="acc-recent-title">{latest.title}</span>
                        <span className={`acc-status acc-status--${latest.status}`}>{latest.statusLabel}</span>
                        <span className="acc-meta">{latest.received}</span>
                      </button>
                    </li>
                  ) : null}
                  {latestComment ? (
                    <li>
                      <button type="button" className="acc-recent-item" onClick={() => choose("comments")}>
                        <span className="acc-recent-kind">Comment</span>
                        <span className="acc-recent-title">{latestComment.title}</span>
                        <span className="acc-recent-text">{latestComment.text}</span>
                        <span className="acc-meta">{latestComment.date}</span>
                      </button>
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p className="acc-meta">Nothing yet. Enquiries you send and comments you post will appear here.</p>
              )}
            </div>
          </>
        ) : null}

        {tab === "enquiries" ? (
          !account.emailVerified ? (
            <p className="acc-meta">Verify your email address on the Overview tab to see the enquiries sent with it.</p>
          ) : enquiries.length === 0 ? (
            <div className="acc-empty">
              <p>No enquiries yet. When you send one from the contact page with {account.email}, it appears here.</p>
              <div>
                <Link className="btn btn--line btn--sm" href="/contact">Start a conversation</Link>
              </div>
            </div>
          ) : (
            <ul className="acc-enq-list">
              {enquiries.map((e) => (
                <li key={e.id} className="acc-enq">
                  <div className="acc-enq-head">
                    <div className="acc-enq-title">
                      <h2>{e.title}</h2>
                      <p className="acc-meta">Sent {e.received}</p>
                    </div>
                    <span className={`acc-status acc-status--${e.status}`}>{e.statusLabel}</span>
                  </div>

                  <p className="acc-enq-note">{e.statusNote}</p>

                  {e.facts.length ? (
                    <dl className="acc-enq-facts">
                      {e.facts.map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  <div className="acc-enq-message">
                    <span className="acc-enq-label">Your message</span>
                    <p>{e.problem}</p>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : null}

        {tab === "comments" ? (
          comments.length === 0 ? (
            <div className="acc-empty">
              <p>You haven&apos;t commented on an article yet. Comments you post appear here, and you can delete any of them.</p>
              <div>
                <Link className="btn btn--line btn--sm" href="/articles">Read articles</Link>
              </div>
            </div>
          ) : (
            <>
              <p className="acc-meta">{comments.length === 1 ? "1 comment" : `${comments.length} comments`}</p>
              <ul className="acc-cmt-list">
                {comments.map((c) => (
                  <li key={c.id} className="acc-cmt">
                    <p className="acc-cmt-text">{c.text}</p>
                    <div className="acc-cmt-foot">
                      <div className="acc-cmt-where">
                        <Link href={`/articles/${c.slug}`}>{c.title}</Link>
                        <span className="acc-meta">{c.date}</span>
                      </div>
                      {pendingDelete === c.id ? (
                        <div className="acc-inline">
                          <button type="button" className="btn btn--sm acc-btn-danger" disabled={busy} onClick={() => { setPendingDelete(null); void deleteComment(c.id); }}>Delete comment</button>
                          <button type="button" className="btn btn--line btn--sm" onClick={() => setPendingDelete(null)}>Keep it</button>
                        </div>
                      ) : (
                        <button type="button" className="btn btn--line btn--sm" onClick={() => setPendingDelete(c.id)}>Delete</button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )
        ) : null}

        {tab === "security" ? (
          <>
            <section className="acc-sec" aria-labelledby="sec-methods">
              <h2 id="sec-methods" className="acc-heading">Sign-in methods</h2>
              <p className="acc-meta">You need at least one of these to log in, so the last one can't be removed.</p>

              <div className="acc-method">
                <div className="acc-method-row">
                  <div className="acc-method-info">
                    <strong>Password</strong>
                    <span className={account.hasPassword ? "acc-status acc-status--ok" : "acc-status"}>{account.hasPassword ? "Set" : "Not set"}</span>
                  </div>
                  {passwordOpen ? null : (
                    <div className="acc-inline">
                      <button type="button" className="btn btn--line btn--sm" onClick={() => setPasswordOpen(true)}>{account.hasPassword ? "Change" : "Set password"}</button>
                      {account.hasPassword && account.hasGoogle ? (
                        <button type="button" className="btn btn--line btn--sm" disabled={busy} onClick={() => request("/api/account/password", "DELETE", undefined, "Password removed. You can log in with Google.")}>Remove</button>
                      ) : null}
                    </div>
                  )}
                </div>
                <p className="acc-meta">
                  {account.hasPassword
                    ? account.passwordChanged ? `Last changed ${account.passwordChanged}.` : "You log in with your email and password."
                    : "Not set. You log in with Google."}
                </p>

                {passwordOpen ? (
                  <form className="form acc-form" onSubmit={savePassword} noValidate>
                    {account.hasPassword ? (
                      <div className="field">
                        <label htmlFor="acc-current">Current password</label>
                        <input className="in" id="acc-current" type="password" autoComplete="current-password" maxLength={200} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                      </div>
                    ) : null}
                    <div className="field">
                      <label htmlFor="acc-new">New password <span>(8 characters or more)</span></label>
                      <input className="in" id="acc-new" type="password" autoComplete="new-password" maxLength={200} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="acc-new-again">Type the new password again</label>
                      <input className="in" id="acc-new-again" type="password" autoComplete="new-password" maxLength={200} value={newPasswordAgain} onChange={(e) => setNewPasswordAgain(e.target.value)} />
                    </div>
                    <div className="acc-inline">
                      <button type="submit" className="btn btn--sm" disabled={busy}>{busy ? "Saving…" : "Save password"}</button>
                      <button type="button" className="btn btn--line btn--sm" onClick={() => setPasswordOpen(false)}>Cancel</button>
                    </div>
                  </form>
                ) : null}
              </div>

              <div className="acc-method">
                <div className="acc-method-row">
                  <div className="acc-method-info">
                    <strong>Google</strong>
                    <span className={account.hasGoogle ? "acc-status acc-status--ok" : "acc-status"}>{account.hasGoogle ? "Linked" : "Not linked"}</span>
                  </div>
                  {account.hasGoogle ? (
                    <button type="button" className="btn btn--line btn--sm" disabled={busy || !account.hasPassword} onClick={() => request("/api/account/google", "DELETE", undefined, "Google unlinked.")}>Unlink</button>
                  ) : null}
                </div>
                <p className="acc-meta">
                  {account.hasGoogle
                    ? account.hasPassword
                      ? "You can log in with Google."
                      : "Set a password before you unlink Google, so you can still log in."
                    : account.hasPassword
                      ? "Link it to log in with Google too. The Google email must match this account."
                      : "Not linked."}
                </p>
                {!account.hasGoogle && account.hasPassword && googleClientId ? (
                  <GoogleSignIn clientId={googleClientId} text="continue_with" onCredential={(credential) => void request("/api/account/google", "POST", { credential }, "Google linked. You can now log in with Google.")} />
                ) : null}
              </div>
            </section>

            <section className="acc-sec" aria-labelledby="sec-sessions">
              <h2 id="sec-sessions" className="acc-heading">Sessions and activity</h2>
              <dl className="acc-facts">
                <div>
                  <dt>Last login</dt>
                  <dd>{account.lastLogin ?? "—"}</dd>
                </div>
                <div>
                  <dt>Password last changed</dt>
                  <dd>{account.passwordChanged ?? "—"}</dd>
                </div>
              </dl>
              <div className="acc-method-row">
                <p className="acc-meta">Signs out every other device. This one stays signed in.</p>
                <button type="button" className="btn btn--line btn--sm" disabled={busy} onClick={signOutEverywhere}>Sign out everywhere</button>
              </div>
            </section>

            <section className="acc-sec acc-danger" aria-labelledby="sec-delete">
              <h2 id="sec-delete" className="acc-heading">Delete account</h2>
              <p className="acc-meta">Removes your sign-in and details. Your comments stay on the articles as from a former member. Enquiries you sent stay with us.</p>
              {!deleteOpen ? (
                <div>
                  <button type="button" className="btn btn--line btn--sm acc-btn-danger" onClick={() => setDeleteOpen(true)}>Delete account…</button>
                </div>
              ) : (
                <form className="form acc-form" onSubmit={deleteAccount} noValidate>
                  <div className="field">
                    <label htmlFor="acc-confirm">Type <strong>{account.email}</strong> to confirm</label>
                    <input className="in" id="acc-confirm" type="email" autoComplete="off" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} />
                  </div>
                  {account.hasPassword ? (
                    <div className="field">
                      <label htmlFor="acc-delete-pw">Your password</label>
                      <input className="in" id="acc-delete-pw" type="password" autoComplete="current-password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                    </div>
                  ) : null}
                  <div className="acc-inline">
                    <button type="submit" className="btn btn--sm acc-btn-danger" disabled={busy || !canDelete}>Delete my account</button>
                    <button type="button" className="btn btn--line btn--sm" onClick={() => { setDeleteOpen(false); setConfirmEmail(""); setDeletePassword(""); }}>Cancel</button>
                  </div>
                </form>
              )}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
