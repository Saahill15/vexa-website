"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";

/*
 * Three-step brief: who you are → what you have in mind → review and send. Posts to /api/contact.
 * /contact?as=brand|organisation|other&service=<slug> preselects the role and service; the form always opens on step 1.
 * Each error shows once, under its own field; on a failed submit the form jumps to the first one.
 */

type Role = "brand" | "organisation" | "other";
type Field = "role" | "problem" | "email" | "consent";
type Errors = Partial<Record<Field, string>>;

const ROLES: { value: Role; label: string; text: string }[] = [
  { value: "brand", label: "A brand", text: "A campaign or partnership in gaming." },
  { value: "organisation", label: "An esports business", text: "A team, tournament or commercial offer." },
  { value: "other", label: "A creator or another enquiry", text: "Creator work, Valuate or something else." },
];

const NOT_SURE = "Not sure yet";

function interestsFor(role: Role | ""): string[] {
  if (role === "brand") return SERVICES.filter((s) => s.audience === "brands").map((s) => s.title);
  if (role === "organisation") return SERVICES.filter((s) => s.audience === "esports").map((s) => s.title);
  if (role === "other") return ["Creator work", "Valuate", "Something else"];
  return [];
}

const STEPS = [
  { name: "About you", title: "Who are you building for?", intro: "Choose the closest fit. We can work out the details together." },
  { name: "Your starting point", title: "What do you have in mind?", intro: "A few sentences are enough to begin. No finished brief or budget needed." },
  { name: "Review and send", title: "How can we reach you?", intro: "Review your note, add your email and send it when you are ready." },
];

/** Which step each required field lives on, in the order they are checked. */
const FIELD_STEP: Record<Field, number> = { role: 0, problem: 1, email: 2, consent: 2 };
const STEP_FIELDS: Field[][] = [["role"], ["problem"], ["email", "consent"]];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ConversationForm() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | "">("");
  const [interest, setInterest] = useState<string[]>([]);
  const [problem, setProblem] = useState("");
  const [company, setCompany] = useState("");
  const [timing, setTiming] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [serverError, setServerError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusField = useRef<Field | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const prevStep = useRef(step);

  // preselect from the service pages: ?as=brand or ?service=creator-campaigns
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const service = SERVICES.find((s) => s.slug === q.get("service"));
    const as = service ? (service.audience === "brands" ? "brand" : "organisation") : q.get("as");
    if (!ROLES.some((r) => r.value === as)) return;
    setRole(as as Role);
    if (service) setInterest([service.title]);
  }, []);

  // on a step change: bring the form back into view and move focus to the new step (or to a failing field)
  useEffect(() => {
    if (prevStep.current === step && !focusField.current) return;
    prevStep.current = step;
    const form = formRef.current;
    if (form && form.getBoundingClientRect().top < 80) form.scrollIntoView({ behavior: "smooth", block: "start" });
    const target = focusField.current ? document.getElementById(focusField.current) : headingRef.current;
    focusField.current = null;
    target?.focus({ preventScroll: true });
  }, [step, errors]);

  function validate(field: Field): string {
    if (field === "role") return role ? "" : "Choose the description that fits you.";
    if (field === "problem") return problem.trim() ? "" : "Tell us a little about what you have in mind.";
    if (field === "email") return EMAIL.test(email.trim()) ? "" : "Enter a full email address so we can reply.";
    return consent ? "" : "Tick the box so we can use these details to reply.";
  }

  /** Validates the fields, shows their errors and jumps to the first failing one. */
  function check(fields: Field[]): boolean {
    const next: Errors = {};
    fields.forEach((f) => (next[f] = validate(f)));
    setErrors((prev) => ({ ...prev, ...next }));
    const first = fields.find((f) => next[f]);
    if (!first) return true;
    focusField.current = first;
    setStep(FIELD_STEP[first]);
    return false;
  }

  function clear(field: Field) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  }

  function chooseRole(next: Role) {
    if (next !== role) setInterest([]);
    setRole(next);
    clear("role");
  }

  // "Not sure yet" and the specific options exclude each other
  function toggle(item: string, on: boolean) {
    setInterest((cur) => {
      if (!on) return cur.filter((v) => v !== item);
      if (item === NOT_SURE) return [NOT_SURE];
      return [...cur.filter((v) => v !== NOT_SURE), item];
    });
  }

  useEffect(() => {
    if (status === "sent") doneRef.current?.focus();
  }, [status]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setServerError("");
    if (step < 2) {
      if (check(STEP_FIELDS[step])) setStep(step + 1);
      return;
    }
    if (!check(["role", "problem", "email", "consent"])) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, interest: interest.join(", "), problem, company, timing, name, email, consent, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || `Your message did not send. Please try again, or email ${SITE.email}.`);
      setStatus("sent");
    } catch (cause) {
      setStatus("idle");
      setServerError(cause instanceof Error && cause.message !== "Failed to fetch" ? cause.message : `Your message did not send because of a connection problem. Please try again, or email ${SITE.email}.`);
    }
  }

  const err = (field: Field) =>
    errors[field] ? <p className="err" id={`${field}-err`} role="alert">{errors[field]}</p> : null;
  const invalid = (field: Field) =>
    errors[field] ? { "aria-invalid": true as const, "aria-describedby": `${field}-err` } : {};

  if (status === "sent") {
    return (
      <div className="sent" role="status" ref={doneRef} tabIndex={-1}>
        <svg className="sent-plane" viewBox="0 0 150 64" width="180" height="77" fill="none" aria-hidden="true">
          <path className="sent-trail" d="M6 54 C 40 54, 60 20, 100 26" />
          <g className="sent-craft">
            <path d="M104 22 L144 8 L128 46 L118 32 Z" />
            <path d="M118 32 L144 8" />
          </g>
        </svg>
        <h2 className="h-md">On its way to our team.</h2>
        <p className="muted">Thanks for reaching out. We’ll get back to you shortly.</p>
        <Link href="/" className="btn">Back to home <span className="arr" aria-hidden="true">→</span></Link>
        <div className="sent-wait">
          <span>While you wait</span>
          <div>
            <Link href="/valuate"><Icon name="chart" size={20} /><strong>Try Valuate</strong><small>See a starting quote</small></Link>
            <Link href="/articles"><Icon name="doc" size={20} /><strong>Read articles</strong><small>Notes on gaming</small></Link>
          </div>
        </div>
      </div>
    );
  }

  const roleLabel = ROLES.find((r) => r.value === role)?.label;
  const options = [...interestsFor(role), NOT_SURE];

  return (
    <form ref={formRef} className="form brief" onSubmit={submit} noValidate aria-label="Start a conversation" style={{ scrollMarginTop: 100 }}>
      <nav className="brief-steps" aria-label="Your enquiry progress">
        {STEPS.map((s, i) => (
          <button key={s.name} type="button" aria-current={step === i ? "step" : undefined} disabled={i > step} onClick={() => setStep(i)}>
            <span>{i + 1}</span>{s.name}
          </button>
        ))}
      </nav>

      <div className="brief-head">
        <h2 ref={headingRef} tabIndex={-1} className="h3">{STEPS[step].title}</h2>
        <p className="muted">{STEPS[step].intro}</p>
      </div>

      <fieldset className="brief-fs" hidden={step !== 0} aria-describedby={errors.role ? "role-err" : undefined}>
        <legend className="sr-only">About you</legend>
        <div className="brief-roles" id="role" tabIndex={-1} role="radiogroup" aria-label="Who you are">
          {ROLES.map((r) => (
            <label key={r.value}>
              <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => chooseRole(r.value)} />
              <span><strong>{r.label}</strong><small>{r.text}</small></span>
            </label>
          ))}
        </div>
        {err("role")}
      </fieldset>

      <fieldset className="brief-fs" hidden={step !== 1}>
        <legend className="sr-only">Your starting point</legend>
        <fieldset className="brief-chips">
          <legend>What it is about <span>(optional)</span></legend>
          <div>
            {options.map((item) => (
              <label key={item}>
                <input type="checkbox" checked={interest.includes(item)} onChange={(e) => toggle(item, e.target.checked)} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field">
          <label htmlFor="problem">Tell us a little about the goal <span>(required)</span></label>
          <textarea className="in" id="problem" rows={5} maxLength={2000} value={problem} onChange={(e) => { setProblem(e.target.value); clear("problem"); }} aria-required="true" {...invalid("problem")} placeholder="What are you working on, and what would you like to move forward?" />
          {err("problem")}
        </div>
        <div className="brief-two">
          <div className="field">
            <label htmlFor="company">Company or channel <span>(optional)</span></label>
            <input className="in" id="company" maxLength={120} autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="timing">Timing <span>(optional)</span></label>
            <input className="in" id="timing" maxLength={80} value={timing} onChange={(e) => setTiming(e.target.value)} placeholder="If you already have a date" />
          </div>
        </div>
      </fieldset>

      <fieldset className="brief-fs" hidden={step !== 2}>
        <legend className="sr-only">Review and send</legend>
        <div className="brief-review">
          <div><span className="tag">Your note</span><button type="button" onClick={() => setStep(1)}>Edit</button></div>
          <p>{problem.trim() || "Your starting point will appear here."}</p>
          <small>{[roleLabel, ...interest, company.trim()].filter(Boolean).join(" · ") || "Your enquiry"}</small>
        </div>
        <div className="brief-two">
          <div className="field">
            <label htmlFor="name">Name <span>(optional)</span></label>
            <input className="in" id="name" maxLength={80} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="email">Email <span>(required)</span></label>
            <input className="in" id="email" type="email" inputMode="email" maxLength={254} autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); clear("email"); }} aria-required="true" {...invalid("email")} />
            {err("email")}
          </div>
        </div>
        <div className="field">
          <label className="check">
            <input id="consent" type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); clear("consent"); }} aria-required="true" {...invalid("consent")} />
            <span>I agree to Vexa using these details to reply to my message.</span>
          </label>
          {err("consent")}
        </div>
        <p className="muted brief-fine">We use these details only to reply. See our <Link href="/privacy" className="tl-inline">Privacy Policy</Link>.</p>
      </fieldset>

      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {serverError ? <p className="brief-alert" role="alert">{serverError}</p> : null}

      <div className="row brief-actions">
        {step > 0 ? <button type="button" className="btn btn--line" onClick={() => setStep(step - 1)}>← Back</button> : null}
        <button type="submit" className="btn" disabled={status === "sending"}>{status === "sending" ? "Sending…" : step < 2 ? "Continue" : "Send your message"} <span className="arr" aria-hidden="true">→</span></button>
      </div>
    </form>
  );
}
