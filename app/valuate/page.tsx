import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Valuate, check if a creator deal is fair",
  description:
    "Valuate is a separate, free product from VEXA. It helps a creator or a brand see a fair price for a paid post before anyone signs.",
};

const body = "mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg";

export default function ValuatePage(): React.ReactElement {
  return (
    <div className="pb-20">
      <header data-segment="VAL-01" className="mx-auto max-w-3xl px-5 pb-8 pt-14 md:px-8 md:pt-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-vx-ink-900 md:text-5xl">
          Valuate checks if a creator deal is fair
        </h1>
        <p className="mt-6 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
          Valuate is a separate, free product from VEXA. It helps a creator or a brand see a fair
          price for a paid post before anyone signs.
        </p>
        <p className={body}>
          You enter the creator&apos;s followers, typical views and the offer on the table. Valuate
          shows a fair price range and where the offer sits in it.
        </p>
        <p className={body}>
          [Soda to confirm: Valuate is free, and these are its inputs and outputs at launch]
        </p>
      </header>

      <div className="mx-auto max-w-3xl space-y-12 px-5 md:px-8">
        <section data-segment="VAL-03">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900">
            Why we built it
          </h2>
          <p className={body}>
            We work with brands and with creators. Both kept asking us whether an offer was fair
            before they signed.
          </p>
          <p className={body}>
            Valuate gives a quick answer based on [Soda to confirm: data source, sample size and
            update date].
          </p>
        </section>
        <div data-segment="VAL-04">
          <p className="font-display text-lg font-semibold tracking-tight text-vx-ink-900">
            Valuate opens on [Soda to confirm: launch date]
          </p>
        </div>
      </div>
    </div>
  );
}
