import { ButtonLink } from "@/components/ButtonLink";
import { Reveal } from "@/components/Reveal";

export function ClosingCta(): React.ReactElement {
  return (
    <section
      data-segment="HOME-09"
      className="px-5 py-16 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl rounded-lg border border-vx-peacock-teal/60 px-6 py-12 shadow-[0_0_36px_-10px_rgba(15,123,108,0.55)] md:px-12 md:py-16">
      <Reveal>
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-vx-cream-50 md:text-4xl">
            Tell us what you want gaming to do for your business. We will tell you if it can, and
            how we will count it.
          </h2>
          <div className="mt-8">
            <ButtonLink href="/contact">Send your brief</ButtonLink>
          </div>
          <p className="mt-4 text-sm text-vx-neutral-200">
            We reply within [Soda to confirm: reply time in working days].
          </p>
        </div>
      </Reveal>
      </div>
    </section>
  );
}
