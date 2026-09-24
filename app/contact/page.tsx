import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Send a sponsorship brief",
  description:
    "Send VEXA your brief. Tell us if you are a brand that wants to reach gamers, or a team, event or creator looking for sponsors.",
};

export default function ContactPage(): React.ReactElement {
  return (
    <div className="pb-20">
      <PageIntro segment="CONTACT-01" title="Send your brief">
        <p>
          No pitch on the first call. We spend three to four days on your business before we
          propose anything.
        </p>
        <p>
          Tell us if you are a brand that wants to reach gamers, or a team, event or creator looking
          for sponsors. We reply within [Soda to confirm: reply time in working days].
        </p>
        <p>
          If your launch date is close, say so in your brief. [Soda to confirm: whether a fast track
          exists, and what it is]
        </p>
      </PageIntro>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:px-8">
        <div className="rounded-lg border border-vx-charcoal-600 bg-vx-charcoal-800 p-6 md:p-8">
          <ContactForm />
        </div>
        <aside data-segment="CONTACT-03" className="space-y-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-cream-50">
            Or contact us directly
          </h2>
          <p className="text-base text-vx-neutral-400">
            Phone:{" "}
            <a
              className="rounded-sm font-medium text-vx-accent-500 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500"
              href="tel:+919958895505"
            >
              +91 9958895505
            </a>{" "}
            [Soda to confirm: hours when calls are answered]
          </p>
          <p className="text-base text-vx-neutral-400">
            Email:{" "}
            <a
              className="rounded-sm font-medium text-vx-accent-500 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500"
              href="mailto:partnerships@vexadigital.in"
            >
              partnerships@vexadigital.in
            </a>
          </p>
          <p className="text-base text-vx-neutral-400" data-counsel="true">
            VEXA Digital, a trade name of Blue Wings. Operating office: 77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070
          </p>
        </aside>
      </div>
    </div>
  );
}
