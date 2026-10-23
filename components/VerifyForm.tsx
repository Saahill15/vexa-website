"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type State = "ready" | "busy" | "created" | "confirmed" | "failed";

/** Confirms an email from its link. The button makes the request, so opening the link alone never uses it up. */
export function VerifyForm({ token }: { token: string }) {
  const [state, setState] = useState<State>("ready");
  const [error, setError] = useState("");

  // once confirmed: tell the sign-up tab that it can continue, then close this window if the browser allows it
  function finish() {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("vexa-auth");
      channel.postMessage("confirmed");
      channel.close();
    }
    window.setTimeout(() => window.close(), 1200);
  }

  async function confirm() {
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; created?: boolean };
      if (!res.ok || !data.ok) {
        setError(data.error || "This link is invalid or has expired.");
        return setState("failed");
      }
      setState(data.created ? "created" : "confirmed");
      finish();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setState("failed");
    }
  }

  if (!token) {
    return (
      <Card icon="warn" title="This link is incomplete" text="Open the link from your email again. If it still doesn't work, start again from the sign-up page.">
        <Link className="btn" href="/signup">Start again</Link>
      </Card>
    );
  }

  if (state === "created") {
    return (
      <Card icon="ok" title="You're all set" text="Your account is ready and you are signed in on this device. This window closes automatically; if it doesn't, you can close it now.">
        <Link className="btn" href="/account">Go to your account</Link>
        <Link className="btn btn--line" href="/articles">Read articles</Link>
      </Card>
    );
  }

  if (state === "confirmed") {
    return (
      <Card icon="ok" title="Email confirmed" text="Thank you. This window closes automatically; if it doesn't, you can close it now.">
        <Link className="btn" href="/account">Go to your account</Link>
      </Card>
    );
  }

  if (state === "failed") {
    return (
      <Card icon="warn" title="This link can't be used" text={error}>
        <Link className="btn" href="/signup">Start again</Link>
        <Link className="btn btn--line" href="/login">Log in</Link>
      </Card>
    );
  }

  return (
    <Card icon="mail" title="Confirm your email" text="One click confirms this address and finishes setting up your Vexa account. There is nothing else to type.">
      <button type="button" className="btn" disabled={state === "busy"} onClick={confirm}>
        {state === "busy" ? "Confirming…" : "Confirm my email"} <span className="arr" aria-hidden="true">→</span>
      </button>
      <p className="verify-note">The link works once and expires after 24 hours.</p>
    </Card>
  );
}

function Card({ icon, title, text, children }: { icon: "mail" | "ok" | "warn"; title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="auth verify-page">
      <div className="wrap">
        <div className="auth-card verify-card">
          <span className={`verify-icon verify-icon--${icon}`} aria-hidden="true">
            {icon === "ok" ? (
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            ) : icon === "warn" ? (
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 8v5M12 16.5h.01" /><circle cx="12" cy="12" r="9" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3.5 7l8.5 6 8.5-6" /></svg>
            )}
          </span>
          <h1 className="auth-title verify-title">{title}</h1>
          <p className="verify-text">{text}</p>
          <div className="verify-actions">{children}</div>
        </div>
      </div>
    </section>
  );
}
