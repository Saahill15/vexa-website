import Link from "next/link";
import { Arrow, ButtonLink } from "@/components/ButtonLink";

export function LatestBreakdowns(): React.ReactElement {
  return <section className="home-editorial"><div className="vx-container editorial-composition">
    <div className="editorial-side"><p className="vx-label">Blogs and articles</p><p>Better questions<br />build better offers.</p><Link href="/learn">Explore the writing <Arrow /></Link></div>
    <article className="editorial-feature"><p className="vx-label">Partnerships · By Kaustubh Srivastava</p><h2><Link href="/learn/team-or-tournament">Team or tournament:<br />what the brand receives.</Link></h2><p>A team qualifies for a tournament. A brand could sponsor the team or buy an event package. What makes each offer useful? Start with the activity and assets each can actually deliver.</p><ButtonLink href="/learn/team-or-tournament" variant="text">Read the article</ButtonLink></article>
  </div></section>;
}
