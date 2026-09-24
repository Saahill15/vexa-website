import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "How VEXA Works, Campaign Method and Process",
  description:
    "The order VEXA runs a campaign in: business problem, consumer behaviour, gaming relevance, mechanism, activation, measured outcome, decision, cost last.",
};

const ORDER = [
  "Business problem",
  "Consumer behaviour",
  "Gaming relevance",
  "The commercial mechanism",
  "The activation itself",
  "The measured outcome",
  "The business decision it supports",
  "Cost last",
] as const;

export default function HowWeWorkPage(): React.ReactElement {
  return (
    <div className="pb-20">
      <PageIntro eyebrow="Method" title="How we work">
        <p>
          A brand usually asks us how to sell more. That is not quite the right question. The real
          question is which moment is actually yours, because you cannot win on price and you cannot
          win on taste alone. You compete on moments.
        </p>
      </PageIntro>

      <section className="mx-auto max-w-3xl px-5 md:px-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900">
          The order we work in
        </h2>
        <ol className="relative mt-8 space-y-0 border-l border-vx-neutral-200 pl-8">
          {ORDER.map((step, index) => (
            <li key={step} className="relative pb-8 last:pb-0">
              <span className="absolute -left-[2.55rem] flex h-7 w-7 items-center justify-center rounded-full border border-vx-neutral-200 bg-vx-cream-50 font-display text-xs font-semibold text-vx-accent-600">
                {index + 1}
              </span>
              <p className="pt-0.5 font-display text-lg font-semibold tracking-tight text-vx-ink-900">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-16 max-w-3xl space-y-12 px-5 md:px-8">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900">
            Two ways we work
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            If you run a gaming or youth rights holder, a team, an event, a creator business or a
            film, we sell your sponsorship and brand partnerships. We work on a fee plus a
            commission, and the commission only lands when a partner actually closes.
          </p>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            If you are a brand trying to reach gamers aged 16 to 28, we build a measured pilot
            campaign. The KPI, the benchmark and the success criteria are agreed before you spend
            anything.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900">
            How the KPI gets set
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            We do not wait for you to hand us a number. If you already have a KPI, we test our plan
            against it. If you do not, we tell you what benchmark we believe gets you the outcome
            you want, and we size the spend to make it realistically reachable. Either way, the
            success criteria exist before launch, agreed jointly, so nothing gets judged later
            against a number nobody agreed to.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900">
            What we will tell you no on
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            We have told a brand their product was not ready to compete in the segment they wanted,
            and belonged somewhere else in the market instead. We have told a rights holder that
            brands sponsor what already exists, not what is still being built. We would rather lose
            the deal than sell you something we cannot defend later.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900">
            What happens if a campaign is off benchmark
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            If we see a campaign tracking below the KPI we agreed, we tell you the day we know it,
            recommend against pushing further spend, and take two days to bring you a fix.
          </p>
        </div>

        <div className="pt-4">
          <ButtonLink href="/contact">See what a first call looks like</ButtonLink>
        </div>
      </section>
    </div>
  );
}
