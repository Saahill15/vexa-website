"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

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
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      problem: String(data.get("problem") ?? "").trim(),
      source: String(data.get("source") ?? "").trim(),
    };

    const nextErrors: Record<string, string> = {};
    if (!payload.name) nextErrors.name = "Name is required.";
    if (!payload.email) nextErrors.email = "Work email is required.";
    if (!payload.company) nextErrors.company = "Company is required.";
    if (!payload.problem) nextErrors.problem = "Tell us the business problem.";
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
      setMessage("Thanks. We will get back to you.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Try again, or email partnerships@vexadigital.in.");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-md border border-vx-neutral-200 bg-vx-white px-3 py-2.5 text-sm text-vx-ink-900 transition-[border-color,box-shadow] duration-base ease-vx-out focus-visible:border-vx-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vx-accent-500";

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="text-sm font-medium text-vx-ink-900">
          Name
        </label>
        <input id="name" name="name" type="text" autoComplete="name" className={inputClass} />
        {fieldErrors.name ? <p className="mt-1 text-sm text-vx-band-lowball">{fieldErrors.name}</p> : null}
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-vx-ink-900">
          Work email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" className={inputClass} />
        {fieldErrors.email ? (
          <p className="mt-1 text-sm text-vx-band-lowball">{fieldErrors.email}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="company" className="text-sm font-medium text-vx-ink-900">
          Company
        </label>
        <input id="company" name="company" type="text" autoComplete="organization" className={inputClass} />
        {fieldErrors.company ? (
          <p className="mt-1 text-sm text-vx-band-lowball">{fieldErrors.company}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="problem" className="text-sm font-medium text-vx-ink-900">
          What business problem are you trying to solve?
        </label>
        <textarea id="problem" name="problem" rows={5} className={inputClass} />
        {fieldErrors.problem ? (
          <p className="mt-1 text-sm text-vx-band-lowball">{fieldErrors.problem}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="source" className="text-sm font-medium text-vx-ink-900">
          How did you hear about VEXA? (optional)
        </label>
        <input id="source" name="source" type="text" className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-pill bg-vx-accent-500 px-5 py-3 text-sm font-medium text-white transition-[colors,transform] duration-base ease-vx-out hover:bg-vx-accent-600 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send"}
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
