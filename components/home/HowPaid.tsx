import { Reveal } from "@/components/Reveal";

export function HowPaid(): React.ReactElement {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-14 md:px-8 md:pb-20">
      <Reveal>
        <div className="rounded-lg border border-vx-neutral-200 bg-vx-white p-6 md:p-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900">
            How we are paid, briefly
          </h2>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            For a rights holder, a team, an event, a creator or a film, we work on a fee plus a
            commission, and the commission only lands when your partner actually closes.
          </p>
          <p className="mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            For a brand, our fee covers strategy, campaign design, choosing partners and reporting,
            agreed as one number before we start. Either way, we open the full breakdown on the
            first real call, line by line, because a number you can see built is a number you can
            defend upward.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
