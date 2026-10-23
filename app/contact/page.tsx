import type { Metadata } from "next";
import { ConversationForm } from "@/components/ConversationForm";
import { Icon, type IconName } from "@/components/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { WordReveal } from "@/components/motion/WordReveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start a conversation",
  description: `Tell us about a gaming campaign or esports business. ${SITE.email}`,
};

// Who is getting in touch, each with its own next step (layout after the Accenture contact page)
const AUDIENCES: { icon: IconName; title: string; text: string; link: { label: string; href: string; external?: boolean } }[] = [
  { icon: "target", title: "Brands", text: "Planning a campaign in gaming? Tell us about your product, your audience and your timing.", link: { label: "Discuss a campaign", href: "/contact?as=brand#form" } },
  { icon: "trophy", title: "Esports teams and organisers", text: "Building an offer a brand can understand and buy? Start with what you already have.", link: { label: "Discuss advisory", href: "/contact?as=organisation#form" } },
  { icon: "chart", title: "Creators", text: "Want to know what to charge for a sponsored post? Valuate gives you a free starting estimate.", link: { label: "Try Valuate", href: "https://valuate.vexadigital.in", external: true } },
  { icon: "chat", title: "Something else", text: "Press, a partnership idea or a general question. Write to us and the right person will reply.", link: { label: "Email us", href: `mailto:${SITE.email}` } },
];

export default function ContactPage() {
  return (
    <>
      <header className="xl-head">
        <div className="wrap">
          <Reveal><span className="label">Contact</span></Reveal>
          <WordReveal as="h1" className="xl-title" lines={["How can", "we help?"]} />
          <Reveal delay={0.3}><p className="lede">Choose what fits you best, or send us a message below. A few sentences are enough to begin.</p></Reveal>
        </div>
      </header>

      <section className="xl-sec" aria-label="Who is getting in touch">
        <div className="wrap gc-grid">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.06} className="gc">
              <span className="gc-ico"><Icon name={a.icon} size={22} /></span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <a className="gc-link" href={a.link.href} {...(a.link.external ? { target: "_blank", rel: "noopener" } : {})}>{a.link.label}</a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="xl-sec sec--tint" id="form" style={{ scrollMarginTop: 70 }} aria-labelledby="form-h">
        <div className="wrap ct-form">
          <div className="ct-form-intro">
            <span className="label">Send us a message</span>
            <h2 className="h2" id="form-h">Tell us what you have in mind.</h2>
            <p>Three short steps. No finished brief or budget needed. We reply by email with the next step.</p>
          </div>
          <div className="ct-form-card">
            <ConversationForm />
          </div>
        </div>
      </section>

      <section className="xl-sec" aria-labelledby="ways-h">
        <div className="wrap">
          <h2 className="h2" id="ways-h" style={{ margin: "0 0 clamp(24px,3vw,40px)" }}>More ways to get in touch</h2>
          <div className="ct-ways">
            <div className="ct-way">
              <h3>Email us</h3>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </div>
            <div className="ct-way">
              <h3>Visit us</h3>
              <p>{SITE.address}</p>
            </div>
            <div className="ct-way">
              <h3>Follow us</h3>
              <div className="ct-social">
                <a href={SITE.instagram} target="_blank" rel="noopener" aria-label="Instagram"><Icon name="instagram" size={20} /></a>
                <a href={SITE.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn"><Icon name="linkedin" size={18} /></a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
