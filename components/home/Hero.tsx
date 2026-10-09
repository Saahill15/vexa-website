import Image from "next/image";
import { Arrow, ButtonLink } from "@/components/ButtonLink";

export function Hero(): React.ReactElement {
  return <section className="hero-stage" data-segment="HOME-01">
    <div className="hero-world" aria-hidden="true">
      <Image src="/brand/gaming-world-v1.png" width={1536} height={1024} priority sizes="100vw" alt="" />
    </div>
    <div className="vx-container hero-stage-content">
      <div className="hero-stage-copy">
        <p className="vx-label hero-eyebrow">Gaming marketing &amp; partnerships</p>
        <h1>We bring brands<br />into gaming.</h1>
        <p>VEXA develops campaigns with gaming creators, esports teams and tournament partners. We shape the idea, bring the right people together and coordinate delivery.</p>
        <div className="hero-actions">
          <ButtonLink href="/brands">Plan a gaming campaign <Arrow /></ButtonLink>
          <ButtonLink href="/learn" variant="text">Explore our articles</ButtonLink>
        </div>
      </div>
      <div className="hero-stage-bottom">
        <a href="#valuate">Meet Valuate <span aria-hidden="true">↓</span></a>
      </div>
    </div>
  </section>;
}
