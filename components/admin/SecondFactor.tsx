"use client";
import { FormEvent, useState } from "react";
import { signOut } from "next-auth/react";
import styles from "./Admin.module.css";

async function send(endpoint: string, body: Record<string, unknown>): Promise<{ ok: boolean; data: Record<string, unknown>; message: string }> {
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: response.ok, data, message: typeof data.error === "string" ? data.error : response.ok ? "" : "Something went wrong. Reload the page and try again." };
  } catch {
    return { ok: false, data: {}, message: "Network problem. Try again." };
  }
}

const errorStyle = { color: "#B3261E", minHeight: 22 } as const;

/** The code step after a password (or Google) sign-in, for staff who have set up two-step sign-in. */
export function VerifyForm({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recovery, setRecovery] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await send("/api/admin/security/verify", { code: String(new FormData(event.currentTarget).get("code") || "") });
    if (result.ok) {
      const left = result.data.recoveryCodesLeft;
      if (result.data.method === "recovery" && typeof left === "number" && left <= 3) window.alert(`Recovery code used. ${left} left. Replace your authenticator and codes under Two-step sign-in soon.`);
      window.location.assign(next);
      return;
    }
    setError(result.message);
    setBusy(false);
  }
  return <form onSubmit={submit} className={styles.form}>
    {recovery
      ? <label>Recovery code<input className={styles.input} name="code" autoComplete="off" required maxLength={16} placeholder="XXXXX-XXXXX" spellCheck={false} /></label>
      : <label>Six-digit code<input className={styles.input} name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" required maxLength={6} autoFocus /></label>}
    <p role="alert" style={errorStyle}>{error}</p>
    <div className={styles.actions}>
      <button className={styles.button} disabled={busy}>{busy ? "Checking…" : "Continue"}</button>
      <button type="button" className={styles.linkButton} onClick={() => { setRecovery(!recovery); setError(""); }}>{recovery ? "Use the app code instead" : "Use a recovery code"}</button>
    </div>
    <p className={styles.muted}>Lost your phone and your recovery codes? The site owner can reset two-step sign-in on the server. <button type="button" className={styles.linkButton} onClick={() => void signOut({ callbackUrl: "/admin/login" })}>Sign out</button></p>
  </form>;
}

/** Enrolment (and later replacement): show the key, confirm one code, then show recovery codes once. */
export function EnrolForm({ replacing, next }: { replacing: boolean; next: string | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);

  async function start() {
    setBusy(true);
    setError("");
    const result = await send("/api/admin/security/enrol", { action: "start" });
    setBusy(false);
    if (result.ok && typeof result.data.secret === "string" && typeof result.data.uri === "string") setSetup({ secret: result.data.secret, uri: result.data.uri });
    else setError(result.message);
  }
  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await send("/api/admin/security/enrol", { action: "confirm", code: String(new FormData(event.currentTarget).get("code") || "") });
    setBusy(false);
    if (result.ok && Array.isArray(result.data.recoveryCodes)) { setCodes(result.data.recoveryCodes.map(String)); setSetup(null); }
    else setError(result.message);
  }

  if (codes) return <div>
    <p className={styles.info} role="status"><strong>Two-step sign-in is on.</strong> Save these recovery codes now. They are shown only once; each works one time if you lose your phone.</p>
    <ol className={styles.codes}>{codes.map((code) => <li key={code}><code>{code}</code></li>)}</ol>
    <div className={styles.actions} style={{ marginTop: 14 }}>
      <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => void navigator.clipboard?.writeText(codes.join("\n"))}>Copy codes</button>
      <button type="button" className={styles.button} onClick={() => window.location.assign(next || "/admin/security")}>I have saved them</button>
    </div>
  </div>;

  if (setup) return <form onSubmit={confirm}>
    <ol className={styles.steps}>
      <li>In your authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, Authy and similar), add an account. On this phone you can <a href={setup.uri}>open the set-up link</a>; otherwise choose to enter a key and type:
        <p className={styles.secret}><code>{setup.secret.match(/.{1,4}/g)?.join(" ")}</code></p>
        <p className={styles.muted}>Type: time-based, 6 digits, every 30 seconds. Account: VEXA.</p>
      </li>
      <li><label className={styles.form} style={{ marginTop: 8 }}><span>Enter the six-digit code the app now shows</span><input className={styles.input} name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" required maxLength={6} autoFocus /></label></li>
    </ol>
    <p role="alert" style={errorStyle}>{error}</p>
    <div className={styles.actions}><button className={styles.button} disabled={busy}>{busy ? "Checking…" : "Confirm and turn on"}</button><button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => setSetup(null)}>Cancel</button></div>
    <p className={styles.muted} style={{ marginTop: 10 }}>The key expires if not confirmed within 15 minutes. {replacing ? "Your current authenticator keeps working until this one is confirmed." : ""}</p>
  </form>;

  return <div>
    <p role="alert" style={errorStyle}>{error}</p>
    <button type="button" className={replacing ? `${styles.button} ${styles.secondary}` : styles.button} disabled={busy} onClick={() => void start()}>{busy ? "Preparing…" : replacing ? "Replace authenticator and recovery codes" : "Set up two-step sign-in"}</button>
  </div>;
}
