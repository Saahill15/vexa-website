import type { Metadata } from "next";
import Image from "next/image";
import { Cta } from "@/components/Cta";
import { Reveal } from "@/components/Reveal";
import { Split } from "@/components/Split";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "VEXA is an esports consultancy founded in 2025 by Kaustubh Srivastava, a former competitive player and in-game leader.",
};

export default function AboutPage() {
  return (
    <>
      <header className="phero">
        <div className="wrap phero-grid">
          <div>
            <Reveal as="p" className="tag">About</Reveal>
            <Split as="h1" className="h-xl" style={{ fontSize: "clamp(2.3rem,6.6vw,6rem)" }}>The people behind VEXA.</Split>
          </div>
          <Reveal className="phero-aside" delay={500}>
            <p>VEXA is an esports consultancy, established in 2025.</p>
          </Reveal>
        </div>
      </header>

      <section className="sec--tight sec" style={{ paddingTop: 0 }} aria-labelledby="founder-h">
        <div className="wrap founder">
          <Reveal as="aside" className="founder-card" variant="x">
            <Image className="mark" src="/img/vexa-vmark.png" alt="" width={335} height={318} />
            <p className="tag">Founder</p>
            <h2 className="h-lg" id="founder-h">Kaustubh Srivastava</h2>
            <p className="dim">Known as Soda</p>
          </Reveal>
          <div className="story">
            <Reveal as="p">
              A former competitive player and in-game leader in PUBG Mobile and BGMI. VEXA grew from his interest in the
              business around competition: what players and teams can build that gives someone a reason to pay them.
            </Reveal>
            <Reveal as="a" className="tl" href={SITE.founderLinkedin} rel="noopener" target="_blank" style={{ justifySelf: "start" }}>
              LinkedIn
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec--tight sec" style={{ paddingTop: 0 }} aria-labelledby="crew-h">
        <div className="wrap">
          <h2 className="sr-only" id="crew-h">Team</h2>
          <div className="team">
            <Reveal as="article" className="member">
              <span className="avatar" aria-hidden="true">PA</span>
              <p className="role">Research and administration</p>
              <h3 className="h-md">Pratham Asknani</h3>
            </Reveal>
            <Reveal as="article" className="member" delay={140}>
              <span className="avatar" aria-hidden="true">B</span>
              <p className="role">Design and video</p>
              <h3 className="h-md">Bhaskar</h3>
            </Reveal>
          </div>
        </div>
      </section>

      <Cta>Let’s *talk.*</Cta>
    </>
  );
}
