import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { Reveal } from "@/components/Reveal";

export function Hero(): React.ReactElement {
  return (
    <section
      data-segment="HOME-01"
      className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20"
    >
      <Reveal>
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-semibold tracking-tighter leading-none text-vx-ink-900 md:text-6xl">
            Brands and gaming, matched for results you can measure.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            VEXA Digital is an esports and brand partnerships consultancy. We help brands that are new
            to gaming find where they fit, and we help teams, creators and organisers find the brand
            partners that suit where they are today.
          </p>
          <p
            data-segment="HOME-03"
            className="mt-6 max-w-2xl font-display text-lg font-semibold tracking-tight text-vx-ink-900"
          >
            We promise only what we can count, and we agree the count with you before you spend.
          </p>
          <div data-segment="HOME-02" className="mt-8">
            <div className="flex flex-wrap items-center gap-6">
              <ButtonLink href="/#for-brands">For brands</ButtonLink>
              <ButtonLink href="/#for-teams-and-creators" variant="secondary">
                For gaming teams and creators
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-vx-neutral-600">
              Or{" "}
              <Link
                href="/contact"
                className="font-medium text-vx-accent-600 underline-offset-4 hover:underline"
              >
                send your brief now
              </Link>
              . We reply within [Soda to confirm: reply time in working days].
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
