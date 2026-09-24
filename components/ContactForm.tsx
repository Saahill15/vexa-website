"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const REQUIRED = (
  <>
    <span aria-hidden="true"> (required)</span>
  </>
);

export function ContactForm(): React.ReactElement {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    setFieldErrors({});

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      email: String(data.get("email") ?? "").trim(),
      role: String(data.get("role") ?? "").trim(),
      problem: String(data.get("problem") ?? "").trim(),
      name: String(data.get("name") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      budget: String(data.get("budget") ?? "").trim(),
      launch: String(data.get("launch") ?? "").trim(),
      source: String(data.get("source") ?? "").trim(),
      consent: data.get("consent") === "yes",
    };

    const nextErrors: Record<string, string> = {};
    if (!payload.email) nextErrors.email = "Email is required.";
    if (!payload.role) nextErrors.role = "Tell us who you are.";
    if (!payload.problem) nextErrors.problem = "Tell us the result you need.";
    if (!payload.consent) nextErrors.consent = "Tick the box so we can reply to your brief.";
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setStatus("error");
      setMessage("Please fill the required fields.");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) {
        setStatus("error");
        setMessage(body.error ?? "Something went wrong. Try again, or email us directly.");
        return;
      }
      setStatus("success");
      setMessage(
        "Thanks, your brief has reached us. We reply within [Soda to confirm: reply time in working days]. If it is urgent, email partnerships@vexadigital.in.",
      );
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Try again, or email partnerships@vexadigital.in.");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-md border border-vx-neutral-200 bg-vx-white px-3 py-2.5 text-sm text-vx-ink-900 transition-[border-color,box-shadow] duration-base ease-vx-out focus-visible:border-vx-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vx-accent-500";
  const labelClass = "text-sm font-medium text-vx-ink-900";
  const errorClass = "mt-1 text-sm text-vx-band-lowball";

  return (
    <form data-segment="CONTACT-02" onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className={labelClass}>
          Email{REQUIRED}
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required aria-required="true" className={inputClass} />
        {fieldErrors.email ? <p className={errorClass}>{fieldErrors.email}</p> : null}
      </div>
      <div>
        <label htmlFor="role" className={labelClass}>
          I am{REQUIRED}
        </label>
        <select id="role" name="role" required aria-required="true" defaultValue="" className={inputClass}>
          <option value="" disabled>
            Choose one
          </option>
          <option value="brand">A brand</option>
          <option value="team-or-event">A team or event</option>
          <option value="creator">A creator</option>
        </select>
        {fieldErrors.role ? <p className={errorClass}>{fieldErrors.role}</p> : null}
      </div>
      <div>
        <label htmlFor="problem" className={labelClass}>
          Your brief{REQUIRED}
        </label>
        <p id="problem-hint" className="mt-1 text-sm text-vx-neutral-600">
          What result do you need from gaming?
        </p>
        <textarea id="problem" name="problem" rows={5} required aria-required="true" aria-describedby="problem-hint" className={inputClass} />
        {fieldErrors.problem ? <p className={errorClass}>{fieldErrors.problem}</p> : null}
      </div>
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" name="name" type="text" autoComplete="name" className={inputClass} />
      </div>
      <div>
        <label htmlFor="company" className={labelClass}>
          Company or channel
        </label>
        <input id="company" name="company" type="text" autoComplete="organization" className={inputClass} />
      </div>
      <div>
        <label htmlFor="budget" className={labelClass}>
          Budget range [Soda to confirm: budget bands]
        </label>
        <input id="budget" name="budget" type="text" className={inputClass} />
      </div>
      <div>
        <label htmlFor="launch" className={labelClass}>
          Launch date, if you have one
        </label>
        <input id="launch" name="launch" type="text" className={inputClass} />
      </div>
      <div>
        <label htmlFor="source" className={labelClass}>
          How did you hear about VEXA?
        </label>
        <input id="source" name="source" type="text" className={inputClass} />
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-vx-neutral-600">
        <li data-counsel="true">What we collect. The details in this form.</li>
        <li data-counsel="true">Why. To reply to your brief and discuss working together.</li>
        <li data-counsel="true">
          Your choices. You can withdraw consent or ask us to delete your details at any time by
          emailing partnerships@vexadigital.in.
        </li>
        <li data-counsel="true">
          Complaints. Our{" "}
          <Link href="/legal/privacy" className="font-medium text-vx-accent-600 underline-offset-4 hover:underline">
            Privacy Policy
          </Link>{" "}
          explains how to complain to us or to the Data Protection Board of India.
        </li>
      </ul>
      <div data-counsel="true">
        <label className="flex items-start gap-3 text-sm text-vx-ink-900">
          <input
            name="consent"
            type="checkbox"
            value="yes"
            required
            aria-required="true"
            className="mt-0.5 h-4 w-4 accent-vx-accent-500"
          />
          <span>I agree to VEXA using these details to reply to my brief.</span>
        </label>
        {fieldErrors.consent ? <p className={errorClass}>{fieldErrors.consent}</p> : null}
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-pill bg-vx-accent-500 px-5 py-3 text-sm font-medium text-white transition-[colors,transform] duration-base ease-vx-out hover:bg-vx-accent-600 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send brief"}
      </button>
      {message ? (
        <p
          className={`text-sm ${status === "success" ? "text-vx-band-fair" : "text-vx-band-lowball"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
