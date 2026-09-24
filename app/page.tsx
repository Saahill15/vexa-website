import type { Metadata } from "next";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hero } from "@/components/home/Hero";
import { HowPaid } from "@/components/home/HowPaid";
import { ValuateStrip } from "@/components/home/ValuateStrip";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { WhyHard } from "@/components/home/WhyHard";

export const metadata: Metadata = {
  title: "VEXA Digital, Brand Partnerships for Gaming in India",
  description:
    "VEXA sells sponsorship for gaming and youth rights holders, and runs measured pilot campaigns for brands reaching gamers aged 16 to 28.",
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
