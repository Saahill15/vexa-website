import { ButtonLink } from "@/components/ButtonLink";

export function ValuateStrip(): React.ReactElement {
  return (
    <section data-segment="HOME-07" className="border-y border-vx-charcoal-600 bg-vx-charcoal-900">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <div>
          <h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight text-vx-cream-50 md:text-3xl">
            Check if a creator deal is fair before you sign
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-vx-neutral-400">
            Valuate is a separate, free product from VEXA. Enter a creator&apos;s followers, typical
            views and the offer on the table, and it shows a fair price range and where the offer
            sits in it. [Soda to confirm: Valuate is free, and these are its inputs and outputs at
            launch]
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <ButtonLink href="/valuate">Open Valuate</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
