import type { Metadata } from "next";
import { withShare } from "@/lib/meta";
import { BriefLink } from "@/components/BriefLink";
import { PageIntro } from "@/components/PageIntro";
import { ProcessAccordion } from "@/components/ProcessAccordion";
import { QuillRule } from "@/components/QuillRule";
import { bodyClass, h2Class, h3Class, Section } from "@/components/Section";
import { STEPS } from "@/lib/process";

export const metadata: Metadata = withShare({
  title: "How a gaming sponsorship campaign works",
  description:
    "What happens, step by step, when VEXA runs a gaming sponsorship campaign: brief, audience fit, partners and price, negotiation, contract and payment, campaign and report.",
  alternates: { canonical: "/how-we-work" },
});

const UNDER_18 = [
  "no tracking, behavioural monitoring or targeted advertising aimed at them",
  "verifiable parental consent before any sign up, quiz or giveaway collects their data",
  "an age gate wherever a campaign asks people to sign up",
] as const;

export default function HowWeWorkPage(): React.ReactElement {
  return (
    <>
      <PageIntro segment="HOW-01" label="Method" title="How a gaming sponsorship campaign works">
        <p>
          You tell us the business result you need. We find a moment your audience already cares about, such as a tournament
          final or a game launch, and build the campaign around it.
        </p>
        <p>You see the KPI, the plan and the cost before you spend anything.</p>
      </PageIntro>

      <Section segment="HOW-02" index="01" label="The order">
        <h2 className={h2Class}>What happens, step by step</h2>
        <div className="mt-8">
          <ProcessAccordion steps={STEPS} />
        </div>
        <div className={`mt-10 vx-body ${bodyClass}`}>
          <p>We set the price last, once the plan and the KPI are clear, so the budget matches what the KPI needs.</p>
          <p>
            For teams, events and creators, we run steps 3 to 5 from your side. We price what you offer, find brands that fit
            and negotiate the deal.
          </p>
        </div>
      </Section>

      <Section segment="HOW-03" id="two-ways" index="02" label="Two ways" wide>
        <h2 className={h2Class}>Two ways to work with us</h2>
        <div className="doors mt-10">
          <div className="door-brands border-t-2 border-vx-peacock-blue pt-6">
            <h3 className={h3Class}>If you are a brand</h3>
            <p className={`mt-4 ${bodyClass}`}>
              We build a pilot campaign that reaches gamers aged 16 to 28. The KPI, the benchmark and the success criteria are
              agreed in writing before you spend.
            </p>
          </div>
          <div className="door-holders border-t-2 border-vx-peacock-teal pt-6">
            <h3 className={h3Class}>If you run a team, event or channel</h3>
            <p className={`mt-4 ${bodyClass}`}>
              We sell your sponsorship to brands that fit. You pay a fee, plus a commission only when a deal closes.
            </p>
          </div>
        </div>
        <div className="mt-14 max-w-body border-l-2 border-vx-peacock-blue pl-6">
          <h3 className={h3Class}>Campaigns that may reach under 18s</h3>
          <p className={`mt-4 ${bodyClass}`}>Our audience includes 16 and 17 year olds. For any campaign that could reach them:</p>
          <ul className={`mt-3 list-disc space-y-2 pl-5 ${bodyClass}`}>
            {UNDER_18.map((item) => (
              <li key={item} data-counsel="true">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section segment="HOW-04" index="03" label="The KPI" wide>
        <h2 className={h2Class}>How the KPI is set</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-6">
          <div className="border-t border-vx-ink pt-5">
            <h3 className="vx-label text-vx-muted">You have a KPI</h3>
            <p className={`mt-3 ${bodyClass}`}>If you already have a KPI, we test the plan against it.</p>
          </div>
          <div className="border-t border-vx-ink pt-5">
            <h3 className="vx-label text-vx-muted">You do not have one yet</h3>
            <p className={`mt-3 ${bodyClass}`}>
              If you do not, we propose a benchmark, meaning the result a campaign like yours should reach, and size the budget
              so the KPI is realistic.
            </p>
          </div>
        </div>
        <p className={`mt-10 ${bodyClass}`}>
          You sign off the KPI, the benchmark and the success criteria before launch. The campaign is judged only against
          those.
        </p>
      </Section>

      <Section segment="HOW-05" index="04" label="Saying no">
        <h2 className={h2Class}>When we will say no</h2>
        <p className={`mt-6 ${bodyClass}`}>In discovery conversations:</p>
        <div className="mt-6 space-y-6">
          <p className="max-w-[32ch] font-display text-quote italic text-vx-ink">
            We have told a brand that its product was not ready for the segment it wanted.
          </p>
          <p className="max-w-[32ch] font-display text-quote italic text-vx-ink">
            We have told a team owner that brands pay for an audience that already exists.
          </p>
        </div>
        <p className={`mt-8 ${bodyClass}`}>If gaming will not get you the result you need, we will tell you before you spend.</p>
      </Section>

      <Section segment="HOW-06" index="05" label="Off benchmark">
        <h2 className={h2Class}>If a campaign tracks below the benchmark</h2>
        <div className="mt-10 grid grid-cols-1 border-y border-vx-ink sm:grid-cols-2">
          <div className="py-6 sm:border-r sm:border-vx-hair sm:pr-6">
            <p className="figure-nums font-display text-[clamp(2.5rem,1.6rem+2.4vw,3.75rem)] leading-none font-medium whitespace-nowrap text-vx-ink">Same day</p>
            <p className={`mt-4 ${bodyClass}`}>We tell you the same day we see it. We advise you not to add spend.</p>
          </div>
          <div className="border-t border-vx-hair py-6 sm:border-t-0 sm:pl-6">
            <p className="figure-nums font-display text-[clamp(2.5rem,1.6rem+2.4vw,3.75rem)] leading-none font-medium text-vx-ink">
              <span className="border-b-2 border-vx-feather-gold">2 days</span>
            </p>
            <p className={`mt-4 ${bodyClass}`}>Within two days, we bring you a plan to fix it.</p>
          </div>
        </div>
      </Section>

      <section data-segment="HOW-07" className="border-t border-vx-hair">
        <div className="vx-container vx-grid py-16 md:py-24 lg:py-32">
          <div className="col-span-full lg:col-span-7 lg:col-start-4">
            <p className="max-w-[40ch] font-text text-lead text-vx-ink-2">
              The first call is not a pitch, and we propose nothing until we have spent three to four days on your business.
            </p>
            <div className="mt-8">
              <BriefLink>Send your brief</BriefLink>
            </div>
          </div>
          <div className="col-span-full mt-12 lg:col-span-7 lg:col-start-4">
            <QuillRule />
          </div>
        </div>
      </section>
    </>
  );
}
