import Link from "next/link";
import { TESTIMONIALS } from "@/content/proof";
import { Icon, type IconName } from "./Icon";
import { Reveal } from "./motion/Reveal";
import { WordReveal } from "./motion/WordReveal";

/*
 * Home page sections added after the reference review (sponsorshipcollective.com):
 * who it is for and what is going wrong, how we work, proof, free starting points and a closing call.
 * Copy is plain and makes no promise of results.
 */

const PAIN: { audience: string; icon: IconName; title: string; points: string[]; href: string; cta: string }[] = [
  {
    audience: "For brands",
    icon: "target",
    title: "Gaming matters. Where you fit is the hard part.",
    points: [
      "Quotes from creators and teams arrive, but there is no way to compare them.",
      "“Exposure” is on the proposal and nobody can say what you actually receive.",
      "No one owns approvals, permissions and delivery once the idea is agreed.",
    ],
    href: "/services#brands",
    cta: "See brand campaigns",
  },
  {
    audience: "For teams and organisers",
    icon: "trophy",
    title: "Brands are not replying, and the packages all look the same.",
    points: [
      "You are not sure what to charge, so the price is a guess.",
      "The deck lists followers, not what a brand would get and who delivers it.",
      "Everything is a logo placement, so nothing stands out to a buyer.",
    ],
    href: "/services#esports",
    cta: "See esports advisory",
  },
];

export function PainPoints() {
  return (
    <section className="sec sec--tint" aria-labelledby="pain-h">
      <div className="wrap">
        <div className="sec-head center">
          <Reveal><span className="label">Sound familiar?</span></Reveal>
          <WordReveal className="h2" id="pain-h" lines={["Most gaming partnerships", "stall for the same reasons."]} />
        </div>
        <div className="pain-grid">
          {PAIN.map((p, i) => (
            <Reveal key={p.audience} delay={i * 0.08} className="pain-card">
              <span className="pain-ico"><Icon name={p.icon} size={22} /></span>
              <p className="tag">{p.audience}</p>
              <h3 className="h-md">{p.title}</h3>
              <ul>
                {p.points.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <Link href={p.href} className="tl">{p.cta}</Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { title: "Talk it through", text: "A short conversation about your product or team, your goal, timing and what you already have. No finished brief needed." },
  { title: "Agree a written scope", text: "Deliverables, review dates and fee are written down before any work starts, so everyone knows what is being bought." },
  { title: "Build and deliver", text: "We develop the proposal, coordinate the partners and keep a record of delivery from the first review to the last." },
];

export function HowWeWork() {
  return (
    <section className="sec" aria-labelledby="how-h">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><span className="label">How we work</span></Reveal>
          <WordReveal className="h2" id="how-h" lines={["A clear path from", "first call to delivery."]} />
        </div>
        <ol className="how-grid">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="how-step">
              <span className="how-n">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="h-md">{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

const COMMITMENTS: { icon: IconName; title: string; text: string }[] = [
  { icon: "doc", title: "Written scope first", text: "Deliverables, reviews and fee agreed in writing before work begins." },
  { icon: "shield", title: "Honest about outcomes", text: "A sponsorship or income is never guaranteed, and we say so up front." },
  { icon: "check", title: "A record of delivery", text: "Approvals and partner coordination are tracked once the scope is agreed." },
  { icon: "chart", title: "Free pricing tool", text: "Valuate gives creators a starting estimate for a sponsored post." },
];

export function TrustStrip() {
  return (
    <section className="trust" aria-label="What you can count on">
      <div className="wrap trust-grid">
        {COMMITMENTS.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.05} className="trust-item">
            <span className="trust-ico"><Icon name={c.icon} size={20} /></span>
            <div>
              <b>{c.title}</b>
              <p>{c.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section className="sec" aria-labelledby="proof-h">
      <div className="wrap">
        <div className="sec-head center">
          <Reveal><span className="label">In their words</span></Reveal>
          <WordReveal className="h2" id="proof-h" lines={["What working with", "Vexa is like."]} />
        </div>
        <div className="quote-grid">
          {TESTIMONIALS.map((t, i) => (
            <Reveal as="article" key={t.name + i} delay={i * 0.06} className="quote-card">
              <blockquote>“{t.quote}”</blockquote>
              <p><b>{t.name}</b><span>{t.role}, {t.org}</span></p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const FREE: { icon: IconName; title: string; text: string; href: string; external?: boolean; cta: string }[] = [
  { icon: "chart", title: "Valuate", text: "Estimate a fair quote for a sponsored post. Free for creators.", href: "https://valuate.vexadigital.in", external: true, cta: "Try Valuate" },
  { icon: "doc", title: "Articles", text: "Short, practical writing on brand partnerships and creator pricing.", href: "/articles", cta: "Read the articles" },
  { icon: "chat", title: "FAQ", text: "Straight answers on scope, fees and how an engagement runs.", href: "/faq", cta: "Read the FAQ" },
];

export function FreeStart() {
  return (
    <section className="sec" aria-labelledby="free-h">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><span className="label">Not ready to talk?</span></Reveal>
          <WordReveal className="h2" id="free-h" lines={["Start with what", "is free."]} />
        </div>
        <div className="free-grid">
          {FREE.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} className="free-card">
              <span className="pain-ico"><Icon name={f.icon} size={22} /></span>
              <h3 className="h-md">{f.title}</h3>
              <p>{f.text}</p>
              <a className="tl" href={f.href} {...(f.external ? { target: "_blank", rel: "noopener" } : {})}>{f.cta}</a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClosingCall() {
  return (
    <section className="sec sec--deep closing" aria-labelledby="close-h">
      <div className="wrap closing-in">
        <Reveal><span className="label">Let’s talk</span></Reveal>
        <WordReveal className="h2" id="close-h" lines={["Know what you can offer.", "Help brands see it too."]} />
        <Reveal delay={0.15}><p className="lede">Whether you are a brand entering gaming or a team building an offer, a short conversation is the best place to start.</p></Reveal>
        <Reveal delay={0.2} className="row">
          <Link href="/contact#form" className="btn">Start a conversation <span className="arr" aria-hidden="true">→</span></Link>
          <Link href="/services" className="btn btn--ghost-light">See our services</Link>
        </Reveal>
      </div>
    </section>
  );
}
