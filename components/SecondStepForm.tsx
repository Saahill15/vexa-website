"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** The second step for an admin after the password (or Google) sign-in: an authenticator code or a backup code. */
export function SecondStepForm({ hasAuthenticator }: { hasAuthenticator: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !code.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/mfa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", code: code.trim() }) });
    if (res.ok) return router.replace("/admin");
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setError(data.error ?? "That code is not right. Try again.");
    setBusy(false);
  }

  if (!hasAuthenticator) {
    return (
      <div className="auth-card">
        <h1 className="auth-title">Set up two-step sign-in</h1>
        <p className="muted">Admin accounts need a second step before they can open the admin panel. Connect an authenticator app on your profile page, then sign in again.</p>
        <Link href="/account" className="btn">Go to my profile <span className="arr" aria-hidden="true">→</span></Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-title">Confirm it is you</h1>
      <p className="muted">Enter the six-digit code from your authenticator app, or one of your backup codes.</p>
      <form onSubmit={submit} className="form" noValidate>
        <div className="field">
          <label htmlFor="second-code">Code</label>
          <input id="second-code" className="in" inputMode="text" autoComplete="one-time-code" autoFocus value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <button type="submit" className="btn" disabled={busy || !code.trim()}>Confirm</button>
      </form>
      {error ? <p className="adm-note adm-note--error" role="alert" style={{ marginTop: 16 }}>{error}</p> : null}
    </div>
  );
}
