"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import styles from "./Admin.module.css";

export function AdminLogin({ next, expired }: { next: string; expired: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await signIn("credentials", { email: String(data.get("email") || ""), password: String(data.get("password") || ""), redirect: false });
      // One message for every failure, so the form does not reveal which accounts exist or hold a role.
      if (!result?.ok) throw Error("Sign-in failed. Check your email and password, or wait if you have tried several times.");
      window.location.assign(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed.");
      setBusy(false);
    }
  }
  return <div className={styles.login}>
    <p className={styles.label}>VEXA website</p>
    <h1>Admin sign-in</h1>
    {expired ? <p className={styles.info}>For security, admin work needs a sign-in from the last 12 hours. Sign in again to continue.</p> : <p className={styles.muted}>For staff accounts provisioned by the site owner.</p>}
    <form onSubmit={submit} className={styles.form}>
      <label>Email<input className={styles.input} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>Password<input className={styles.input} name="password" type="password" autoComplete="current-password" required maxLength={128} /></label>
      <p role="alert" style={{ color: "#B3261E", minHeight: 22 }}>{error}</p>
      <button className={styles.button} disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    <p className={styles.muted} style={{ marginTop: 18 }}>Staff accounts that use Google: sign in on the <Link href="/account">reader account page</Link>, then return to /admin.</p>
  </div>;
}
