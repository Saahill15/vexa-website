"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { primaryButton } from "@/components/ButtonLink";
import { ROLES } from "@/lib/roles";

const inputClass =
  "block min-h-[48px] w-full rounded-sm border-0 border-b border-vx-muted bg-vx-stone px-3 py-3 font-text text-body text-vx-ink focus:bg-vx-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-vx-peacock-blue";
const labelClass = "block font-text text-[15px] font-medium text-vx-ink";

/** One short form that saves a lead with a source tag. Used for the room waitlist. */
export function WaitlistForm({ slug, button }: { slug: string; button: string }): React.ReactElement {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          role: String(data.get("role") ?? ""),
          consent: data.get("consent") === "yes",
          website: String(data.get("website") ?? ""),
          slug,
        }),
      });
      const result = (await response.json()) as { ok: boolean; error?: string };
      if (!result.ok) {
        setError(result.error ?? "Something went wrong. Try again.");
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setError("We could not save that. Check your connection and try again.");
      setBusy(false);
    }
  }

  if (done) {
    return <p className="font-text text-body font-medium text-vx-ink">You are on the list. We will write to you the day seats open.</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="hidden" aria-hidden="true">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div>
        <label htmlFor="wl-email" className={labelClass}>
          Email
        </label>
        <input id="wl-email" name="email" type="email" autoComplete="email" inputMode="email" required className={`mt-1 ${inputClass}`} />
      </div>
      <fieldset>
        <legend className={labelClass}>I am a</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <label
              key={role.value}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-sm border border-vx-muted px-4 font-text text-body has-[:checked]:border-vx-ink has-[:checked]:bg-vx-stone has-[:checked]:font-medium"
            >
              <input type="radio" name="role" value={role.value} required className="h-4 w-4 accent-[#17140F]" />
              {role.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-start gap-3 font-text text-small text-vx-ink-2">
        <input type="checkbox" name="consent" value="yes" required className="mt-1 h-4 w-4 accent-[#17140F]" />
        <span>
          I am 18 or older, or my parent or guardian agrees. VEXA may keep these details to write to me about the room. I have read the{" "}
          <Link href="/legal/privacy" className="vx-link">
            privacy policy
          </Link>
          .
        </span>
      </label>
      <p role="alert" aria-live="polite" className="min-h-[1.5rem] font-text text-small text-vx-error">
        {error}
      </p>
      <button type="submit" disabled={busy} className={`${primaryButton} disabled:opacity-60`}>
        {busy ? "Saving..." : button}
      </button>
    </form>
  );
}
