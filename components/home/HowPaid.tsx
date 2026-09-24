import { ButtonLink } from "@/components/ButtonLink";
import { bodyClass, h2Class, h3Class, Section } from "@/components/Section";
import { COSTS, COSTS_CONFIRMED, formatINR } from "@/lib/costs";

const COLUMNS = [
  {
    key: "holders" as const,
    who: "A team, event or creator",
    pay: "A fee plus a commission.",
    when: "The commission is due only when the deal closes.",
  },
  {
    key: "brands" as const,
    who: "A brand",
    pay: "One agreed fee for strategy, campaign design, choosing partners and reporting.",
    when: "Agreed as one number before we start.",
  },
];

function FromPrice({ value }: { value: number | null }): React.ReactElement | null {
  if (!COSTS_CONFIRMED || value === null) return null;
  return (
    <p className="mt-4 font-text text-small text-vx-muted">
      From <span className="font-text text-h3 font-semibold text-vx-ink">₹{formatINR(value)}</span>
    </p>
  );
}

export function HowPaid(): React.ReactElement {
  return (
    <Section
      segment="HOME-06"
      id="costs"
      tone="stone"
      label="Costs"
      index={
        <>
          <span className="idx-default">05</span>
          <span className="idx-holders">06</span>
        </>
      }
    >
      <h2 className={h2Class}>What it costs</h2>
      <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-6">
        {COLUMNS.map((column) => (
          <div key={column.key} className="border-t border-vx-ink pt-5">
            <h3 className="vx-label text-vx-muted">{column.who}</h3>
            <p className={`mt-3 ${h3Class}`}>{column.pay}</p>
            <p className={`mt-3 ${bodyClass}`}>{column.when}</p>
            <FromPrice value={COSTS[column.key].from} />
          </div>
        ))}
      </div>
      <p className={`mt-10 ${bodyClass}`}>
        On the first call we show you the full breakdown, line by line, so you get a number you can defend upward.
      </p>
      <ButtonLink href="/contact" variant="text" className="mt-4">
        Ask for the breakdown on a first call
      </ButtonLink>
    </Section>
  );
}
