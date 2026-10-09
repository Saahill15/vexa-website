import { Arrow, ButtonLink } from "@/components/ButtonLink";

export function ClosingCta(): React.ReactElement {
  return <section className="closing-section"><div className="vx-container closing-inner"><div><p className="vx-label">Contact us</p><h2>Let&apos;s make a start.</h2><p>A campaign idea, an esports business or a creator question. Tell us what you have in mind.</p></div><ButtonLink href="/contact">Start a conversation <Arrow /></ButtonLink></div></section>;
}
