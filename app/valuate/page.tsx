import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { ValuateSample } from "@/components/ValuateSample";

export const metadata: Metadata = {
  title: "VEXA Valuate, Know If a Brand Deal Is Fair",
  description:
    "A free tool from VEXA. A creator or a brand checks whether a deal is lowball, fair, or premium before anyone signs.",
};

export default function ValuatePage(): React.ReactElement {
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-3xl px-5 pb-8 pt-14 md:px-8 md:pt-20">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-vx-accent-600">Free tool</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-vx-ink-900 md:text-5xl">VEXA Valuate</h1>
        <p className="mt-6 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
          A free check for a creator or a brand. Tell it the deal, and it shows one number to ask
          for, the band your views support, and where a small account actually sits.
        </p>
      </header>

      <div className="mx-auto max-w-3xl space-y-12 px-5 md:px-8">
        <ValuateSample />
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900">
            Why VEXA built it
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            We sit on both sides of a brand deal, the brand&apos;s side and the gaming side, and we
            kept seeing the same problem: no honest, fast way to check whether an offer was fair
            before signing it. Valuate is that check.
          </p>
          <div className="mt-8">
            <ButtonLink href="https://valuate.vexadigital.in" external>
              Open Valuate
            </ButtonLink>
          </div>
        </section>
      </div>
    </div>
  );
}
