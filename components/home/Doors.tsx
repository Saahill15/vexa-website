import { ButtonLink } from "@/components/ButtonLink";

export function Doors(): React.ReactElement {
  return <section className="home-esports"><div className="vx-container esports-invitation">
    <p className="vx-label">For teams and tournament organisers</p>
    <div><h2>The game is only<br />part of the business.</h2><p>Build the offer around the activity you can deliver. VEXA helps esports organisations develop their commercial offer, content plan and audience evidence.</p><ButtonLink href="/organisations" variant="text">Explore esports advisory</ButtonLink></div>
    <span className="esports-route-mark" aria-hidden="true">↗</span>
  </div></section>;
}
