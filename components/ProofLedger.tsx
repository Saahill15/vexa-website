import { LEDGER, type LedgerRow } from "@/lib/proof";

const STATUS_CLASS: Record<LedgerRow["status"], string> = {
  "In progress": "text-vx-feather-gold-deep",
  Network: "text-vx-peacock-teal-deep",
  "Founder record": "text-vx-peacock-blue",
};

/** A table like ledger of where VEXA stands (DESIGN.md section 6, Proof ledger). Not cards. */
export function ProofLedger({ compact = false, headingLevel = 3 }: { compact?: boolean; headingLevel?: 2 | 3 }): React.ReactElement {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="border-b border-vx-hair">
      <div className="hidden grid-cols-9 gap-x-6 border-b border-vx-ink pb-3 md:grid" aria-hidden="true">
        <p className="vx-label col-span-2 text-vx-muted">Status</p>
        <p className="vx-label col-span-5 text-vx-muted">What</p>
        <p className="vx-label col-span-2 text-vx-muted">Date and source</p>
      </div>
      {LEDGER.map((row) => (
        <article
          key={row.heading}
          data-segment={compact ? undefined : row.segment}
          className="grid grid-cols-1 gap-x-6 gap-y-2 border-t border-vx-hair py-6 first:border-t-0 md:grid-cols-9 md:py-8"
        >
          <p className={`vx-label md:col-span-2 md:pt-1 ${STATUS_CLASS[row.status]}`}>{row.status}</p>
          <div className="md:col-span-5">
            <Heading className={`font-text font-semibold text-vx-ink ${headingLevel === 2 ? "text-h3" : "text-body"}`}>{row.heading}</Heading>
            <div className="mt-2 max-w-body space-y-3 font-text text-body text-vx-ink-2">{compact ? <p>{row.summary}</p> : row.body}</div>
          </div>
          <p className="font-text text-small text-vx-muted md:col-span-2 md:pt-1">{row.meta ?? ""}</p>
        </article>
      ))}
    </div>
  );
}
