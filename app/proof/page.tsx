import type { Metadata } from "next";
import { withShare } from "@/lib/meta";
import { BriefLink } from "@/components/BriefLink";
import { PageIntro } from "@/components/PageIntro";
import { ProofLedger } from "@/components/ProofLedger";
import { QuillRule } from "@/components/QuillRule";
import { bodyClass, h2Class, Section } from "@/components/Section";

export const metadata: Metadata = withShare({
  title: "Track record and current work",
  description: "What VEXA has in progress, the partners it works with, and what its founder did before VEXA.",
  alternates: { canonical: "/proof" },
});

export default function ProofPage(): React.ReactElement {
  return (
    <>
      <PageIntro segment="PROOF-01" label="Proof" title="Our track record so far">
        <p>
          VEXA has not yet run a campaign under its own name. This page shows what is in progress, who we work with, and what
          our founder did before VEXA, with dates where we can share them.
        </p>
      </PageIntro>

      <Section index="01" label="Where we stand" wide>
        <ProofLedger headingLevel={2} />
      </Section>

      <section data-segment="PROOF-05" className="border-t border-vx-hair">
        <div className="vx-container vx-grid py-16 md:py-24 lg:py-32">
          <div className="col-span-full mb-6 lg:col-span-3 lg:mb-0">
            <p className="vx-label flex items-baseline gap-3 text-vx-muted">
              <span className="figure-nums text-vx-peacock-blue">02</span>
              <span>Next step</span>
            </p>
          </div>
          <div className="col-span-full lg:col-span-7 lg:col-start-4">
            <h2 className={h2Class}>Start with a small pilot</h2>
            <p className={`mt-6 ${bodyClass}`}>
              A pilot is a small first campaign with an agreed KPI, so you can judge the work before you commit a bigger
              budget.
            </p>
            <div className="mt-8">
              <BriefLink>Send your brief</BriefLink>
            </div>
          </div>
          <div className="col-span-full mt-12 lg:col-span-7 lg:col-start-4">
            <QuillRule />
          </div>
        </div>
      </section>
    </>
  );
}
