import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { withShare } from "@/lib/meta";
import { SITE } from "@/lib/site";

export const metadata: Metadata = withShare({ title: "Contact VEXA", description: "Tell us about a gaming campaign, esports organisation or creator question. A short note is enough to start the conversation.", alternates: { canonical: "/contact" } });

export default function ContactPage(): React.ReactElement {
  return <div className="contact-page"><div className="vx-container contact-composition">
    <header className="contact-welcome" data-segment="CONTACT-01"><p className="vx-label hero-eyebrow">Contact us</p><h1>Good work starts<br />with a conversation.</h1><p>A campaign idea, an esports business or a creator question. Tell us what you have in mind, and we will work out the next step.</p><div className="contact-direct"><p className="vx-label">Prefer to write directly?</p><a href={`mailto:${SITE.email}`}>{SITE.email}<span aria-hidden="true">↗</span></a></div><p className="contact-office" data-counsel="true">VEXA Digital, a trade name of Blue Wings.<br />Operating office: 77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070.</p></header>
    <div className="contact-form-stage"><ContactForm preview={process.env.VEXA_PREVIEW === "1"} /></div>
  </div></div>;
}
