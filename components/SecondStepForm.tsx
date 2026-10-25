"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";

/** The second step for an admin after the password (or Google) sign-in: an authenticator code, a backup code, or a passkey. */
export function SecondStepForm({ hasAuthenticator, hasPasskey }: { hasAuthenticator: boolean; hasPasskey: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/mfa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { ok: res.ok, data: (await res.json().catch(() => ({}))) as { error?: string } };
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !code.trim()) return;
    setBusy(true);
    setError("");
    const result = await post({ action: "verify", code: code.trim() });
    if (result.ok) return router.replace("/admin");
    setError(result.data.error ?? "That code is not right. Try again.");
    setBusy(false);
  }

  async function usePasskey() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const start = await fetch("/api/mfa/passkey", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "auth-options" }) });
      const { options } = (await start.json()) as { options: Parameters<typeof startAuthentication>[0]["optionsJSON"] };
      const response = await startAuthentication({ optionsJSON: options });
      const done = await fetch("/api/mfa/passkey", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "auth-verify", response }) });
      if (!done.ok) throw new Error("not recognised");
      router.replace("/admin");
    } catch {
      setError("The passkey was not accepted. Try again, or use your authenticator code.");
      setBusy(false);
    }
  }

  if (!hasAuthenticator && !hasPasskey) {
    return (
      <div className="auth-card">
        <h1 className="auth-title">Set up two-step sign-in</h1>
        <p className="muted">Admin accounts need a second step before they can open the admin panel. Add an authenticator app or a passkey on your profile page, then sign in again.</p>
        <Link href="/account" className="btn">Go to my profile <span className="arr" aria-hidden="true">→</span></Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-title">Confirm it is you</h1>
      <p className="muted">{hasAuthenticator ? "Enter the six-digit code from your authenticator app, or one of your backup codes." : "Use your passkey to continue."}</p>
      {hasAuthenticator ? (
        <form onSubmit={submitCode} className="form" noValidate>
          <div className="field">
            <label htmlFor="second-code">Code</label>
            <input id="second-code" className="in" inputMode="text" autoComplete="one-time-code" autoFocus value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <button type="submit" className="btn" disabled={busy || !code.trim()}>Confirm</button>
        </form>
      ) : null}
      {hasPasskey ? (
        <div style={{ marginTop: 16 }}>
          <button type="button" className={hasAuthenticator ? "btn btn--line" : "btn"} onClick={usePasskey} disabled={busy}>Use a passkey</button>
        </div>
      ) : null}
      {error ? <p className="adm-note adm-note--error" role="alert" style={{ marginTop: 16 }}>{error}</p> : null}
    </div>
  );
}
