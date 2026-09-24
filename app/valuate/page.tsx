import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { QuillRule } from "@/components/QuillRule";
import { bodyClass, h2Class, Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Valuate, check if a creator deal is fair",
  description:
    "Valuate is a separate, free product from VEXA. It helps a creator or a brand see a fair price for a paid post before anyone signs.",
  alternates: { canonical: "/valuate" },
};

// Set to true once the Valuate subdomain responds, and fill VALUATE_URL.
const VALUATE_LIVE = false;
const VALUATE_URL = "";

export default function ValuatePage(): React.ReactElement {
  return (
    <>
      <PageIntro segment="VAL-01" label="Valuate" title="Valuate checks if a creator deal is fair">
        <p>
          Valuate is a separate, free product from VEXA. It helps a creator or a brand see a fair price for a paid post before
          anyone signs.
        </p>
        <p>
          You enter the creator&apos;s followers, typical views and the offer on the table. Valuate shows a fair price range and
          where the offer sits in it.
        </p>
      </PageIntro>

      <Section segment="VAL-03" index="01" label="Why">
        <h2 className={h2Class}>Why we built it</h2>
        <p className={`mt-6 ${bodyClass}`}>
          We work with brands and with creators. Both kept asking us whether an offer was fair before they signed.
        </p>
      </Section>

      <section data-segment="VAL-04" className="border-t border-vx-hair">
        <div className="vx-container vx-grid py-16 md:py-24 lg:py-32">
          <div className="col-span-full lg:col-span-7 lg:col-start-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {VALUATE_LIVE ? (
                <a
                  href={VALUATE_URL}
                  className="inline-flex min-h-[48px] items-center rounded-sm border border-vx-accent-deep bg-vx-accent-500 px-6 font-text text-body font-medium text-vx-ink hover:bg-vx-accent-600"
                >
                  Open Valuate
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className="inline-flex min-h-[48px] cursor-not-allowed items-center rounded-sm border border-vx-muted px-6 font-text text-body font-medium text-vx-muted"
                >
                  Opening soon
                </span>
              )}
              <Link href="/contact?for=holders" className="vx-link inline-flex min-h-[44px] items-center font-text text-body font-medium">
                Ask us about a deal now
              </Link>
            </div>
          </div>
          <div className="col-span-full mt-16 lg:col-span-9 lg:col-start-4">
            <QuillRule />
          </div>
        </div>
      </section>
    </>
  );
}
