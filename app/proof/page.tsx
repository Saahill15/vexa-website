import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Track record and current work",
  description:
    "What VEXA has in progress, the partners it works with, and what its founder did before VEXA.",
};

const cardH2 = "font-display text-xl font-semibold tracking-tight md:text-2xl";
const cardP = "mt-4 text-base leading-relaxed md:text-lg";

export default function ProofPage(): React.ReactElement {
  return (
    <div className="pb-20">
      <PageIntro segment="PROOF-01" title="Our track record so far">
        <p>
          VEXA has not yet run a campaign under its own name. This page shows what is in progress,
          who we work with, and what our founder did before VEXA, with dates where we can share
          them.
        </p>
      </PageIntro>

      <div className="mx-auto max-w-3xl space-y-10 px-5 md:px-8">
        <section
          data-segment="PROOF-02"
          className="rounded-lg border border-vx-charcoal-600 bg-vx-charcoal-800 p-6 md:p-8"
        >
          <h2 className={`${cardH2} text-vx-cream-50`}>In progress</h2>
          <ul className={`${cardP} list-disc pl-6 text-vx-neutral-400`}>
            <li>
              Pilot campaign with a gaming hardware brand. The idea uses data to answer a question
              gamers already argue about. Stage: discovery. Next step: [Soda to confirm: next step
              and date].
            </li>
          </ul>
          <p className={`${cardP} text-vx-neutral-400`}>
            The brand will be named once it agrees. Last updated [Soda to confirm: date, then update
            monthly].
          </p>
        </section>

        <section
          data-segment="PROOF-03"
          className="rounded-lg border border-vx-charcoal-600 bg-vx-charcoal-700 p-6 md:p-8"
        >
          <h2 className={`${cardH2} text-vx-cream-50`}>Partners we work with</h2>
          <p className={`${cardP} text-vx-neutral-400`}>
            We work with gaming teams, creators and event organisers we have checked ourselves.
            [Soda to confirm: at least three partner names you have permission to show, or how you
            check partners]
          </p>
          <p className={`${cardP} text-vx-neutral-400`}>
            Their past work is theirs, not VEXA&apos;s, and we label it that way.
          </p>
        </section>

        <section
          data-segment="PROOF-04"
          className="rounded-lg border border-vx-peacock-teal/50 bg-vx-charcoal-950 p-6 text-vx-cream-50 md:p-8"
        >
          <h2 className={cardH2}>The founder&apos;s record before VEXA</h2>
          <ul className={`${cardP} list-disc space-y-2 pl-6 text-vx-cream-100/90`}>
            <li>
              Wrote campaign strategy for gaming organisations, under non disclosure agreements.
              [Soda to confirm: years, and any name that can be shown]
            </li>
            <li>
              Worked as paid ground crew on a national energy drink brand&apos;s event campaign with
              a major esports network. [Soda to confirm: year, and whether the brand or network can
              be named]
            </li>
          </ul>
          <p className={`${cardP} text-vx-cream-100/90`}>
            These are Soda&apos;s own experience, not VEXA campaigns.
          </p>
        </section>

        <div data-segment="PROOF-05" className="pt-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-cream-50">
            Start with a small pilot
          </h2>
          <p className="mb-6 mt-4 text-base leading-relaxed text-vx-neutral-400 md:text-lg">
            A pilot is a small first campaign with an agreed KPI, so you can judge the work before
            you commit a bigger budget. [Soda to confirm: pilot size and starting price]
          </p>
          <ButtonLink href="/contact">Send your brief</ButtonLink>
          <p className="mt-4 text-sm text-vx-neutral-400">
            We reply within [Soda to confirm: reply time in working days].
          </p>
        </div>
      </div>
    </div>
  );
}
