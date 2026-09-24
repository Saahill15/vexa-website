import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { ValuateSample } from "@/components/ValuateSample";

export function ValuateStrip(): React.ReactElement {
  return (
    <section className="border-y border-vx-neutral-200 bg-vx-cream-50">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:px-8 md:py-16">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-vx-accent-600">VEXA Valuate, free tool</p>
          <h2 className="mt-6 max-w-xl font-display text-2xl font-semibold tracking-tight text-vx-ink-900 md:text-3xl">
            Valuate checks a deal for a creator or a brand before anyone signs.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-vx-neutral-600">
            Free. One number to ask for, a band from real views, and a plain read on where a small
            account actually is.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <ButtonLink href="/valuate">See Valuate</ButtonLink>
            <Link
              href="https://valuate.vexadigital.in"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-sm font-medium text-vx-ink-900 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500"
            >
              Open the tool
            </Link>
          </div>
        </div>
        <Link
          href="/valuate"
          className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500"
        >
          <ValuateSample compact />
        </Link>
      </div>
    </section>
  );
}
