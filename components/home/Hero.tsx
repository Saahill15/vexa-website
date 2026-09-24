import { ButtonLink } from "@/components/ButtonLink";
import { Reveal } from "@/components/Reveal";

export function Hero(): React.ReactElement {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20">
      <Reveal>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:items-end lg:gap-16">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-vx-accent-600">
              Brand partnerships for gaming
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tighter leading-none text-vx-ink-900 md:text-6xl">
              We sell sponsorship for gaming and youth rights holders. We run measured pilot
              campaigns for brands who want their audience.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-vx-neutral-600 md:text-lg">
              If you run a team, an event, a creator business or a film, we sell your sponsorship
              and take a fee plus a commission when a partner closes. If you are a brand chasing
              gamers aged 16 to 28, we build a pilot with the KPI agreed before you spend.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <ButtonLink href="/contact">Book a call</ButtonLink>
              <ButtonLink href="/how-we-work" variant="secondary">
                See how we work
              </ButtonLink>
            </div>
          </div>
          <aside className="hidden max-w-xs border-l border-vx-neutral-200 pl-6 lg:block">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-vx-neutral-400">
              How we work
            </p>
            <p className="mt-3 font-display text-lg font-semibold tracking-tight text-vx-ink-900">
              Commission only when you close. KPI agreed before a brand spends.
            </p>
          </aside>
        </div>
      </Reveal>
    </section>
  );
}
