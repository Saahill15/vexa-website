"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import styles from "./Admin.module.css";

type Toast = { ok: boolean; text: string } | null;

function useToast(): [Toast, (toast: Toast) => void] {
  const [toast, setToast] = useState<Toast>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.ok ? 3500 : 8000);
    return () => clearTimeout(timer);
  }, [toast]);
  return [toast, setToast];
}
function ToastView({ toast }: { toast: Toast }) {
  return <div aria-live="polite" role="status">{toast ? <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>{toast.text}</div> : null}</div>;
}

async function post(endpoint: string, body: unknown): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
    if (response.status === 401) return { ok: false, message: data.error || "Your admin sign-in has expired. Reload the page to sign in again." };
    return response.ok ? { ok: true, message: data.message || "Saved." } : { ok: false, message: data.error || "The change was not saved." };
  } catch {
    return { ok: false, message: "Network problem. The change was not saved." };
  }
}

type ActionProps = {
  endpoint: string; body: Record<string, unknown>; label: string; done?: string;
  variant?: "primary" | "secondary" | "danger";
  /** Shows a confirmation dialog first. */
  confirm?: { title: string; text: string; confirmLabel: string; typeToConfirm?: string };
  after?: string;
};

export function ActionButton({ endpoint, body, label, done, variant = "secondary", confirm, after }: ActionProps) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState("");
  const [toast, setToast] = useToast();
  async function run() {
    setBusy(true);
    const result = await post(endpoint, confirm?.typeToConfirm ? { ...body, confirmEmail: typed } : body);
    setBusy(false);
    dialog.current?.close();
    setToast({ ok: result.ok, text: result.ok ? done || result.message : result.message });
    if (result.ok) { if (after) router.push(after); else router.refresh(); }
  }
  const cls = `${styles.button} ${variant === "danger" ? styles.danger : variant === "secondary" ? styles.secondary : ""}`;
  return <>
    <button type="button" className={cls} disabled={busy} onClick={() => (confirm ? dialog.current?.showModal() : void run())}>{busy ? "Working…" : label}</button>
    {confirm ? <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${endpoint}-${label}-title`}>
      <h2 id={`${endpoint}-${label}-title`}>{confirm.title}</h2><p>{confirm.text}</p>
      {confirm.typeToConfirm ? <label className={styles.form}><span>Type <strong>{confirm.typeToConfirm}</strong> to confirm</span><input className={styles.input} value={typed} onChange={(event) => setTyped(event.target.value)} autoComplete="off" /></label> : null}
      <div className={styles.actions} style={{ marginTop: 16 }}><button type="button" className={`${styles.button} ${variant === "danger" ? styles.danger : ""}`} disabled={busy || Boolean(confirm.typeToConfirm && typed.trim().toLowerCase() !== confirm.typeToConfirm.toLowerCase())} onClick={() => void run()}>{busy ? "Working…" : confirm.confirmLabel}</button><button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => dialog.current?.close()}>Cancel</button></div>
    </dialog> : null}
    <ToastView toast={toast} />
  </>;
}

export function SelectAction({ endpoint, action, field, value, options, label }: { endpoint: string; action: string; field: string; value: string; options: { value: string; label: string }[]; label: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useToast();
  async function change(next: string) {
    const previous = current;
    setCurrent(next);
    setBusy(true);
    const result = await post(endpoint, { action, [field]: next || null });
    setBusy(false);
    setToast({ ok: result.ok, text: result.message });
    if (result.ok) router.refresh(); else setCurrent(previous);
  }
  return <label className={styles.form} style={{ marginTop: 0 }}><span>{label}</span><select className={styles.select} value={current} disabled={busy} onChange={(event) => void change(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ToastView toast={toast} /></label>;
}

export function NoteForm({ endpoint }: { endpoint: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useToast();
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await post(endpoint, { action: "note", body: text });
    setBusy(false);
    setToast({ ok: result.ok, text: result.ok ? "Note added." : result.message });
    if (result.ok) { setText(""); router.refresh(); }
  }
  return <form onSubmit={submit} className={styles.form} style={{ marginTop: 0 }}><label>Add an internal note<textarea className={styles.textarea} value={text} onChange={(event) => setText(event.target.value)} maxLength={4000} required /></label><div><button className={styles.button} disabled={busy || !text.trim()}>{busy ? "Saving…" : "Add note"}</button></div><p className={styles.muted}>Notes are visible only to administrators and are never sent to the person who wrote in.</p><ToastView toast={toast} /></form>;
}

export function ExportLeads({ filter }: { filter: Record<string, string> }) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useToast();
  async function run() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/leads/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(filter) });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw Error(data.error || "Export failed."); }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") || "")?.[1] || "vexa-leads.csv";
      link.click();
      URL.revokeObjectURL(url);
      setToast({ ok: true, text: "Export downloaded. The export is recorded in the audit log." });
    } catch (cause) {
      setToast({ ok: false, text: cause instanceof Error ? cause.message : "Export failed." });
    } finally {
      setBusy(false);
    }
  }
  return <><button type="button" className={`${styles.button} ${styles.secondary}`} disabled={busy} onClick={() => void run()}>{busy ? "Exporting…" : "Export CSV"}</button><ToastView toast={toast} /></>;
}

export function SignOut() {
  return <button type="button" className={styles.linkButton} onClick={() => void signOut({ callbackUrl: "/admin/login" })}>Sign out</button>;
}
