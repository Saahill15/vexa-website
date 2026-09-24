import type { Metadata } from "next";
import { withShare } from "@/lib/meta";
import { ContactForm } from "@/components/ContactForm";
import { PageIntro } from "@/components/PageIntro";
import { SITE } from "@/lib/site";

export const metadata: Metadata = withShare({
  title: "Send a sponsorship brief",
  description:
    "Send VEXA your brief. Tell us if you are a brand that wants to reach gamers, or a team, event or creator looking for sponsors.",
  alternates: { canonical: "/contact" },
});

export default function ContactPage(): React.ReactElement {
  return (
    <>
      <PageIntro segment="CONTACT-01" label="Contact" title="Send your brief">
        <p>No pitch on the first call. We spend three to four days on your business before we propose anything.</p>
        <p>Tell us if you are a brand that wants to reach gamers, or a team, event or creator looking for sponsors.</p>
        <p>If your launch date is close, say so in your brief.</p>
      </PageIntro>

      <section className="border-t border-vx-hair">
        <div className="vx-container vx-grid gap-y-16 pb-24 pt-12 md:pt-16 lg:pb-32">
          <div className="col-span-full lg:col-span-6 lg:col-start-4">
            <ContactForm />
          </div>
          <aside data-segment="CONTACT-03" className="col-span-full lg:col-span-3 lg:col-start-10">
            <div className="border-t border-vx-ink pt-5 lg:sticky lg:top-24">
              <h2 className="vx-label text-vx-muted">Or contact us directly</h2>
              <p className="mt-4 font-text text-body">
                <a className="vx-link break-all font-medium" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
              </p>
              <p className="mt-2 font-text text-body">
                <a className="vx-link font-medium" href={SITE.phoneHref}>
                  {SITE.phone}
                </a>
              </p>
              <p className="mt-6 font-text text-small text-vx-muted" data-counsel="true">
                VEXA Digital, a trade name of Blue Wings. Operating office: 77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
