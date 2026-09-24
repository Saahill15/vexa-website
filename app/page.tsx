import type { Metadata } from "next";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hero } from "@/components/home/Hero";
import { HowPaid } from "@/components/home/HowPaid";
import { ProcessPreview } from "@/components/home/ProcessPreview";
import { ValuateStrip } from "@/components/home/ValuateStrip";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { WhereWeStand } from "@/components/home/WhereWeStand";
import { WhyHard } from "@/components/home/WhyHard";

export const metadata: Metadata = {
  title: { absolute: "Gaming and esports sponsorship in India | VEXA" },
  description:
    "VEXA Digital is an esports and brand partnerships consultancy. We help brands find their fit in gaming, and help teams and creators find the right brand partners.",
  alternates: { canonical: "/" },
};

export default function HomePage(): React.ReactElement {
  return (
    <>
      <Hero />
      <WhyHard />
      <WhatWeDo />
      <WhereWeStand />
      <ProcessPreview />
      {/* Costs and Valuate swap for teams and creators (see globals.css, audience switch). */}
      <div className="flex flex-col">
        <HowPaid />
        <ValuateStrip />
      </div>
      <ClosingCta />
    </>
  );
}
