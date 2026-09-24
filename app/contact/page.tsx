import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Book a Call with VEXA",
  description:
    "Tell us the business problem you are trying to solve. We will tell you honestly whether gaming is the right spend for it right now.",
};

export default function ContactPage(): React.ReactElement {
  return (
    <div className="pb-20">
      <PageIntro eyebrow="Contact" title="Book a call">
        <p>
          No pitch on the first call. We spend three to four days understanding your business before
          we propose anything, because a proposal written faster than that is a template, and it
          reads like one.
        </p>
        <p>
          Tell us if you run a gaming or youth rights holder looking to sell sponsorship, or a
          brand looking to reach gamers. We work both sides, and we will tell you which one you
          are.
        </p>
      </PageIntro>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:px-8">
        <div className="rounded-lg border border-vx-neutral-200 bg-vx-white p-6 md:p-8">
          <ContactForm />
        </div>
        <aside className="space-y-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Direct contact
          </h2>
          <p className="text-base text-vx-neutral-600">
            Phone:{" "}
            <a
              className="rounded-sm font-medium text-vx-accent-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500"
              href="tel:+919958895505"
            >
              +91 9958895505
            </a>
          </p>
          <p className="text-base text-vx-neutral-600">
            Email:{" "}
            <a
              className="rounded-sm font-medium text-vx-accent-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500"
              href="mailto:partnerships@vexadigital.in"
            >
              partnerships@vexadigital.in
            </a>
          </p>
        </aside>
      </div>
    </div>
  );
}
