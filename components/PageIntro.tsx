import { leadClass } from "@/components/Section";

type Props = {
  label: string;
  title: string;
  children?: React.ReactNode;
  segment?: string;
  after?: React.ReactNode;
};

/** Page opening: rail label, the one H1, and the lead paragraphs in the text span. */
export function PageIntro({ label, title, children, segment, after }: Props): React.ReactElement {
  return (
    <header data-segment={segment} className="vx-container vx-grid pb-16 pt-12 md:pb-24 md:pt-20 lg:pt-28">
      <div className="col-span-full mb-6 lg:col-span-3 lg:mb-0">
        <p className="vx-label pt-1 text-vx-muted lg:pt-4">{label}</p>
      </div>
      <div className="col-span-full lg:col-span-7 lg:col-start-4">
        <h1 className="max-w-[24ch] font-display text-display-xl font-normal text-vx-ink">{title}</h1>
        {children ? <div className={`mt-8 space-y-5 ${leadClass}`}>{children}</div> : null}
        {after}
      </div>
    </header>
  );
}
