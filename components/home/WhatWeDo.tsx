import { Reveal } from "@/components/Reveal";

const BLOCKS = [
  {
    label: "01",
    title: "Sponsorship and brand partnership sales",
    body: "For esports teams, events, creators and films, we sell the sponsorship and brand partnerships. Fee plus commission, so we earn when you close.",
  },
  {
    label: "02",
    title: "Measured pilot campaigns",
    body: "For brands reaching gamers aged 16 to 28, we build a pilot with the KPI, the benchmark and the success criteria written down before you spend.",
  },
  {
    label: "03",
    title: "One discipline, both ways",
    body: "Either way, the numbers get agreed before the work starts, and we report against them when it ends. If gaming is not the right move for you right now, we say so.",
  },
] as const;

export function WhatWeDo(): React.ReactElement {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <Reveal>
        <h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight text-vx-ink-900 md:text-3xl">
          What we actually do
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <article className="rounded-lg border border-vx-neutral-200 bg-vx-white p-6 md:p-8 lg:col-span-4">
            <p className="font-display text-sm font-medium text-vx-accent-600">{BLOCKS[0].label}</p>
            <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-vx-ink-900">
              {BLOCKS[0].title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-vx-neutral-600">{BLOCKS[0].body}</p>
          </article>
          <article className="rounded-lg border border-vx-neutral-200 bg-vx-cream-100 p-6 md:p-8 lg:col-span-4">
            <p className="font-display text-sm font-medium text-vx-accent-600">{BLOCKS[1].label}</p>
            <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-vx-ink-900">
              {BLOCKS[1].title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-vx-neutral-600">{BLOCKS[1].body}</p>
          </article>
          <article className="rounded-lg bg-vx-ink-900 p-6 text-vx-cream-50 md:p-8 lg:col-span-4">
            <p className="font-display text-sm font-medium text-vx-accent-500">{BLOCKS[2].label}</p>
            <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">{BLOCKS[2].title}</h3>
            <p className="mt-3 text-base leading-relaxed text-vx-cream-100/90">{BLOCKS[2].body}</p>
          </article>
        </div>
      </Reveal>
    </section>
  );
}
