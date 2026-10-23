"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) return setError("Use a password of at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) return setError(data.error || "Something went wrong. Please try again.");
      setDone(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="auth-card">
        <h1 className="auth-title">Password updated</h1>
        <p className="muted">You can now log in with your new password.</p>
        <Link className="btn" href="/login">Log in <span className="arr" aria-hidden="true">→</span></Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-title">Choose a new password</h1>
      <p className="muted">Use at least 8 characters. Signing in again is needed on any other device.</p>
      <form className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="new-password">New password</label>
          <input className="in" id="new-password" type="password" autoComplete="new-password" maxLength={200} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="confirm-password">Confirm new password</label>
          <input className="in" id="confirm-password" type="password" autoComplete="new-password" maxLength={200} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error ? <p className="err" role="alert">{error}</p> : null}
        <button type="submit" className="btn" disabled={busy}>{busy ? "Saving…" : "Set new password"} <span className="arr" aria-hidden="true">→</span></button>
      </form>
    </div>
  );
}
