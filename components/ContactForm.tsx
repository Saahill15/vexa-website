"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { SITE } from "@/lib/site";

type Role = "brand" | "organisation" | "other";
type Field = "role" | "problem" | "email" | "consent";

const ROLES: Record<Role, string> = {
  brand: "A brand",
  organisation: "An esports business",
  other: "Something else",
};

const ROLE_CARDS: { value: Role; icon: string; title: string; text: string }[] = [
  { value: "brand", icon: "◎", title: "A brand", text: "A campaign in gaming." },
  { value: "organisation", icon: "⚑", title: "An esports business", text: "A team or tournament." },
  { value: "other", icon: "✦", title: "Something else", text: "A creator or other enquiry." },
];

const STEPS = [
  { title: "Who are you building for?", intro: "Choose the closest fit.", name: "About you" },
  { title: "What do you have in mind?", intro: "A few sentences are enough to begin.", name: "Your message" },
  { title: "How can we reach you?", intro: "Review your note, add your email and send it.", name: "Review and send" },
];

const FIELD_LABEL: Record<Field, string> = { role: "Who you are", problem: "Your message", email: "Email", consent: "Consent" };

export function ContactForm() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | "">("");
  const [problem, setProblem] = useState("");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [summary, setSummary] = useState<Field[]>([]);
  const [sent, setSent] = useState<{ href: string; preview: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // preselect from ?as=brand|organisation|other
  useEffect(() => {
    const as = new URLSearchParams(window.location.search).get("as");
    if (as && as in ROLES) setRole(as as Role);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    titleRef.current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    if (summary.length) summaryRef.current?.focus();
  }, [summary]);

  useEffect(() => {
    if (sent) {
      successRef.current?.focus({ preventScroll: true });
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [sent]);

  function validate(field: Field): string {
    if (field === "role") return role ? "" : "Choose the description that fits you.";
    if (field === "problem") return problem.trim() ? "" : "Tell us a little about what you have in mind.";
    if (field === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? "" : "Enter a full email address so we can reply.";
    return consent ? "" : "Agree to us using these details to reply to your message.";
  }

  function check(fields: Field[]): boolean {
    const next: Partial<Record<Field, string>> = {};
    fields.forEach((f) => (next[f] = validate(f)));
    const failing = fields.filter((f) => next[f]);
    setErrors((prev) => ({ ...prev, ...next }));
    setSummary(failing);
    return failing.length === 0;
  }

  function clearError(field: Field) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  }

  function goTo(field: Field) {
    setStep(field === "role" ? 0 : field === "problem" ? 1 : 2);
    setSummary([]);
    setTimeout(() => document.getElementById(field === "role" ? "role" : field)?.focus(), 80);
  }

  function compose(): string {
    const lines = ["Hello VEXA,", "", problem.trim(), "", "---", `I am: ${role ? ROLES[role] : ""}`];
    if (company.trim()) lines.push(`Company or channel: ${company.trim()}`);
    if (name.trim()) lines.push(`Name: ${name.trim()}`);
    lines.push(`Reply to: ${email.trim()}`);
    return lines.join("\n");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (website) return;
    if (step === 0) {
      if (check(["role"])) { setSummary([]); setStep(1); }
      return;
    }
    if (step === 1) {
      if (check(["problem"])) { setSummary([]); setStep(2); }
      return;
    }
    if (!check(["role", "problem", "email", "consent"])) return;
    const body = compose();
    const subject = `Enquiry from ${name.trim() || email.trim()} · ${role ? ROLES[role] : "VEXA website"}`;
    const href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent({ href, preview: `To: ${SITE.email}\nSubject: ${subject}\n\n${body}` });
    window.location.href = href;
  }

  async function copy() {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(sent.preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable */
    }
  }

  const current = STEPS[step];

  if (sent) {
    return (
      <div className="done" ref={successRef} tabIndex={-1}>
        <span className="ok" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h2 className="h-lg" style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)" }}>One last step: send the email.</h2>
        <p className="dim">Your email app should have opened with your message ready. Press send there. If nothing opened, use the buttons below.</p>
        <div className="row">
          <a className="btn" href={sent.href}>Open email app <span className="arr" aria-hidden="true">→</span></a>
          <button type="button" className="btn btn--line" onClick={copy}>{copied ? "Copied" : "Copy the message"}</button>
        </div>
        <pre>{sent.preview}</pre>
      </div>
    );
  }

  return (
    <form id="contact-form" noValidate aria-label="Contact form" onSubmit={onSubmit}>
      <div className="fprog">
        <div className="fprog-top">
          <span>Step <b>{step + 1}</b> of 3</span>
          <span>{current.name}</span>
        </div>
        <div className="fbar" aria-hidden="true"><i style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      </div>
      <h2 className="ftitle h-md" tabIndex={-1} ref={titleRef}>{current.title}</h2>
      <p className="fintro">{current.intro}</p>

      <fieldset className="fs" hidden={step !== 0}>
        <legend className="sr-only">About you</legend>
        <div className="roles" id="role" tabIndex={-1} aria-invalid={errors.role ? true : undefined}>
          {ROLE_CARDS.map((card) => (
            <label key={card.value}>
              <input
                type="radio"
                name="role"
                value={card.value}
                checked={role === card.value}
                onChange={() => { setRole(card.value); clearError("role"); }}
              />
              <span>
                <i className="ic" aria-hidden="true">{card.icon}</i>
                <span><strong>{card.title}</strong><small>{card.text}</small></span>
              </span>
            </label>
          ))}
        </div>
        {errors.role ? <p className="ferr">{errors.role}</p> : null}
      </fieldset>

      <fieldset className="fs" hidden={step !== 1}>
        <legend className="sr-only">Your message</legend>
        <label className="fl" htmlFor="problem">Your message <span>(required)</span></label>
        <textarea
          className="ta"
          id="problem"
          name="problem"
          rows={4}
          value={problem}
          onChange={(e) => { setProblem(e.target.value); clearError("problem"); }}
          aria-required="true"
          aria-invalid={errors.problem ? true : undefined}
          placeholder="What would you like to move forward?"
        />
        {errors.problem ? <p className="ferr">{errors.problem}</p> : null}
        <div className="fg fg--1">
          <div>
            <label className="fl" htmlFor="company">Company or channel <span>(optional)</span></label>
            <input className="in-f" id="company" name="company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
        </div>
      </fieldset>

      <fieldset className="fs" hidden={step !== 2}>
        <legend className="sr-only">Review and send</legend>
        <div className="rev">
          <div>
            <span className="tag">Your note</span>
            <button type="button" onClick={() => goTo("problem")}>Edit</button>
          </div>
          <p>{problem.trim() || "Your message will appear here."}</p>
          <span>{role ? ROLES[role] : "Your enquiry"}{company.trim() ? ` · ${company.trim()}` : ""}</span>
        </div>
        <div className="fg">
          <div>
            <label className="fl" htmlFor="name">Name <span>(optional)</span></label>
            <input className="in-f" id="name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="fl" htmlFor="email">Email <span>(required)</span></label>
            <input
              className="in-f"
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              aria-required="true"
              aria-invalid={errors.email ? true : undefined}
            />
            {errors.email ? <p className="ferr">{errors.email}</p> : null}
          </div>
        </div>
        <div className="consent">
          <label>
            <input
              id="consent"
              name="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => { setConsent(e.target.checked); clearError("consent"); }}
              aria-required="true"
              aria-invalid={errors.consent ? true : undefined}
            />
            <span>I agree to VEXA using these details to reply to my message.</span>
          </label>
          {errors.consent ? <p className="ferr">{errors.consent}</p> : null}
        </div>
      </fieldset>

      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {summary.length ? (
        <div className="esum" role="alert" tabIndex={-1} ref={summaryRef}>
          <p>Check {summary.length === 1 ? "one thing" : `${summary.length} things`} before continuing:</p>
          <ul>
            {summary.map((f) => (
              <li key={f}>
                <a href={`#${f}`} onClick={(e) => { e.preventDefault(); goTo(f); }}>{FIELD_LABEL[f]}: {errors[f]}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="facts">
        {step > 0 ? <button type="button" className="back" onClick={() => { setSummary([]); setStep(step - 1); }}>← Back</button> : null}
        <button type="submit" className="btn next">
          {step < 2 ? "Continue" : "Send your message"} <span className="arr" aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
