import type { Metadata } from "next";
import Link from "next/link";
import { FolderDeck } from "@/components/FolderDeck";
import { Reveal } from "@/components/motion/Reveal";
import { WordReveal } from "@/components/motion/WordReveal";
import { PageHead } from "@/components/PageHead";
import { SERVICES, serviceHref } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description: "Brand campaigns in gaming, and business advisory for esports teams and tournament organisers.",
};

const GROUPS = [
  {
    id: "brands",
    label: "For brands",
    lines: ["Campaigns built", "around your goal."],
    lede: "We develop the idea, choose the right gaming partners and manage delivery, from first brief to final record.",
    cta: { label: "Discuss a campaign", href: "/contact?as=brand#form" },
  },
  {
    id: "esports",
    label: "For esports teams and organisers",
    lines: ["Offers a brand", "can understand."],
    lede: "We help esports teams and tournament organisers define what a brand can buy from them, and build the plan behind it. The written scope names the deliverables and fee; a sponsorship is never guaranteed.",
    cta: { label: "Discuss advisory", href: "/contact?as=organisation#form" },
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageHead label="Services" lines={["Two types of service,", "one clear approach."]} lede="Brand campaigns for companies entering gaming, and advisory for esports teams and tournament organisers." />
      {GROUPS.map((g, gi) => (
        <section key={g.id} id={g.id} className={gi === 1 ? "sec sec--deep" : "sec sec--brands"} style={{ scrollMarginTop: 70 }} aria-labelledby={`${g.id}-h`}>
          <div className="wrap">
            <div className="grp-head">
              <div className="grp-copy">
                <Reveal><span className="label">{g.label}</span></Reveal>
                <WordReveal className="h2 one-line" id={`${g.id}-h`} lines={[...g.lines]} />
                <Reveal delay={0.15}><p className="lede">{g.lede}</p></Reveal>
              </div>
              <Reveal delay={0.2}>
                <Link href={g.cta.href} className="btn">{g.cta.label} <span className="arr" aria-hidden="true">→</span></Link>
              </Reveal>
            </div>
            <div className="deck-row">
              <FolderDeck items={SERVICES.filter((s) => s.audience === g.id).map((s) => ({ number: s.number, title: s.title, text: s.text, href: serviceHref(s), tone: g.id === "brands" ? "ink" : "teal" }))} />
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
