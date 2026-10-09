import { ButtonLink } from "@/components/ButtonLink";
import { ValuateDemo } from "@/components/home/ValuateDemo";

export function ValuateStrip(): React.ReactElement {
  const preview = process.env.VEXA_PREVIEW === "1";
  return <section id="valuate" className="home-product" aria-labelledby="home-valuate-title">
    <div className="vx-container product-composition">
      <div className="product-story">
        <p className="vx-label">Meet Valuate</p>
        <h2 id="home-valuate-title">Estimate your<br />brand quote.</h2>
        <p>Valuate helps creators estimate a quote for a sponsored post. The work, audience input and calculation assumptions sit beside the indicative range.</p>
        <p className="product-status">{preview ? "Explore the free working preview on this Mac." : "Use the free creator estimate in Valuate."} An indicative range is a starting point for discussion, not a guaranteed price.</p>
        <ButtonLink href="/valuate" variant="text">Get to know Valuate</ButtonLink>
      </div>
      <ValuateDemo available={true} href={preview ? "http://127.0.0.1:3400" : "https://valuate.vexadigital.in"} />
    </div>
  </section>;
}
