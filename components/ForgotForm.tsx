"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type Result = { message: string; devLink?: string };

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!email.trim()) return setError("Enter your email address.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; message?: string; devLink?: string };
      if (!res.ok || !data.ok) return setError(data.error || "Something went wrong. Please try again.");
      setResult({ message: data.message ?? "", devLink: data.devLink });
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="auth-card">
        <h1 className="auth-title">Check your email</h1>
        <div className="auth-info"><p>{result.message}</p></div>
        {result.devLink ? (
          <div className="auth-info auth-info--dev">
            <p><strong>Development only.</strong> Email is not connected yet, so here is the link that would have been sent:</p>
            <a className="auth-dev-link" href={result.devLink}>{result.devLink}</a>
          </div>
        ) : null}
        <Link className="btn btn--line" href="/login">Back to sign in</Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-title">Forgot your password?</h1>
      <p className="muted">Enter the email you signed up with. We will send you a link to choose a new password.</p>
      <form className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="forgot-email">Email</label>
          <input className="in" id="forgot-email" type="email" inputMode="email" autoComplete="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {error ? <p className="err" role="alert">{error}</p> : null}
        <button type="submit" className="btn" disabled={busy}>{busy ? "Sending…" : "Send reset link"} <span className="arr" aria-hidden="true">→</span></button>
      </form>
      <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
    </div>
  );
}
