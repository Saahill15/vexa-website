import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "About VEXA, and Why the Name",
  description:
    "VEXA is a brand partnerships company for gaming. Here is why the name, and who builds the work.",
};

export default function AboutPage(): React.ReactElement {
  return (
    <div className="pb-20">
      <PageIntro eyebrow="About" title="Why VEXA">
        <p>
          VEXA sells sponsorship for gaming and youth rights holders, and runs measured campaigns
          for brands who want their audience. It is founded and run by Kaustubh, who goes by Soda.
        </p>
      </PageIntro>

      <div className="mx-auto max-w-3xl space-y-14 px-5 md:px-8">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900">
            Who is behind VEXA
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            VEXA is founded and run by Kaustubh, who goes by Soda. He is a law graduate, and he
            played competitive BGMI for three years, leading a team as an in game leader, a role
            built on strategy and calling shots rather than raw mechanical skill. He brings both
            instincts to VEXA: the discipline of reading a deal exactly as written before pricing
            it, and a player&apos;s instinct for what a gaming audience actually responds to.
          </p>
        </section>

        {/* LEAD HOLD 22 Sep 2026: Advocates Act / enrolment / structure copy omitted from public
            render pending Soda review. SITE_PLAN.md open question 4. Do not publish that section
            until he clears it. */}

        {/* CONFIRM WITH SODA: see SITE_PLAN.md open question 5 */}
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900">
            Why the name
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            Very easy is never awesome. That is the idea behind the name, and it is the standard the
            business is actually held to. Sponsorship in gaming looks easy from outside, a logo on a
            jersey, a shoutout in a stream, and most of what gets sold under that idea is exactly
            that easy and exactly that forgettable. VEXA exists for the harder, better version: a
            sponsorship or a campaign designed around a real number, agreed before anyone spends.
          </p>
        </section>

        <div>
          <ButtonLink href="/contact">Talk to us about your deal</ButtonLink>
        </div>
      </div>
    </div>
  );
}
