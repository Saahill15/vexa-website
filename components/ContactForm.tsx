"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { primaryButton } from "@/components/ButtonLink";
import { readAudience } from "@/lib/audience";
import { COSTS, COSTS_CONFIRMED } from "@/lib/costs";
import { SITE } from "@/lib/site";

type Field = "role" | "email" | "problem" | "consent";
type Errors = Partial<Record<Field, string>>;

const ROLES = [
  { value: "brand", label: "A brand" },
  { value: "rights-holder", label: "A team, event or creator" },
] as const;

const INTERESTS = ["Sell sponsorship", "Find brand partners", "Test gaming with a pilot", "Check a deal", "Not sure yet"] as const;

const FIELD_LABEL: Record<Field, string> = {
  role: "Who you are",
  email: "Email",
  problem: "Your brief",
  consent: "Consent",
};

const REPLY_PROMISE = "Soda reads every brief himself and replies by email.";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(field: Field, form: HTMLFormElement): string | undefined {
  const data = new FormData(form);
  const value = String(data.get(field) ?? "").trim();
  switch (field) {
    case "role":
      return value ? undefined : "Choose who you are, a brand or a team, event or creator.";
    case "email":
      if (!value) return "Enter your email so we can reply, for example name@company.in.";
      return isEmail(value) ? undefined : "Enter a full email address, for example name@company.in.";
    case "problem":
      return value ? undefined : "Tell us the result you need from gaming, in a line or two.";
    case "consent":
      return data.get("consent") === "yes" ? undefined : "Tick the box so we can use these details to reply to you.";
    default:
      return undefined;
  }
}

const inputClass =
  "block min-h-[48px] w-full rounded-sm border-0 border-b border-vx-muted bg-vx-stone px-3 py-3 font-text text-body text-vx-ink transition-colors duration-fast focus:bg-vx-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-vx-peacock-blue aria-[invalid=true]:border-vx-error";
const labelClass = "block font-text text-[15px] font-medium text-vx-ink";
const hintClass = "mt-1 font-text text-small text-vx-muted";
const stepLabel = "vx-label text-vx-peacock-blue";

function ErrorText({ id, message }: { id: string; message?: string }): React.ReactElement {
  return (
    <p id={id} className="mt-1 flex min-h-[1.5rem] items-start gap-1.5 font-text text-small text-vx-error">
      {message ? (
        <>
          <svg viewBox="0 0 16 16" className="mt-[3px] h-3.5 w-3.5 shrink-0" aria-hidden="true">
            <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5v4.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>{message}</span>
        </>
      ) : null}
    </p>
  );
}

export function ContactForm(): React.ReactElement {
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<Field[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audience = readAudience();
    if (audience === "brands") setRole("brand");
    if (audience === "holders") setRole("rights-holder");
  }, []);

  useEffect(() => {
    if (summary.length > 0) summaryRef.current?.focus();
  }, [summary]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function onBlurField(field: Field, form: HTMLFormElement | null): void {
    if (!form) return;
    setErrors((current) => ({ ...current, [field]: validate(field, form) }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const fields: Field[] = ["role", "email", "problem", "consent"];
    const next: Errors = {};
    fields.forEach((field) => {
      next[field] = validate(field, form);
    });
    setErrors(next);
    const failing = fields.filter((field) => next[field]);
    setServerMessage("");
    if (failing.length > 0) {
      setSummary(failing);
      setStatus("error");
      return;
    }
    setSummary([]);
    setStatus("submitting");

    const data = new FormData(form);
    const payload = {
      role: String(data.get("role") ?? ""),
      interest: data.getAll("interest").map(String).join(", "),
      email: String(data.get("email") ?? "").trim(),
      name: String(data.get("name") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      problem: String(data.get("problem") ?? "").trim(),
      budget: String(data.get("budget") ?? "").trim(),
      launch: String(data.get("launch") ?? "").trim(),
      source: String(data.get("source") ?? "").trim(),
      website: String(data.get("website") ?? ""),
      consent: data.get("consent") === "yes",
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) {
        setStatus("error");
        setServerMessage(body.error ?? `Something went wrong on our side. Try again, or email ${SITE.email}.`);
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setServerMessage(`The brief did not send because of a network problem. Try again, or email ${SITE.email}.`);
    }
  }

  if (status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="border-y border-vx-ink px-4 py-16 text-center">
        <p className="vx-label text-vx-peacock-teal-deep">Brief received</p>
        <p className="mx-auto mt-4 max-w-[24ch] font-display text-display-l text-vx-ink">Thank you. Your brief has reached us.</p>
        <p className="mx-auto mt-6 max-w-[44ch] font-text text-body text-vx-ink-2">
          {REPLY_PROMISE} We spend three to four days on your business before we propose anything.
        </p>
        <p className="mx-auto mt-4 max-w-[44ch] font-text text-small text-vx-muted">
          You can also email{" "}
          <a className="vx-link" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          .
        </p>
      </div>
    );
  }

  const describedBy = (field: Field, hint?: string): string => [hint, `${field}-error`].filter(Boolean).join(" ");

  return (
    <form data-segment="CONTACT-02" onSubmit={onSubmit} noValidate aria-label="Send your brief">
      <fieldset
        className="border-t border-vx-ink pt-6"
        aria-describedby="role-error"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onBlurField("role", event.currentTarget.form);
        }}
      >
        <legend className="float-left w-full">
          <span className={stepLabel}>Step 1 of 3</span>
          <span className="mt-2 block font-display text-h3 text-vx-ink">Who are you?</span>
        </legend>
        <div id="role" className="clear-both flex flex-wrap gap-2 pt-4">
          {ROLES.map((option) => (
            <label key={option.value} className="relative">
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => {
                  setRole(option.value);
                  setErrors((current) => ({ ...current, role: undefined }));
                }}
                className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <span className="flex min-h-[44px] items-center gap-3 rounded-sm border-2 border-vx-muted px-4 font-text text-small font-medium text-vx-ink transition-colors duration-fast peer-checked:border-vx-peacock-blue peer-checked:bg-vx-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-vx-peacock-blue">
                <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-current">
                  <span className={`h-2 w-2 rounded-full ${role === option.value ? "bg-vx-peacock-blue" : ""}`} />
                </span>
                {option.label}
              </span>
            </label>
          ))}
        </div>
        <ErrorText id="role-error" message={errors.role} />
      </fieldset>

      <fieldset className="mt-8 border-t border-vx-hair pt-6">
        <legend className="float-left w-full">
          <span className={stepLabel}>Step 2 of 3</span>
          <span className="mt-2 block font-display text-h3 text-vx-ink">What do you want to do?</span>
          <span className={`block ${hintClass}`}>Choose any that fit. This is optional.</span>
        </legend>
        <div className="clear-both flex flex-wrap gap-2 pt-4">
          {INTERESTS.map((item) => (
            <label key={item} className="relative">
              <input type="checkbox" name="interest" value={item} className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0" />
              <span className="flex min-h-[44px] items-center gap-2 rounded-sm border border-vx-muted px-4 font-text text-small text-vx-ink transition-colors duration-fast peer-checked:border-vx-peacock-blue peer-checked:bg-vx-white peer-checked:font-medium peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-vx-peacock-blue [&_path]:opacity-0 peer-checked:[&_path]:opacity-100">
                <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-vx-peacock-blue" aria-hidden="true">
                  <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" fill="none" stroke="#655D52" />
                  <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
                </svg>
                {item}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-10 border-t border-vx-hair pt-6">
        <legend className="float-left w-full">
          <span className={stepLabel}>Step 3 of 3</span>
          <span className="mt-2 block font-display text-h3 text-vx-ink">Your details and the result you need</span>
        </legend>
        <div className="clear-both grid gap-x-6 pt-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="email" className={labelClass}>
              Email <span className="font-normal text-vx-muted">(required)</span>
            </label>
            <p id="email-hint" className={hintClass}>
              A work email helps us reply faster.
            </p>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              aria-required="true"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy("email", "email-hint")}
              onBlur={(event) => onBlurField("email", event.currentTarget.form)}
              className={`mt-2 ${inputClass}`}
            />
            <ErrorText id="email-error" message={errors.email} />
          </div>
          <div>
            <label htmlFor="name" className={labelClass}>
              Name
            </label>
            <input id="name" name="name" type="text" autoComplete="name" className={`mt-2 ${inputClass}`} />
            <div className="min-h-[1.5rem]" />
          </div>
          <div>
            <label htmlFor="company" className={labelClass}>
              Company or channel
            </label>
            <input id="company" name="company" type="text" autoComplete="organization" className={`mt-2 ${inputClass}`} />
            <div className="min-h-[1.5rem]" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="problem" className={labelClass}>
              Your brief <span className="font-normal text-vx-muted">(required)</span>
            </label>
            <p id="problem-hint" className={hintClass}>
              What result do you need from gaming?
            </p>
            <textarea
              id="problem"
              name="problem"
              rows={5}
              aria-required="true"
              aria-invalid={errors.problem ? true : undefined}
              aria-describedby={describedBy("problem", "problem-hint")}
              onBlur={(event) => onBlurField("problem", event.currentTarget.form)}
              className={`mt-2 resize-y ${inputClass}`}
            />
            <ErrorText id="problem-error" message={errors.problem} />
          </div>
          {COSTS_CONFIRMED && COSTS.budgetBands.length > 0 ? (
            <div className="sm:col-span-2">
              <label htmlFor="budget" className={labelClass}>
                Budget range
              </label>
              <select id="budget" name="budget" defaultValue="" className={`mt-2 ${inputClass}`}>
                <option value="">Choose one</option>
                {COSTS.budgetBands.map((band) => (
                  <option key={band}>{band}</option>
                ))}
              </select>
              <div className="min-h-[1.5rem]" />
            </div>
          ) : null}
          <div>
            <label htmlFor="launch" className={labelClass}>
              Launch date, if you have one
            </label>
            <input id="launch" name="launch" type="text" className={`mt-2 ${inputClass}`} />
            <div className="min-h-[1.5rem]" />
          </div>
          <div>
            <label htmlFor="source" className={labelClass}>
              How did you hear about VEXA?
            </label>
            <input id="source" name="source" type="text" className={`mt-2 ${inputClass}`} />
            <div className="min-h-[1.5rem]" />
          </div>
        </div>
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">Leave this empty</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </fieldset>

      <div className="mt-6 border-t border-vx-hair pt-6">
        <ul className="list-disc space-y-1 pl-5 font-text text-small text-vx-ink-2">
          <li data-counsel="true">What we collect. The details in this form.</li>
          <li data-counsel="true">Why. To reply to your brief and discuss working together.</li>
          <li data-counsel="true">
            Your choices. You can withdraw consent or ask us to delete your details at any time by emailing {SITE.email}.
          </li>
          <li data-counsel="true">
            Complaints. Our{" "}
            <Link href="/legal/privacy" className="vx-link">
              Privacy Policy
            </Link>{" "}
            explains how to complain to us or to the Data Protection Board of India.
          </li>
        </ul>
        <div data-counsel="true" className="mt-5">
          <label className="flex min-h-[44px] cursor-pointer items-start gap-3 font-text text-body text-vx-ink">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              value="yes"
              aria-required="true"
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby="consent-error"
              onChange={(event) => {
                if (event.currentTarget.checked) setErrors((current) => ({ ...current, consent: undefined }));
              }}
              className="mt-1 h-5 w-5 shrink-0 rounded-sm accent-vx-peacock-blue"
            />
            <span>I agree to VEXA using these details to reply to my brief.</span>
          </label>
          <ErrorText id="consent-error" message={errors.consent} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <button type="submit" disabled={status === "submitting"} className={`${primaryButton} w-full disabled:cursor-wait sm:w-auto`}>
          {status === "submitting" ? "Sending your brief" : "Send your brief"}
        </button>
        <p className="font-text text-small text-vx-ink-2">{REPLY_PROMISE}</p>
      </div>
      <p className="mt-4 font-text text-small text-vx-ink-2">
        You can also email{" "}
        <a className="vx-link" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        .
      </p>

      {summary.length > 0 ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="mt-8 border-l-2 border-vx-error pl-4">
          <p className="font-text text-body font-semibold text-vx-ink">Check {summary.length === 1 ? "one thing" : `${summary.length} things`} before sending:</p>
          <ul className="mt-2 space-y-1 font-text text-small">
            {summary.map((field) => (
              <li key={field}>
                <a href={`#${field}`} className="vx-link text-vx-error">
                  {FIELD_LABEL[field]}: {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {serverMessage ? (
        <p role="alert" className="mt-8 border-l-2 border-vx-error pl-4 font-text text-body text-vx-ink">
          {serverMessage}
        </p>
      ) : null}
    </form>
  );
}
