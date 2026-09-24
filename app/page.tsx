import type { Metadata } from "next";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hero } from "@/components/home/Hero";
import { HowPaid } from "@/components/home/HowPaid";
import { ValuateStrip } from "@/components/home/ValuateStrip";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { WhyHard } from "@/components/home/WhyHard";

export const metadata: Metadata = {
  title: { absolute: "Gaming and esports sponsorship in India | VEXA" },
  description:
    "VEXA designs gaming and esports sponsorship campaigns for brands reaching India's 16 to 28 audience, and sells sponsorship for esports teams, events and creators.",
};

export default function HomePage(): React.ReactElement {
  return (
    <>
      <Hero />
      <WhyHard />
      <WhatWeDo />
      <HowPaid />
      <ValuateStrip />
      <ClosingCta />
    </>
  );
}
