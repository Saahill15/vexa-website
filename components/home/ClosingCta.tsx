import { ButtonLink } from "@/components/ButtonLink";
import { Reveal } from "@/components/Reveal";

export function ClosingCta(): React.ReactElement {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <Reveal>
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-vx-ink-900 md:text-4xl">
            Tell us what you are trying to do. We will tell you honestly whether gaming can do it,
            and how we will count it.
          </h2>
          <div className="mt-8">
            <ButtonLink href="/contact">Book a call</ButtonLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
