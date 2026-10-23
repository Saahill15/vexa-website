"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { GoogleSignIn } from "./GoogleSignIn";

type Props = { mode: "login" | "signup"; next: string; googleClientId: string | null; devNote: boolean };
type Waiting = { email: string; devLink?: string };

const COPY = {
  login: { eyebrow: "Welcome back", title: "Log in", lede: "Pick up where you left off.", submit: "Log in", other: "New here?", otherLink: "Create an account", otherHref: "/signup" },
  signup: { eyebrow: "Free account", title: "Create your account", lede: "Free to create. Use your email or Google.", submit: "Create account", other: "Already have an account?", otherLink: "Log in", otherHref: "/login" },
} as const;

// for a visitor who came from an article: they are here to read the rest of it
const ARTICLE_LEDE = {
  login: "Log in to read full articles and join the conversation.",
  signup: "Free. Read full articles and join the conversation in the comments.",
} as const;

// shown after a Google sign-in whose email already has a password account: the password confirms the link
const LINK = { eyebrow: "One step left", title: "Link your Google account", lede: "Log in with your password once. Your Google sign-in will then be linked to this account.", submit: "Log in and link Google" } as const;

// shown after a sign-up, until the emailed link is confirmed
const WAITING = { eyebrow: "Almost there", title: "Check your email", lede: "Confirm your email to create your account.", submit: "Create account" } as const;

const POINTS = ["Read every article in full", "Join the conversation in the comments", "Manage your sign-in methods from your account page"];

export function AuthForm({ mode, next, googleClientId, devNote }: Props) {
  const router = useRouter();
  const [linking, setLinking] = useState(false);
  const [notice, setNotice] = useState("");
  const [waiting, setWaiting] = useState<Waiting | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // the link opens in its own window; when it is confirmed, this tab carries on into the account
  useEffect(() => {
    if (!waiting || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("vexa-auth");
    channel.onmessage = () => {
      router.replace(next);
      router.refresh();
    };
    return () => channel.close();
  }, [waiting, next, router]);

  const copy = waiting ? WAITING : linking ? LINK : COPY[mode];
  const lede = waiting || linking ? copy.lede : next.startsWith("/articles/") ? ARTICLE_LEDE[mode] : COPY[mode].lede;

  async function send(url: string, body: Record<string, string>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; needsLink?: boolean; pending?: boolean; email?: string; devLink?: string };
      if (data.needsLink) {
        // Google matched an existing password account: ask for its password instead of merging silently
        setLinking(true);
        setNotice(data.error ?? "");
        setBusy(false);
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      if (data.pending) {
        // the account is created only once the emailed link is confirmed
        setWaiting({ email: data.email ?? body.email, devLink: data.devLink });
        setBusy(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  function cancelLink() {
    setLinking(false);
    setNotice("");
    setError("");
    setPassword("");
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!linking && mode === "signup" && !name.trim()) return setError("Enter your name.");
    if (!email.trim()) return setError("Enter your email address.");
    if (!password) return setError(mode === "signup" && !linking ? "Choose a password." : "Enter your password.");
    // linking always confirms with the password, so it goes to the login endpoint whichever page this is
    void send(`/api/auth/${linking || mode === "login" ? "login" : "signup"}`, { name, email, password });
  }

  const isSignup = mode === "signup" && !linking;

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <span className="auth-eyebrow">{copy.eyebrow}</span>
        <h1 className="auth-title">{copy.title}</h1>
        <p className="auth-lede">{lede}</p>
        {linking || waiting ? null : (
          <ul className="auth-points">
            {POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="auth-panel">
        {waiting ? (
          <>
            <p className="auth-info" role="status">We sent a link to <strong>{waiting.email}</strong>. Open it to create your account. It works for 24 hours.</p>
            {waiting.devLink ? <p className="acc-dev">Development link: <a href={waiting.devLink}>{waiting.devLink}</a></p> : null}
            {error ? <p className="err" role="alert">{error}</p> : null}
            <button type="button" className="btn auth-submit" disabled={busy} onClick={() => void send("/api/auth/signup", { name, email: waiting.email, password })}>
              {busy ? "Sending…" : "Send the link again"}
            </button>
            <p className="auth-switch"><button type="button" className="auth-link-btn" onClick={() => { setWaiting(null); setError(""); }}>Use a different email</button></p>
          </>
        ) : (
          <>
            {notice ? <p className="auth-info" role="status">{notice}</p> : null}

            {linking ? null : googleClientId ? (
              <>
                <GoogleSignIn clientId={googleClientId} text={mode === "login" ? "signin_with" : "signup_with"} onCredential={(credential) => void send("/api/auth/google", { credential })} />
                <div className="auth-or"><span>or use your email</span></div>
              </>
            ) : devNote ? (
              <p className="auth-note">Google sign-in appears here once <code>GOOGLE_CLIENT_ID</code> is set. Email sign-in works now.</p>
            ) : null}

            <form className="form" onSubmit={submit} noValidate>
              {isSignup ? (
                <div className="field">
                  <label htmlFor="auth-name">Your name</label>
                  <input className="in" id="auth-name" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              ) : null}
              <div className="field">
                <label htmlFor="auth-email">Email</label>
                <input className="in" id="auth-email" type="email" inputMode="email" autoComplete="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="auth-password">Password {isSignup ? <span>(8 characters or more)</span> : null}</label>
                <input className="in" id="auth-password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} maxLength={200} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error ? <p className="err" role="alert">{error}</p> : null}
              {mode === "login" && !linking ? <Link className="auth-forgot" href="/forgot-password">Forgot password?</Link> : null}
              <button type="submit" className="btn auth-submit" disabled={busy}>{busy ? "One moment…" : copy.submit} <span className="arr" aria-hidden="true">→</span></button>
            </form>

            {linking ? (
              <p className="auth-switch"><button type="button" className="auth-link-btn" onClick={cancelLink}>Cancel</button></p>
            ) : (
              <p className="auth-switch">{COPY[mode].other} <Link href={`${COPY[mode].otherHref}?next=${encodeURIComponent(next)}`}>{COPY[mode].otherLink}</Link></p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
