"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { primaryButton } from "@/components/ButtonLink";

const input = "mt-2 block w-full rounded-sm border border-vx-hair bg-vx-white p-3 font-text text-body focus:outline-2 focus:outline-vx-accent-deep";

export function TeamProgrammeForm(): React.ReactElement {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    try {
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("name"), email: value("email"), company: value("team"), role: "organisation",
          interest: "Six month team programme application", source: "/team-programme",
          problem: `Public page: ${value("page")}\nRecent work: ${value("activity")}\nWeekly format and owner: ${value("plan")}`,
          consent: form.get("consent") === "yes", website: value("website"),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "We could not save the application. Try again.");
      setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "We could not save the application. Try again."); }
    finally { setBusy(false); }
  }
  if (saved) return <div role="status" className="border-l-4 border-vx-peacock-blue bg-vx-stone p-6"><h2 className="font-text text-h3 font-semibold">Application saved.</h2><p className="mt-3">Submitting an application does not reserve a place. Selected teams receive the scope and schedule by email before they agree to join.</p></div>;
  return <form onSubmit={submit} className="mt-8 space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      <label className="font-medium">Team name<input name="team" required maxLength={120} className={input} /></label>
      <label className="font-medium">Your name<input name="name" required autoComplete="name" maxLength={120} className={input} /></label>
    </div>
    <label className="block font-medium">Contact email<input name="email" type="email" required autoComplete="email" maxLength={254} className={input} /></label>
    <label className="block font-medium">Your team’s public page<input name="page" type="url" required placeholder="https://" maxLength={500} className={input} /></label>
    <label className="block font-medium">What has your team published in the last month?<textarea name="activity" required rows={3} maxLength={1500} className={input} /><span className="mt-2 block text-small font-normal text-vx-ink-2">Include links to a few examples. Describe what exists today.</span></label>
    <label className="block font-medium">What could you publish each week, and who would own it?<textarea name="plan" required rows={3} maxLength={1500} className={input} /></label>
    <label className="hidden" aria-hidden="true">Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="flex items-start gap-3 text-small"><input type="checkbox" name="consent" value="yes" required className="mt-1 h-4 w-4 shrink-0" /><span>VEXA may use these details to review this application and contact me about it. I have read the <Link href="/legal/privacy" className="vx-link">privacy policy</Link>.</span></label>
    <p role="alert" className="text-vx-error">{error}</p>
    <button disabled={busy} className={`${primaryButton} disabled:opacity-60`}>{busy ? "Saving…" : "Send application"}</button>
  </form>;
}
