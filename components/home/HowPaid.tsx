import { Reveal } from "@/components/Reveal";

const ROWS = [
  {
    who: "A brand",
    pay: "One agreed fee for strategy, campaign design, choosing partners and reporting. Starts at [Soda to confirm: starting band].",
    when: "[Soda to confirm: payment schedule]",
  },
  {
    who: "A team, event or creator",
    pay: "A fee of [Soda to confirm: amount] plus a commission of [Soda to confirm: range], paid by [Soda to confirm: who pays the commission].",
    when: "The commission is due only when the deal closes, which means [Soda to confirm: contract signed, first invoice or cash received].",
  },
] as const;

export function HowPaid(): React.ReactElement {
  return (
    <section
      data-segment="HOME-06"
      id="costs"
      className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-14 md:px-8 md:pb-20"
    >
      <Reveal>
        <div className="rounded-lg border border-vx-neutral-200 bg-vx-white p-6 md:p-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-vx-ink-900">
            What it costs
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-base leading-relaxed text-vx-neutral-600">
              <thead>
                <tr className="border-b border-vx-neutral-200 text-sm text-vx-ink-900">
                  <th scope="col" className="py-2 pr-4 font-medium">You are</th>
                  <th scope="col" className="py-2 pr-4 font-medium">You pay</th>
                  <th scope="col" className="py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.who} className="border-b border-vx-neutral-200 align-top last:border-0">
                    <th scope="row" className="py-3 pr-4 font-medium text-vx-ink-900">{row.who}</th>
                    <td className="py-3 pr-4">{row.pay}</td>
                    <td className="py-3">{row.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-base leading-relaxed text-vx-neutral-600 md:text-lg">
            On the first call we show you the full breakdown, line by line, so you get a number you
            can defend upward.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
