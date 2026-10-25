"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { OtpInput } from "@/components/OtpInput";

/**
 * The second step for an admin after the password (or Google) sign-in. A passkey is tried first when there is one; if it is
 * cancelled or fails, the six-digit authenticator code is offered instead.
 */
export function SecondStepForm({ hasAuthenticator, hasPasskey }: { hasAuthenticator: boolean; hasPasskey: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [useCode, setUseCode] = useState(!hasPasskey);
  const tried = useRef(false);

  async function submitCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy || code.length !== 6) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/mfa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", code: code.trim() }) });
    if (res.ok) return router.replace("/admin");
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setError(data.error ?? "That code is not right. Try again.");
    setBusy(false);
  }

  async function usePasskey() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const start = await fetch("/api/mfa/passkey", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "auth-options" }) });
      if (!start.ok) throw new Error("options");
      const { options } = (await start.json()) as { options: Parameters<typeof startAuthentication>[0]["optionsJSON"] };
      const response = await startAuthentication({ optionsJSON: options });
      const done = await fetch("/api/mfa/passkey", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "auth-verify", response }) });
      if (!done.ok) throw new Error("verify");
      router.replace("/admin");
    } catch {
      setError(hasAuthenticator ? "The passkey was not used. Enter your authenticator code instead." : "The passkey was not accepted. Try again.");
      if (hasAuthenticator) setUseCode(true);
      setBusy(false);
    }
  }

  // the passkey is the default: ask for it as soon as the page opens
  useEffect(() => {
    if (!hasPasskey || tried.current) return;
    tried.current = true;
    void usePasskey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasAuthenticator && !hasPasskey) {
    return (
      <div className="auth-card">
        <h1 className="auth-title">Set up two-step sign-in</h1>
        <p className="muted">Admin accounts need a second step before they can open the admin panel. Connect an authenticator app or add a passkey on your profile page, then sign in again.</p>
        <Link href="/account" className="btn">Go to my profile <span className="arr" aria-hidden="true">→</span></Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-title">Confirm it is you</h1>
      {!useCode ? (
        <>
          <p className="muted">Confirm with your passkey: your fingerprint or device PIN.</p>
          <button type="button" className="btn" onClick={usePasskey} disabled={busy}>Use a passkey</button>
          {hasAuthenticator ? (
            <p style={{ marginTop: 16 }}><button type="button" className="btn btn--line" onClick={() => setUseCode(true)} disabled={busy}>Use an authenticator code instead</button></p>
          ) : null}
        </>
      ) : (
        <>
          <p className="muted">Enter the six-digit code from your authenticator app, or one of your backup codes.</p>
          <form onSubmit={submitCode} className="form" noValidate>
            <div className="field">
              <OtpInput value={code} onChange={setCode} autoFocus />
            </div>
            <button type="submit" className="btn" disabled={busy || code.length !== 6}>Confirm</button>
          </form>
          {hasPasskey ? (
            <p style={{ marginTop: 16 }}><button type="button" className="btn btn--line" onClick={usePasskey} disabled={busy}>Use a passkey instead</button></p>
          ) : null}
        </>
      )}
      {error ? <p className="adm-note adm-note--error" role="alert" style={{ marginTop: 16 }}>{error}</p> : null}
    </div>
  );
}
