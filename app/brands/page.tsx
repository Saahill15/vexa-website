import type { Metadata } from "next";
import { Arrow, ButtonLink } from "@/components/ButtonLink";
import { PageMotion } from "@/components/PageMotion";
import { withShare } from "@/lib/meta";

export const metadata: Metadata = withShare({
  title: "Gaming campaigns for brands",
  description: "Develop a campaign concept, select gaming partners and coordinate delivery with VEXA. Creator campaigns, esports partnerships and tournament activations.",
  alternates: { canonical: "/brands" },
});

const chapters = [
  { id: "creators", label: "Creator campaigns", title: "An idea made for the format.", body: "Give your product a relevant role in content people already choose to watch. We develop the creative idea with suitable gaming creators and define what each will make, where it will appear and how the brand is involved.", delivery: "A creative brief, creator shortlist, publishing deliverables and the agreed production schedule.", example: "For example, a product demonstration within an existing creator format. The proposal names the video, the product's role and the publishing channel. This is an illustrative scope, not delivered client work." },
  { id: "team-partnerships", label: "Team partnerships", title: "Work with the people fans follow.", body: "Build a campaign around a team's players, original content and community. We assess what the team controls and can deliver, then describe the activity the brand is buying.", delivery: "A partnership concept with specific team content, placements, permissions and responsibilities.", example: "For example, a recurring player-led content series. The proposal defines the episodes and brand presence, separately from any tournament broadcast or organiser assets." },
  { id: "tournaments", label: "Tournament activations", title: "Give the brand a role in the moment.", body: "Develop an activation around a competition or live gaming event. We work with the organiser on available assets, production needs and a role that serves the campaign objective.", delivery: "An activation plan, organiser responsibilities, required permissions and the agreed event schedule.", example: "For example, a product experience during an event. The proposal describes where it happens, how people participate and who is responsible for delivery." },
];

export default function BrandsPage(): React.ReactElement {
  return <>
    <PageMotion />
    <header className="service-opening vx-container" data-segment="BRANDS-01">
      <p className="vx-label">For brands</p>
      <div className="service-opening-grid">
        <h1>Give your brand<br />a place in gaming.</h1>
        <div className="service-opening-copy"><p>Start with your business problem, the audience you want to reach and the result you need. We assess whether gaming offers a useful route, develop the campaign idea, then choose suitable partners and coordinate delivery.</p><ButtonLink href="/contact?as=brand">Discuss a campaign <Arrow /></ButtonLink></div>
      </div>
    </header>
    <section className="vx-container clarity-process"><h2>How we work</h2><ol><li><h3>Understand the problem</h3><p>Discuss your product, audience, objective, timing and constraints before choosing a format.</p></li><li><h3>Develop the campaign</h3><p>A proposal explains the idea, why it fits, the work, partner roles and costs for you to assess.</p></li><li><h3>Coordinate delivery</h3><p>Once the scope is agreed, we manage partner coordination, approvals and the delivery record.</p></li></ol><p>These are some of the formats a campaign can use. The brief determines which fit.</p></section><div className="vx-container service-chapters">
      {chapters.map(chapter => <section className="service-chapter" id={chapter.id} key={chapter.id}>
        <p className="vx-label">{chapter.label}</p><h2>{chapter.title}</h2>
        <div><p>{chapter.body}</p><h3>What you receive</h3><p>{chapter.delivery}</p><p className="chapter-example">{chapter.example}</p></div>
      </section>)}
    </div>
    <section className="campaign-delivery"><div className="vx-container delivery-layout">
      <div><p className="vx-label">From concept to delivery</p><h2>The proposal makes<br />the purchase clear.</h2><p>You can assess the idea, partners and cost before committing to delivery. The work and responsibilities are agreed in writing.</p></div>
      <dl className="delivery-path">
        <div><dt>The campaign</dt><dd>The concept, audience and proposed partner roles.</dd></div>
        <div><dt>The work</dt><dd>What gets made or activated, where it appears and when.</dd></div>
        <div><dt>The costs</dt><dd>Partner and production costs, with VEXA&apos;s fee identified.</dd></div>
        <div><dt>The record</dt><dd>Approvals, permissions and the measurements we will report after delivery.</dd></div>
      </dl>
    </div></section>
    <section className="service-conversation"><div className="vx-container service-conversation-grid">
      <p className="vx-label">The first conversation</p><h2>Start with the goal<br />you already have.</h2>
      <div><p>Tell us what you make, the people you want to reach and what you want to achieve. We discuss the starting point and any timing, then decide whether there is a useful next step.</p><p>A finished brief and sensitive budget details are optional in the initial enquiry.</p><ButtonLink href="/contact?as=brand">Tell us about the campaign <Arrow /></ButtonLink></div>
    </div></section>
  </>;
}
