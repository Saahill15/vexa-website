import { Reveal } from "@/components/Reveal";

export function WhatWeDo(): React.ReactElement {
  return (
    <section data-segment="HOME-05" id="what-we-do" className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <Reveal>
        <h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight text-vx-ink-900 md:text-3xl">
          What we do
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article
            id="for-brands"
            className="scroll-mt-24 rounded-lg border border-vx-neutral-200 bg-vx-white p-6 md:p-8"
          >
            <h3 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
              Sponsorship campaigns for brands
            </h3>
            <p className="mt-3 text-base leading-relaxed text-vx-neutral-600">
              For brands reaching gamers aged 16 to 28. We plan the campaign, choose the teams,
              events or creators, and report against the KPI. Pilots run [Soda to confirm: typical
              length] and start from [Soda to confirm: starting fee]. Example KPI: app installs.
            </p>
          </article>
          <article
            id="for-teams-and-creators"
            className="scroll-mt-24 rounded-lg border border-vx-neutral-200 bg-vx-cream-100 p-6 md:p-8"
          >
            <h3 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
              Sponsorship sales for teams, events and creators
            </h3>
            <p className="mt-3 text-base leading-relaxed text-vx-neutral-600">
              For esports teams, tournaments and gaming creators. We find brands that fit, sell them
              your sponsorship and negotiate the deal. You pay a fee of [Soda to confirm: amount]
              plus a commission of [Soda to confirm: range] when the deal closes.
            </p>
          </article>
        </div>
        <p className="mt-8 max-w-3xl text-base leading-relaxed text-vx-neutral-600 md:text-lg">
          Either way, you agree the numbers before work starts, and we report against them when it
          ends. If gaming is the wrong move for you, we will say so.
        </p>
      </Reveal>
    </section>
  );
}
