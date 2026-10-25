"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Factor } from "@/lib/mfa";

async function call(body: Record<string, unknown>) {
  const res = await fetch("/api/mfa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: res.ok, data: (await res.json().catch(() => ({}))) as Record<string, unknown> & { error?: string } };
}

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "Never");

/** Two-step sign-in for admins, on the profile page: connect an authenticator app, and backup codes. */
export function MfaSettings({ factors, verified }: { factors: Factor[]; verified: boolean }) {
  const router = useRouter();
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // first-time set-up is allowed before the second step; changing an existing set-up needs it first
  const canEnrol = verified || factors.length === 0;

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
      const r = await call({ action: "totp-begin" });
      if (!r.ok) return setError(r.data.error ?? "Could not start the set-up.");
      setSetup(r.data as unknown as { secret: string; qr: string });
    });

  const confirmSetup = () =>
    run(async () => {
      const r = await call({ action: "totp-confirm", code });
      if (!r.ok) return setError(r.data.error ?? "That code is not right.");
      setSetup(null);
      setCode("");
      setCodes((r.data.codes as string[]) ?? null);
      setMessage("Your authenticator app is connected.");
      router.refresh();
    });

  const remove = (factor: Factor) =>
    run(async () => {
      if (!window.confirm("Remove this authenticator app? You will no longer be able to sign in with it.")) return;
      const r = await call({ action: "remove", id: factor.id });
      if (!r.ok) return setError(r.data.error ?? "It could not be removed.");
      router.refresh();
    });

  return (
    <section className="acc-sec" aria-labelledby="sec-mfa" style={{ marginTop: 24 }}>
      <h2 id="sec-mfa" className="acc-heading">Two-step sign-in</h2>
      <p className="acc-meta">Admin accounts confirm a code from an authenticator app before the admin panel opens.</p>
      {!verified && factors.length > 0 ? (
        <p className="adm-note" style={{ marginTop: 12 }}>
          To change this, first <Link href="/login/verify">confirm it is you</Link> with your current code.
        </p>
      ) : null}

      <ul style={{ listStyle: "none", padding: 0, margin: "16px 0" }}>
        {factors.length === 0 ? <li className="acc-meta">Not set up yet.</li> : null}
        {factors.map((f) => (
          <li key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #e3eeed" }}>
            <span>
              <strong>{f.name}</strong>
              <small className="acc-meta" style={{ display: "block" }}>Added {when(f.createdAt)} · Last used {when(f.lastUsedAt)}</small>
            </span>
            {verified ? <button type="button" className="btn btn--line btn--sm" disabled={busy} onClick={() => remove(f)}>Remove</button> : null}
          </li>
        ))}
      </ul>

      {canEnrol && !setup && factors.length === 0 ? (
        <button type="button" className="btn btn--sm" disabled={busy} onClick={beginSetup}>Set up authenticator app</button>
      ) : null}

      {setup ? (
        <div style={{ marginTop: 16 }}>
          <p className="acc-meta">Scan this code with Google Authenticator, Microsoft Authenticator or 1Password, then enter the six-digit code it shows.</p>
          <img src={setup.qr} alt="QR code for your authenticator app" width={220} height={220} style={{ margin: "12px 0" }} />
          <p className="acc-meta">Or enter this key by hand: <code>{setup.secret}</code></p>
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="mfa-code">Six-digit code</label>
            <input id="mfa-code" className="in" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <button type="button" className="btn btn--sm" disabled={busy || code.trim().length < 6} onClick={confirmSetup}>Confirm</button>
        </div>
      ) : null}

      {codes ? (
        <div style={{ marginTop: 16 }}>
          <p><strong>Backup codes.</strong> Save these somewhere safe now. Each works once, and they will not be shown again.</p>
          <pre style={{ background: "#f4fbfa", padding: 12, borderRadius: 8, columns: 2 }}>{codes.join("\n")}</pre>
          <button type="button" className="btn btn--line btn--sm" onClick={() => setCodes(null)}>I have saved them</button>
        </div>
      ) : null}

      {message ? <p className="acc-meta" style={{ marginTop: 12 }} role="status">{message}</p> : null}
      {error ? <p className="adm-note adm-note--error" role="alert" style={{ marginTop: 12 }}>{error}</p> : null}
    </section>
  );
}
