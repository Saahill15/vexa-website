import type { Metadata } from "next";
import Image from "next/image";
import { Icon, type IconName } from "@/components/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { WordReveal } from "@/components/motion/WordReveal";
import { TEAM } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Vexa is an esports consultancy founded in 2025. Meet Kaustubh Srivastava, Pratham Asknani and Bhaskar.",
};

// How engagements work, in the words of the original Brands and Organisations pages
const PRINCIPLES: { icon: IconName; title: string; text: string }[] = [
  { icon: "doc", title: "A written scope", text: "Every engagement names its deliverables, review schedule and fee in writing before the work starts." },
  { icon: "shield", title: "Honest about outcomes", text: "Sponsor introductions and production need their own scope. A sponsorship or income is never guaranteed." },
  { icon: "check", title: "A record of delivery", text: "Once the scope is agreed, we manage partner coordination, approvals and the delivery record." },
];

const MORE: { icon: IconName; title: string; text: string; label: string; href: string }[] = [
  { icon: "target", title: "Brand campaigns", text: "Creator, team and tournament campaigns built around your goal.", label: "See the services", href: "/services#brands" },
  { icon: "trophy", title: "Esports advisory", text: "Help for teams and organisers building offers brands can buy.", label: "See the services", href: "/services#esports" },
  { icon: "chart", title: "Valuate", text: "Our free tool for creators estimating a quote for a sponsored post.", label: "Meet Valuate", href: "/valuate" },
  { icon: "doc", title: "Articles", text: "Notes on brand partnerships, creator pricing and the business of esports.", label: "Read the articles", href: "/articles" },
];

export default function AboutPage() {
  return (
    <>
      <header className="xl-head">
        <div className="wrap">
          <Reveal><span className="label">About Vexa</span></Reveal>
          <WordReveal as="h1" className="xl-title" lines={["The people behind", "the partnerships."]} />
          <Reveal delay={0.3}><p className="lede">An esports consultancy founded in 2025 in New Delhi. Campaign thinking, research and design, connected by an interest in the business around gaming.</p></Reveal>
        </div>
      </header>

      <section className="xl-sec" aria-labelledby="story-h">
        <div className="wrap ab-story">
          <div>
            <Reveal><span className="label">Our story</span></Reveal>
            <WordReveal className="h2" id="story-h" lines={["A question", "beyond the match."]} />
          </div>
          <Reveal delay={0.1} className="ab-prose">
            <p className="ab-lead">What can players and teams build that gives someone a reason to pay them? Vexa grew from that question.</p>
            <p>Kaustubh, known as Soda, has competed in mobile battle royale games and led a team as its in-game leader. His role was to set strategy and call the team’s decisions during matches. His playing background spans PUBG Mobile and BGMI; it informs how he thinks about players, audiences and the work around competition.</p>
            <p>At Vexa, he leads campaign thinking and commercial decisions, and teaches how gaming partnerships work. His explanations focus on what a brand receives and what a team can reliably deliver.</p>
          </Reveal>
        </div>
      </section>

      <section className="xl-sec sec--tint" aria-labelledby="team-h">
        <div className="wrap">
          <div className="xl-sec-head">
            <WordReveal className="h2" id="team-h" lines={["Different work.", "One clear idea."]} />
            <Reveal delay={0.1}><p>Three people covering strategy, research and design, so a campaign is thought through, prepared and presented clearly.</p></Reveal>
          </div>
          <div className="gc-grid gc-grid--3">
            {TEAM.map((person, i) => (
              <Reveal key={person.chip} delay={i * 0.06} className="gc">
                <span className="gc-photo"><Image src={person.photo} alt={`Placeholder portrait for ${person.name.join(" ")}`} width={480} height={360} unoptimized /></span>
                <div>
                  <span className="gc-role">{person.role}</span>
                  <h3>{person.name.join(" ")}</h3>
                </div>
                <p>{person.bio}</p>
                {person.link.external ? (
                  <a className="gc-link" href={person.link.href} target="_blank" rel="noopener">{person.link.label}</a>
                ) : (
                  <a className="gc-link" href={person.link.href}>{person.link.label}</a>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="xl-sec" aria-labelledby="how-h">
        <div className="wrap">
          <div className="xl-sec-head">
            <WordReveal className="h2" id="how-h" lines={["How we", "work."]} />
            <Reveal delay={0.1}><p>The same three commitments run through every campaign and every advisory engagement.</p></Reveal>
          </div>
          <div className="gc-grid gc-grid--3">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06} className="gc">
                <span className="gc-ico"><Icon name={p.icon} size={22} /></span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="xl-sec sec--tint" aria-labelledby="more-h">
        <div className="wrap">
          <h2 className="h2" id="more-h" style={{ margin: "0 0 clamp(24px,3vw,40px)" }}>More about Vexa</h2>
          <div className="gc-grid">
            {MORE.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.06} className="gc">
                <span className="gc-ico"><Icon name={m.icon} size={22} /></span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
                <a className="gc-link" href={m.href}>{m.label}</a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
