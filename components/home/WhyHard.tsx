import { Reveal } from "@/components/Reveal";

export function WhyHard(): React.ReactElement {
  return (
    <section className="border-y border-vx-neutral-200 bg-vx-white">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] md:gap-16">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900 md:text-3xl">
              Why gaming is hard to buy into
            </h2>
            <p className="text-base leading-relaxed text-vx-neutral-600 md:text-lg">
              Gaming looks big and confusing from outside, and most of what gets pitched, on either
              side of a deal, leads with a reach number. Views, community size, follower count. None
              of it says whether a KPI was met, or what a sponsorship was actually worth.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
