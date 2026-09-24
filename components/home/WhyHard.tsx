import { Reveal } from "@/components/Reveal";

export function WhyHard(): React.ReactElement {
  return (
    <section data-segment="HOME-04" className="border-y border-vx-peacock-teal/50 bg-vx-charcoal-950">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] md:gap-16">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-cream-50 md:text-3xl">
              Your logo on a jersey is not a campaign
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-vx-neutral-200 md:text-lg">
              <p>
                Most gaming pitches lead with reach, meaning views, followers and community size.
                None of those numbers tells you whether people signed up, bought or even noticed
                your brand.
              </p>
              <p>
                [Soda to confirm: one real scene from a deal you have seen, told without naming the
                brand]
              </p>
              <p>
                India has 555 million gamers, according to Lumikai [Soda to confirm: report title
                and year]. We help you choose the part of that audience that fits your product, and
                agree how results will be counted before you spend.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
