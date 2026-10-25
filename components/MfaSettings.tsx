"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import type { Factor } from "@/lib/mfa";
import { OtpInput } from "@/components/OtpInput";
import { startAuthentication } from "@simplewebauthn/browser";

/** Confirms this session on the profile page, so changes can be made: a passkey first when there is one, else the code. */
function ConfirmNow({ hasAuthenticator, hasPasskey }: { hasAuthenticator: boolean; hasPasskey: boolean }) {
  const router = useRouter();
  const [useCode, setUseCode] = useState(!hasPasskey);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      router.refresh();
    } catch {
      setError(hasAuthenticator ? "The passkey was not used. Enter your authenticator code instead." : "The passkey was not accepted. Try again.");
      if (hasAuthenticator) setUseCode(true);
      setBusy(false);
    }
  }

  async function submitCode() {
    if (busy || code.length !== 6) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/mfa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", code }) });
    if (res.ok) return router.refresh();
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setError(data.error ?? "That code is not right. Try again.");
    setCode("");
    setBusy(false);
  }

  return (
    <div className="acc-method" style={{ marginTop: 16 }}>
      <p style={{ margin: "0 0 4px" }}><strong>Confirm it is you</strong></p>
      <p className="acc-meta" style={{ margin: "0 0 12px" }}>To change these settings, confirm with a passkey or your authenticator code first.</p>
      {!useCode ? (
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn btn--sm" disabled={busy} onClick={usePasskey}>Confirm with a passkey</button>
          {hasAuthenticator ? <button type="button" className="btn btn--line btn--sm" disabled={busy} onClick={() => setUseCode(true)}>Use an authenticator code</button> : null}
        </div>
      ) : (
        <div>
          <OtpInput value={code} onChange={setCode} />
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
            <button type="button" className="btn btn--sm" disabled={busy || code.length !== 6} onClick={submitCode}>Confirm</button>
            {hasPasskey ? <button type="button" className="btn btn--line btn--sm" disabled={busy} onClick={usePasskey}>Use a passkey instead</button> : null}
          </div>
        </div>
      )}
      {error ? <p className="adm-note adm-note--error" role="alert" style={{ marginTop: 12 }}>{error}</p> : null}
    </div>
  );
}

async function call(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: res.ok, data: (await res.json().catch(() => ({}))) as Record<string, unknown> & { error?: string } };
}

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "Never");


/** Two-step sign-in for admins, on the profile page: an authenticator app and passkeys. */
export function MfaSettings({ factors, verified }: { factors: Factor[]; verified: boolean }) {
  const router = useRouter();
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const authenticator = factors.find((f) => f.kind === "totp");
  const passkeys = factors.filter((f) => f.kind === "passkey");
  // first-time set-up is allowed before the second step; changing an existing set-up needs it first
  const canChange = verified || factors.length === 0;

  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await task();
    } catch {
      setError("That did not work. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const beginSetup = () =>
    run(async () => {
      const r = await call("/api/mfa", { action: "totp-begin" });
      if (!r.ok) return setError(r.data.error ?? "Could not start the set-up.");
      setSetup(r.data as unknown as { secret: string; qr: string });
      setCode("");
    });

  const confirmSetup = () =>
    run(async () => {
      const r = await call("/api/mfa", { action: "totp-confirm", code: code.trim() });
      if (!r.ok) return setError(r.data.error ?? "That code is not right.");
      setSetup(null);
      setCode("");
      setCodes((r.data.codes as string[]) ?? null);
      setMessage("Your authenticator app is connected.");
      router.refresh();
    });

  const removeFactor = (factor: Factor) =>
    run(async () => {
      const what = factor.kind === "totp" ? "authenticator app" : "passkey";
      if (!window.confirm(`Remove this ${what}? You will no longer be able to sign in with it.`)) return;
      const r = await call(factor.kind === "totp" ? "/api/mfa" : "/api/mfa/passkey", { action: "remove", id: factor.id });
      if (!r.ok) return setError(r.data.error ?? "It could not be removed.");
      router.refresh();
    });

  const addPasskey = () =>
    run(async () => {
      const start = await call("/api/mfa/passkey", { action: "register-options" });
      if (!start.ok) return setError(start.data.error ?? "Could not add a passkey.");
      const response = await startRegistration({ optionsJSON: start.data.options as Parameters<typeof startRegistration>[0]["optionsJSON"] });
      const name = window.prompt("Name this passkey", "This device") ?? "";
      const done = await call("/api/mfa/passkey", { action: "register-verify", response, name: name.trim() || "This device" });
      if (!done.ok) return setError(done.data.error ?? "The passkey could not be added.");
      setMessage("Passkey added.");
      router.refresh();
    });

  return (
    <section className="acc-sec" aria-labelledby="sec-mfa" style={{ marginTop: 32 }}>
      <h2 id="sec-mfa" className="acc-heading">Two-step sign-in</h2>
      <p className="acc-meta">Admins confirm with an authenticator code or a passkey before the admin panel opens. Keep at least one more way in than you use.</p>
      {!verified && factors.length > 0 ? (
        <ConfirmNow hasAuthenticator={Boolean(authenticator)} hasPasskey={passkeys.length > 0} />
      ) : null}

      {/* authenticator app */}
      <div className="acc-method" style={{ marginTop: 16 }}>
        <div className="acc-method-row">
          <div className="acc-method-info">
            <strong>Authenticator app</strong>
            <span className={authenticator ? "acc-status acc-status--ok" : "acc-status"}>{authenticator ? "Connected" : "Not set up"}</span>
          </div>
          {authenticator ? (
            verified ? <button type="button" className="btn btn--line btn--sm" disabled={busy} onClick={() => removeFactor(authenticator)}>Remove</button> : null
          ) : canChange && !setup ? (
            <button type="button" className="btn btn--sm" disabled={busy} onClick={beginSetup}>Set up</button>
          ) : null}
        </div>
        {authenticator ? <p className="acc-meta">Added {when(authenticator.createdAt)} · Last used {when(authenticator.lastUsedAt)}</p> : null}

        {setup ? (
          <div>
            <p style={{ margin: "4px 0 8px" }}><strong>1. Scan this code</strong></p>
            <p className="acc-meta" style={{ margin: "0 0 12px" }}>Open Google Authenticator, Microsoft Authenticator or 1Password and add an account by scanning the code.</p>
            <img src={setup.qr} alt="QR code for your authenticator app" width={180} height={180} style={{ border: "1px solid #d3e6e4", borderRadius: 8, padding: 6, background: "#fff" }} />
            <p className="acc-meta" style={{ margin: "12px 0 0" }}>Can't scan it? Enter this key instead: <code style={{ wordBreak: "break-all", letterSpacing: "0.08em" }}>{setup.secret.match(/.{1,4}/g)?.join(" ")}</code></p>

            <p style={{ margin: "20px 0 8px" }}><strong>2. Enter the six-digit code it shows</strong></p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <OtpInput value={code} onChange={setCode} />
              <button type="button" className="btn btn--sm" disabled={busy || code.length !== 6} onClick={confirmSetup}>Confirm</button>
              <button type="button" className="btn btn--line btn--sm" disabled={busy} onClick={() => { setSetup(null); setCode(""); }}>Cancel</button>
            </div>
          </div>
        ) : null}
      </div>

      {codes ? (
        <div className="acc-method" style={{ marginTop: 16 }}>
          <p style={{ margin: "0 0 8px" }}><strong>Backup codes</strong></p>
          <p className="acc-meta" style={{ margin: "0 0 12px" }}>Save these somewhere safe now. Each works once, and they will not be shown again.</p>
          <pre style={{ background: "#f4fbfa", padding: 12, borderRadius: 8, columns: 2, margin: 0 }}>{codes.join("\n")}</pre>
          <button type="button" className="btn btn--line btn--sm" style={{ marginTop: 12, justifySelf: "start" }} onClick={() => setCodes(null)}>I have saved them</button>
        </div>
      ) : null}

      {/* passkeys */}
      <div className="acc-method" style={{ marginTop: 16 }}>
        <div className="acc-method-row">
          <div className="acc-method-info">
            <strong>Passkeys</strong>
            <span className={passkeys.length ? "acc-status acc-status--ok" : "acc-status"}>{passkeys.length ? `${passkeys.length} added` : "None added"}</span>
          </div>
          {verified || factors.length === 0 ? <button type="button" className="btn btn--line btn--sm" disabled={busy} onClick={addPasskey}>Add a passkey</button> : null}
        </div>
        <p className="acc-meta">Confirm with your fingerprint or device PIN.</p>
        {passkeys.map((f) => (
          <div key={f.id} className="acc-method-row" style={{ paddingTop: 8, borderTop: "1px solid #e3eeed" }}>
            <div>
              <strong>{f.name}</strong>
              <small className="acc-meta" style={{ display: "block" }}>Added {when(f.createdAt)} · Last used {when(f.lastUsedAt)}</small>
            </div>
            {verified ? <button type="button" className="btn btn--line btn--sm" disabled={busy} onClick={() => removeFactor(f)}>Remove</button> : null}
          </div>
        ))}
      </div>

      {message ? <p className="acc-meta" style={{ marginTop: 16 }} role="status">{message}</p> : null}
      {error ? <p className="adm-note adm-note--error" role="alert" style={{ marginTop: 16 }}>{error}</p> : null}
    </section>
  );
}
