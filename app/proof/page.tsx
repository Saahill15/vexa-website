import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Proof, What VEXA Has Actually Done",
  description:
    "VEXA is honest about where it stands: work in progress, work done through its vendor network, and a founder with a real track record in gaming.",
};

export default function ProofPage(): React.ReactElement {
  return (
    <div className="pb-20">
      <PageIntro eyebrow="Proof" title="Where we stand right now">
        <p>
          VEXA has not yet closed an independently branded campaign under its own name. We are
          early, and we would rather tell you that than borrow credit that is not ours.
        </p>
      </PageIntro>

      <div className="mx-auto max-w-3xl space-y-10 px-5 md:px-8">
        <section className="rounded-lg border border-vx-neutral-200 bg-vx-white p-6 md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-vx-accent-600">
            In progress
          </p>
          <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-vx-ink-900 md:text-2xl">
            Live work being built
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            We are in early discovery on a pilot with a gaming hardware brand. It is built to
            settle an argument gamers already have with a number instead of an opinion. It is not
            finished, so we are not naming it yet.
          </p>
        </section>

        <section className="rounded-lg border border-vx-neutral-200 bg-vx-cream-100 p-6 md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-vx-accent-600">
            Vendor network
          </p>
          <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-vx-ink-900 md:text-2xl">
            What our vendor network has delivered
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            We work through gaming teams, creators and organisers we already know and have vetted.
            For now, proof sits with their track record, not a campaign VEXA has run and reported
            on alone. We will always tell you which is which.
          </p>
        </section>

        <section className="rounded-lg border border-vx-ink-900 bg-vx-ink-900 p-6 text-vx-cream-50 md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-vx-accent-500">
            Founder record
          </p>
          <h2 className="mt-3 font-display text-xl font-semibold tracking-tight md:text-2xl">
            The founder&apos;s own record
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vx-cream-100/90 md:text-lg">
            Vexa&apos;s founder has personally authored campaign strategy for gaming organisations
            under non disclosure, and worked paid ground crew across a national energy drink
            activation inside a major esports network. Neither is a VEXA delivered case study, and
            we say so plainly.
          </p>
        </section>

        <div className="pt-4">
          <p className="mb-6 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            This is early, honestly. Talk to us about what a first campaign with us would actually
            look like.
          </p>
          <ButtonLink href="/contact">Book a call</ButtonLink>
        </div>
      </div>
    </div>
  );
}
