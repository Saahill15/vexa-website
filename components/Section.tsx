type Props = {
  label: string;
  index?: React.ReactNode;
  id?: string;
  segment?: string;
  tone?: "paper" | "stone";
  wide?: boolean;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/**
 * The asymmetric editorial section (DESIGN.md section 5): a sticky rail in columns 1 to 3 holding
 * the section label, the content in columns 4 to 10 (or 4 to 12 when wide), and an optional margin
 * note in columns 11 and 12. On phones the rail becomes a label above the content.
 */
export function Section({ label, index, id, segment, tone = "paper", wide = false, aside, className = "", children }: Props): React.ReactElement {
  return (
    <section
      id={id}
      data-segment={segment}
      className={`scroll-mt-20 border-t ${tone === "stone" ? "border-vx-hair bg-vx-stone" : "border-vx-hair"} ${className}`}
    >
      <div className="vx-container vx-grid py-16 md:py-24 lg:py-32">
        <div className="col-span-full mb-6 lg:col-span-3 lg:mb-0">
          <p className="vx-label flex items-baseline gap-3 text-vx-muted lg:sticky lg:top-24">
            {index ? <span className="figure-nums text-vx-peacock-blue">{index}</span> : null}
            <span>{label}</span>
          </p>
        </div>
        <div className={`col-span-full ${wide ? "lg:col-span-9 lg:col-start-4" : "lg:col-span-7 lg:col-start-4"}`}>{children}</div>
        {aside ? <div className="col-span-full mt-12 lg:col-span-2 lg:col-start-11 lg:mt-0">{aside}</div> : null}
      </div>
    </section>
  );
}

export const h2Class = "max-w-[28ch] font-display text-display-l font-normal text-vx-ink";
export const h3Class = "max-w-[40ch] font-text text-h3 font-semibold text-vx-ink";
export const bodyClass = "max-w-body font-text text-body text-vx-ink-2";
export const leadClass = "max-w-[56ch] font-text text-lead text-vx-ink-2";
