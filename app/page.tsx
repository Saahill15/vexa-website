import Image from "next/image";
import Link from "next/link";
import { Arrow, ButtonLink } from "@/components/ButtonLink";
import { withShare } from "@/lib/meta";
export const metadata = withShare({ title: "Brand campaigns in gaming | VEXA", description: "VEXA helps brands understand their opportunity in gaming, develop a campaign and coordinate delivery. Explore our services, articles and creator quote tool." , alternates: { canonical: "/" }});
export default function Home() {
 return <>
  <section className="editorial-hero vx-container">
   <div className="editorial-hero-copy"><p className="vx-label">VEXA · Gaming and esports</p><h1>We develop brand campaigns in gaming.</h1><p>Start with the people you want to reach and the problem you want to solve. We shape the campaign idea, choose suitable partners and manage the work from brief to delivery.</p><ButtonLink href="/services">Explore our services <Arrow /></ButtonLink></div>
   <div className="editorial-hero-art"><Image src="/brand/gaming-editorial.webp" alt="" width={1536} height={1024} sizes="(max-width: 760px) 100vw, 60vw" priority /></div>
  </section>
  <section className="home-resources vx-container" aria-labelledby="resources-heading"><h2 id="resources-heading">Explore the business of gaming.</h2><div className="home-resource-links">
   <Link href="/learn"><h3>Articles</h3><p>Writing on brand partnerships, creator pricing and building an esports business.</p><span className="editorial-link">Read the articles <Arrow /></span></Link>
   <Link href="/valuate"><h3>Valuate</h3><p>Not sure what to charge for a brand deal? Work through your content and get a starting quote.</p><span className="editorial-link">Explore the free creator tool <Arrow /></span></Link>
  </div></section>
 </>;
}
