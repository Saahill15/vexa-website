"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Arrow, primaryButton } from "@/components/ButtonLink";
import { SITE } from "@/lib/site";

type Field = "role" | "problem" | "email" | "consent";
type Errors = Partial<Record<Field, string>>;
type Details = { role: string; problem: string; email: string; name: string; company: string; launch: string; source: string; consent: boolean; interest: string[]; website: string };
const ROLES = [{ value: "brand", label: "A brand", description: "A campaign or partnership in gaming." }, { value: "organisation", label: "An esports business", description: "A team, tournament or commercial offer." }, { value: "other", label: "A creator or another enquiry", description: "Creator work, Valuate or something else." }];
const INTERESTS = [{ value: "Run a gaming campaign", label: "A gaming campaign" }, { value: "Develop our organisation’s commercial offer", label: "An esports commercial offer" }, { value: "Check a deal", label: "A partnership scope" }, { value: "Not sure yet", label: "Still exploring" }];
const FIELD_LABEL: Record<Field, string> = { role: "Who you are", problem: "Your message", email: "Email", consent: "Consent" };
const STEPS = ["About you", "Your starting point", "Review and send"];

export function ContactForm({ preview = false }: { preview?: boolean }): React.ReactElement {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>({ role: "", problem: "", email: "", name: "", company: "", launch: "", source: "", consent: false, interest: [], website: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<Field[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);

  useEffect(() => {
    const chosen = new URLSearchParams(window.location.search).get("as");
    if (ROLES.some(role => role.value === chosen)) setDetails(current => ({ ...current, role: chosen || "" }));
    setReady(true);
  }, []);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    headingRef.current?.focus();
  }, [step]);
  useEffect(() => { if (summary.length) summaryRef.current?.focus(); }, [summary]);
  useEffect(() => { if (status === "success") successRef.current?.focus(); }, [status]);

  function update<K extends keyof Details>(field: K, value: Details[K]): void {
    setDetails(current => ({ ...current, [field]: value }));
    if (field in FIELD_LABEL) setErrors(current => ({ ...current, [field]: undefined }));
  }
  function validate(field: Field): string | undefined {
    if (field === "role") return ROLES.some(role => role.value === details.role) ? undefined : "Choose the description that fits you.";
    if (field === "problem") return details.problem.trim() ? undefined : "Tell us a little about what you have in mind.";
    if (field === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim()) ? undefined : "Enter a full email address so we can reply.";
    return details.consent ? undefined : "Agree to us using these details to reply to your message.";
  }
  function check(fields: Field[]): boolean {
    const next: Errors = {};
    fields.forEach(field => { next[field] = validate(field); });
    const failing = fields.filter(field => next[field]);
    setErrors(current => ({ ...current, ...next }));
    setSummary(failing);
    setServerMessage("");
    return failing.length === 0;
  }
  function move(next: number): void {
    setSummary([]);
    setServerMessage("");
    setStep(next);
  }
  function next(): void {
    if (check(step === 0 ? ["role"] : ["problem"])) move(step + 1);
  }
  function edit(field: Field): void {
    setStep(field === "role" ? 0 : field === "problem" ? 1 : 2);
    setSummary([]);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`#${field}`)?.focus();
    }));
  }
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (step < 2) { next(); return; }
    if (!check(["role", "problem", "email", "consent"])) { setStatus("error"); return; }
    setStatus("submitting");
    const payload = {
      role: details.role, interest: details.interest.join(", "), email: details.email.trim(),
      name: details.name.trim(), company: details.company.trim(), problem: details.problem.trim(),
      budget: "", launch: details.launch.trim(), source: details.source.trim(), website: details.website, consent: details.consent,
    };
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) {
        setStatus("error");
        setServerMessage(body.error || `Something went wrong. Try again, or email ${SITE.email}.`);
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setServerMessage(`The message did not send because of a network problem. Try again, or email ${SITE.email}.`);
    }
  }
  function error(field: Field): React.ReactElement | null {
    return errors[field] ? <p className="conversation-error" id={`${field}-error`}>{errors[field]}</p> : null;
  }

  if (status === "success") return <div ref={successRef} tabIndex={-1} role="status" className="conversation-success">
    <span className="success-mark" aria-hidden="true">↗</span><p className="vx-label">Message received</p>
    <h2>{preview ? "Saved in this local preview." : "Thank you for making a start."}</h2>
    <p>{preview ? "This test message is saved on this Mac. No email has been sent." : "Your message has reached us. We will reply by email about the next step."}</p>
    <Link href="/brands" className="vx-link">Explore the work while you are here</Link>
  </div>;

  return <form className="conversation-form" data-segment="CONTACT-02" ref={formRef} onSubmit={submit} noValidate aria-label="Start a conversation">
    {ready ? <nav className="conversation-progress" aria-label="Your enquiry progress">{STEPS.map((title,index) => <button key={title} type="button" aria-current={step === index ? "step" : undefined} disabled={index > step} onClick={() => move(index)}><span>{index + 1}</span>{title}</button>)}</nav> : null}
    <h2 ref={headingRef} tabIndex={-1} className="conversation-title">{step === 0 ? "Who are you building for?" : step === 1 ? "What do you have in mind?" : "How can we reach you?"}</h2>
    <p className="conversation-intro">{step === 0 ? "Choose the closest fit. We can work out the details together." : step === 1 ? "A few sentences are enough to begin. No sensitive budget or finished brief needed." : "Review your note, add your email and send it when you are ready."}</p>

    <fieldset hidden={ready && step !== 0} aria-describedby={errors.role ? "role-error" : undefined}>
      <legend className="sr-only">About you</legend>
      <div className="conversation-roles" id="role" tabIndex={-1}>
        {ROLES.map(role => <label key={role.value}>
          <input type="radio" name="role" value={role.value} checked={details.role === role.value} onChange={() => update("role", role.value)} />
          <span><strong>{role.label}</strong><small>{role.description}</small><span className="choice-arrow" aria-hidden="true">↗</span></span>
        </label>)}
      </div>{error("role")}
    </fieldset>

    <fieldset hidden={ready && step !== 1}>
      <legend className="sr-only">Your starting point</legend>
      <label htmlFor="problem">Tell us a little about the goal <span>(required)</span></label>
      <textarea id="problem" name="problem" rows={5} value={details.problem} onChange={event => update("problem", event.target.value)} aria-required="true" aria-invalid={errors.problem ? true : undefined} aria-describedby={errors.problem ? "problem-error" : undefined} placeholder="What are you working on, and what would you like to move forward?" />
      {error("problem")}
      <fieldset className="conversation-interests"><legend>A starting point, if one fits <span>(optional)</span></legend><div>{INTERESTS.map(item => <label key={item.value}><input type="checkbox" name="interest" value={item.value} checked={details.interest.includes(item.value)} onChange={event => update("interest", event.target.checked ? [...details.interest,item.value] : details.interest.filter(value => value !== item.value))} /><span>{item.label}</span></label>)}</div></fieldset>
      <div className="conversation-fields"><div><label htmlFor="company">Company or channel <span>(optional)</span></label><input id="company" name="company" value={details.company} onChange={event => update("company", event.target.value)} autoComplete="organization" /></div><div><label htmlFor="launch">Timing <span>(optional)</span></label><input id="launch" name="launch" value={details.launch} onChange={event => update("launch", event.target.value)} placeholder="If you already have a date" /></div></div>
    </fieldset>

    <fieldset hidden={ready && step !== 2}>
      <legend className="sr-only">Review and send</legend>
      <div className="conversation-review"><div><span className="vx-label">Your note</span><button type="button" onClick={() => edit("problem")}>Edit</button></div><p>{details.problem || "Your starting point will appear here."}</p><span>{ROLES.find(role => role.value === details.role)?.label || "Your enquiry"}{details.company ? ` · ${details.company}` : ""}</span></div>
      <div className="conversation-fields"><div><label htmlFor="name">Name <span>(optional)</span></label><input id="name" name="name" value={details.name} onChange={event => update("name", event.target.value)} autoComplete="name" /></div><div><label htmlFor="email">Email <span>(required)</span></label><input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={details.email} onChange={event => update("email", event.target.value)} aria-required="true" aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "email-error" : undefined} />{error("email")}</div></div>
      <label htmlFor="source" className="conversation-source-label">How did you hear about VEXA? <span>(optional)</span></label><input id="source" name="source" value={details.source} onChange={event => update("source", event.target.value)} />
      <div className="conversation-consent" data-counsel="true"><label><input id="consent" name="consent" type="checkbox" value="yes" checked={details.consent} onChange={event => update("consent", event.target.checked)} aria-required="true" aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? "consent-error" : undefined} /><span>I agree to VEXA using these details to reply to my message.</span></label>{error("consent")}</div>
      <details className="conversation-privacy" data-counsel="true"><summary>How we use your details</summary><p>We collect the details in this form to reply and discuss working together. You can withdraw consent or ask us to delete them by emailing {SITE.email}.</p><p>Our <Link href="/legal/privacy" className="vx-link">Privacy Policy</Link> explains how to complain to us or to the Data Protection Board of India.</p></details>
    </fieldset>
    <div className="conversation-honeypot" aria-hidden="true"><label htmlFor="website">Leave this empty</label><input id="website" name="website" value={details.website} onChange={event => update("website", event.target.value)} tabIndex={-1} autoComplete="off" /></div>
    {summary.length ? <div ref={summaryRef} className="conversation-error-summary" tabIndex={-1} role="alert"><p>Check {summary.length === 1 ? "one thing" : `${summary.length} things`} before continuing:</p><ul>{summary.map(field => <li key={field}><a href={`#${field}`} onClick={event => { event.preventDefault(); edit(field); }}>{FIELD_LABEL[field]}: {errors[field]}</a></li>)}</ul></div> : null}
    {serverMessage ? <p className="conversation-error-summary" role="alert">{serverMessage}</p> : null}
    <div className="conversation-actions">{ready && step > 0 ? <button type="button" className="conversation-back" onClick={() => move(step - 1)}>← Back</button> : null}<button type="submit" disabled={!ready || status === "submitting"} className={primaryButton}>{status === "submitting" ? "Sending your message" : step < 2 ? "Continue" : "Send your message"}<Arrow /></button></div>
    <p className="conversation-expectation">{preview ? "Test messages stay on this Mac. No email is sent." : "We will reply by email about the next step."}</p>
    <noscript><p className="conversation-expectation">Email <a href={`mailto:${SITE.email}`} className="vx-link">{SITE.email}</a> to start a conversation without JavaScript.</p></noscript>
  </form>;
}
