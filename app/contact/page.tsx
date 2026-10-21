import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { Split } from "@/components/Split";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Tell us about a gaming campaign or esports business. ${SITE.email}`,
};

export default function ContactPage() {
  return (
    <div className="wrap contact">
      <div className="c-intro">
        <Reveal as="p" className="tag">Contact</Reveal>
        <Split as="h1" className="h-xl">Say hello.</Split>
        <Reveal delay={400}>
          <a className="c-mail" href={`mailto:${SITE.email}`}>{SITE.email} <span aria-hidden="true">↗</span></a>
        </Reveal>
        <Reveal className="c-meta" delay={480}>
          <p>{SITE.address}</p>
          <ul>
            <li><a href={SITE.instagram} rel="noopener" target="_blank">Instagram</a></li>
            <li><a href={SITE.linkedin} rel="noopener" target="_blank">LinkedIn</a></li>
          </ul>
        </Reveal>
      </div>

      <Reveal className="fcard" variant="s" delay={250}>
        <div className="fin">
          <ContactForm />
        </div>
      </Reveal>
    </div>
  );
}
