import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "How a gaming sponsorship campaign works",
  description:
    "What happens, step by step, when VEXA runs a gaming sponsorship campaign: brief, audience fit, partners and price, negotiation, contract and payment, campaign and report.",
};

const STEPS = [
  {
    title: "Brief",
    body: "You tell us your product, your audience and the business result you need. You receive a short written summary to confirm we understood. Timing: [Soda to confirm: typical time].",
  },
  {
    title: "Audience fit",
    body: "We check whether gamers aged 16 to 28 can deliver that result. If they cannot, we tell you before you spend anything.",
  },
  {
    title: "Partners and price",
    body: "We shortlist teams, events or creators and price what each one offers, such as jersey placement, stream mentions or videos. You receive the shortlist with a proposed KPI, benchmark and success criteria. Timing: [Soda to confirm: typical time].",
  },
  {
    title: "Negotiation",
    body: "We agree deliverables, dates and price with each partner for you. Timing: [Soda to confirm: typical time].",
  },
  {
    title: "Contract and payment",
    body: "The contracts are signed and payments follow an agreed schedule. [Soda to confirm: which party signs each contract, and the payment schedule]",
  },
  {
    title: "Campaign and report",
    body: "The campaign runs and we track it against the KPI. You receive [Soda to confirm: update format and how often], then a final report with a recommendation for your next decision.",
  },
] as const;

const UNDER_18 = [
  "no tracking, behavioural monitoring or targeted advertising aimed at them",
  "verifiable parental consent before any sign up, quiz or giveaway collects their data",
  "an age gate wherever a campaign asks people to sign up",
] as const;

const h2 = "font-display text-2xl font-semibold tracking-tight text-vx-ink-900";
const h3 = "font-display text-lg font-semibold tracking-tight text-vx-ink-900";
const body = "mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg";

export default function HowWeWorkPage(): React.ReactElement {
  return (
    <div className="pb-20">
      <PageIntro segment="HOW-01" title="How a gaming sponsorship campaign works">
        <p>
          You tell us the business result you need. We find a moment your audience already cares
          about, such as a tournament final or a game launch, and build the campaign around it.
        </p>
        <p>You see the KPI, the plan and the cost before you spend anything.</p>
      </PageIntro>

      <section data-segment="HOW-02" className="mx-auto max-w-3xl px-5 md:px-8">
        <h2 className={h2}>What happens, step by step</h2>
        <ol className="relative mt-8 space-y-0 border-l border-vx-neutral-200 pl-8">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative pb-8 last:pb-0">
              <span className="absolute -left-[2.55rem] flex h-7 w-7 items-center justify-center rounded-full border border-vx-neutral-200 bg-vx-cream-50 font-display text-xs font-semibold text-vx-accent-600">
                {index + 1}
              </span>
              <h3 className={`pt-0.5 ${h3}`}>{step.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-vx-neutral-600">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className={`mt-8 ${body.replace("mt-4 ", "")}`}>
          We set the price last, once the plan and the KPI are clear, so the budget matches what the
          KPI needs.
        </p>
        <p className={body}>
          For teams, events and creators, we run steps 3 to 5 from your side. We price what you
          offer, find brands that fit and negotiate the deal.
        </p>
      </section>

      <section className="mx-auto mt-16 max-w-3xl space-y-12 px-5 md:px-8">
        <div data-segment="HOW-03">
          <h2 className={h2}>Two ways to work with us</h2>
          <h3 className={`mt-6 ${h3}`}>If you are a brand</h3>
          <p className={body}>
            We build a pilot campaign that reaches gamers aged 16 to 28. The KPI, the benchmark and
            the success criteria are agreed in writing before you spend.
          </p>
          <h3 className={`mt-6 ${h3}`}>If you run a team, event or channel</h3>
          <p className={body}>
            We sell your sponsorship to brands that fit. You pay a fee, plus a commission only when a
            deal closes.
          </p>
          <h3 className={`mt-6 ${h3}`}>Campaigns that may reach under 18s</h3>
          <p className={body}>
            Our audience includes 16 and 17 year olds. For any campaign that could reach them:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            {UNDER_18.map((item) => (
              <li key={item} data-counsel="true">
                {item}
              </li>
            ))}
          </ul>
          <p className={body}>
            [Soda to confirm: what campaigns do today about age gates, giveaways, sign ups and
            platform targeting]
          </p>
        </div>

        <div data-segment="HOW-04">
          <h2 className={h2}>How the KPI is set</h2>
          <p className={body}>
            If you already have a KPI, we test the plan against it. If you do not, we propose a
            benchmark, meaning the result a campaign like yours should reach, and size the budget so
            the KPI is realistic.
          </p>
          <p className={body}>
            You sign off the KPI, the benchmark and the success criteria before launch. The campaign
            is judged only against those.
          </p>
        </div>

        <div data-segment="HOW-05">
          <h2 className={h2}>When we will say no</h2>
          <p className={body}>
            In discovery conversations, we have told a brand that its product was not ready for the
            segment it wanted. We have told a team owner that brands pay for an audience that already
            exists. [Soda to confirm: these were discovery conversations, not closed campaigns]
          </p>
          <p className={body}>
            If gaming will not get you the result you need, we will tell you before you spend.
          </p>
        </div>

        <div data-segment="HOW-06">
          <h2 className={h2}>If a campaign tracks below the benchmark</h2>
          <p className={body}>
            We tell you the same day we see it. We advise you not to add spend. Within two days, we
            bring you a plan to fix it.
          </p>
        </div>

        <div data-segment="HOW-07" className="pt-4">
          <ButtonLink href="/contact">Send your brief</ButtonLink>
          <p className="mt-4 text-sm text-vx-neutral-600">
            We reply within [Soda to confirm: reply time in working days]. The first call is not a
            pitch, and we propose nothing until we have spent three to four days on your business.
          </p>
        </div>
      </section>
    </div>
  );
}
