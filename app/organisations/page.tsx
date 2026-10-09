import type { Metadata } from "next";
import { Arrow, ButtonLink } from "@/components/ButtonLink";
import { PageMotion } from "@/components/PageMotion";
import { withShare } from "@/lib/meta";

export const metadata: Metadata = withShare({ title: "Advisory for esports teams and tournament organisers", description: "Develop a commercial offer, content plan and audience evidence with VEXA. Scoped business advisory for esports teams and tournament organisers.", alternates: { canonical: "/organisations" } });

export default function OrganisationsPage(): React.ReactElement {
  return <>
    <PageMotion />
    <header className="service-opening org-opening" data-segment="ORG-01"><div className="vx-container">
      <p className="vx-label">For esports teams and tournament organisers</p><div className="service-opening-grid"><h1>Build the business<br />around the game.</h1><div className="service-opening-copy"><p>Help a brand see what it can buy from your team or tournament. VEXA works with you to define sponsorship packages, player content or event experiences, and the plan for delivering them.</p><ButtonLink href="/contact?as=organisation">Discuss esports advisory <Arrow /></ButtonLink></div></div>
    </div></header>
    <section className="vx-container org-choice-section"><div className="org-choice-heading"><h2>What needs to<br />move forward?</h2><p>The engagement starts with the organisation you actually have. We agree priorities and a written scope, then work through the parts that make the offer clearer.</p></div></section>
    <div className="vx-container service-chapters">
      <section className="service-chapter" id="commercial-offer"><p className="vx-label">Your commercial offer</p><h2>Make the partnership<br />easy to assess.</h2><div><p>A buyer needs to understand what you can make or provide, why it is relevant and what the commitment involves. We help define the content, placements, timing and rights a brand can buy.</p><h3>What the work produces</h3><p>A proposal that tells a brand what it receives, what it costs and who delivers it, supported by a media kit. For a team, this might be a player-led video series with agreed brand placements. For an organiser, it might be an event activation using assets you control.</p></div></section>
      <section className="service-chapter" id="content-audience"><p className="vx-label">Content and audience</p><h2>Build something<br />you can keep delivering.</h2><div><p>Choose repeatable formats around your people and activity. We help develop the content plan and organise audience evidence around the offer, using completed work and dated data.</p><h3>What the work produces</h3><p>A realistic production schedule, named owners and an evidence note a buyer can inspect. Your team continues to record, publish and deliver its commitments.</p></div></section>
      <section className="service-chapter" id="event-partnerships"><p className="vx-label">Organiser partnerships</p><h2>An event with a<br />clear commercial scope.</h2><div><p>For tournament organisers, the opportunity starts with the assets and experiences you control. We help describe what each package includes and how production, approvals and reporting would work.</p><h3>What the work produces</h3><p>An event asset inventory and partnership proposal with responsibilities, permissions and timing identified.</p></div></section>
    </div>
    <section className="org-boundary"><div className="vx-container org-boundary-grid"><div><p className="vx-label">Working together</p><h2>A scoped engagement.<br />Shared responsibility.</h2></div><div><p>Bring what you already publish, the audience evidence you hold and what you have offered brands so far. We discuss the first priorities and who can own the work between reviews.</p><p>The written engagement names the deliverables, review schedule and fee. Sponsor introductions, production and other additional services need their own scope. A sponsorship or income is never guaranteed.</p><ButtonLink href="/contact?as=organisation">Tell us about the organisation <Arrow /></ButtonLink></div></div></section>
  </>;
}
