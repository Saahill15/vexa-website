import Link from "next/link";
import { FolderDeck } from "@/components/FolderDeck";
import { HeroTunnel } from "@/components/HeroTunnel";
import { Reveal } from "@/components/motion/Reveal";
import { WordReveal } from "@/components/motion/WordReveal";

export default function HomePage() {
  return (
    <>
      <HeroTunnel />

      <section className="sec" id="services" style={{ scrollMarginTop: 70 }} aria-labelledby="svc-h">
        <div className="wrap svc-split-home">
          <div className="svc-intro">
            <Reveal><span className="label">Services</span></Reveal>
            <WordReveal className="h2" id="svc-h" lines={["Two ways we help", "you build in gaming."]} />
            <Reveal delay={0.15}><p className="lede">Whether you are a brand entering gaming or an esports organisation selling to brands, we start with your goal and plan around what partners can deliver.</p></Reveal>
            <Reveal delay={0.2} className="svc-points">
              <Link href="/services#brands"><b>Brand campaigns</b><span>Creator, team and tournament campaigns</span></Link>
              <Link href="/services#esports"><b>Esports advisory</b><span>Commercial offers, content plans and proposals</span></Link>
            </Reveal>
            <Reveal delay={0.25}><Link href="/services" className="btn btn--line">Explore <span className="arr" aria-hidden="true">→</span></Link></Reveal>
          </div>
          <FolderDeck
            items={[
              { number: "01", title: "Brand campaigns", text: "Creator, team and tournament campaigns built around your goal.", href: "/services#brands", tone: "teal" },
              { number: "02", title: "Esports advisory", text: "Help teams and organisers build partnerships brands can buy.", href: "/services#esports", tone: "ink" },
            ]}
          />
        </div>
      </section>


    </>
  );
}
