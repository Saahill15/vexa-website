import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { WordReveal } from "@/components/motion/WordReveal";
import { ValuateDemo } from "@/components/ValuateDemo";

export const metadata: Metadata = {
  title: "Valuate",
  description: "Valuate helps creators estimate a quote for a sponsored post, with the work, audience input and assumptions beside the range.",
};

const APP = "https://valuate.vexadigital.in";

// What changes the price of the same post, from the earlier Valuate preview
const SCOPES: { icon: IconName; title: string; text: string }[] = [
  { icon: "video", title: "Publication on your channel", text: "The free estimate covers one sponsored post on your own account. That is the purchase it prices." },
  { icon: "flow", title: "A brand repost", text: "A separate use of your content. Agree where it can appear, for how long and whether changes are allowed." },
  { icon: "target", title: "Advertising use", text: "Paid advertising needs its own scope: channels, duration, edits and the access required." },
];

/* Built from design elements only: shapes, icons and a simple diagram, no photographs. */
export default function ValuatePage() {
  return (
    <>
      <header className="v-hero">
        <div className="wrap v-hero-grid">
          <div className="v-hero-copy">
            <Reveal><span className="label">Valuate · for creators</span></Reveal>
            <WordReveal as="h1" className="h1" lines={["Estimate your", "brand quote."]} />
            <Reveal delay={0.3}><p className="lede">Valuate helps creators estimate a quote for a sponsored post. The work, audience input and calculation assumptions sit beside the indicative range.</p></Reveal>
            <Reveal delay={0.4} className="row">
              <a href={APP} className="btn" target="_blank" rel="noopener">Try Valuate free <span className="arr" aria-hidden="true">↗</span></a>
              <a href="#how" className="btn btn--line">How it works</a>
            </Reveal>
            <Reveal delay={0.45}><p className="v-note">An indicative range is a starting point for discussion, not a guaranteed price.</p></Reveal>
          </div>
          <Reveal delay={0.2} y={28}><ValuateDemo /></Reveal>
        </div>
      </header>

      <section className="sec" id="how" style={{ scrollMarginTop: 70 }} aria-labelledby="how-h">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><span className="label">How it works</span></Reveal>
            <WordReveal className="h2" id="how-h" lines={["Three inputs,", "one figure you can explain."]} />
          </div>
          <Reveal className="card v-diagram-card" y={24} style={{ padding: "clamp(28px,5vw,56px)" }}>
            <div className="v-diagram" aria-hidden="true">
              <div className="v-node"><span className="v-orb"><Icon name="video" size={30} /></span><b>Content</b><span>Formats and channels</span></div>
              <span className="v-link" />
              <div className="v-node"><span className="v-orb"><Icon name="users" size={30} /></span><b>Audience</b><span>Your own results</span></div>
              <span className="v-link" />
              <div className="v-node"><span className="v-orb"><Icon name="coin" size={30} /></span><b>Starting quote</b><span>A figure you can explain</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec sec--tint" aria-labelledby="scope-h">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><span className="label">What changes the quote</span></Reveal>
            <WordReveal className="h2" id="scope-h" lines={["Same post,", "different permissions."]} />
          </div>
          <div className="v-scopes">
            {SCOPES.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08} className="card v-scope">
                <span className="gc-ico"><Icon name={s.icon} size={22} /></span>
                <h3 className="h3">{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec svc-end-sec" style={{ paddingTop: "clamp(56px,7vw,92px)" }} aria-label="Try Valuate">
        <div className="wrap">
          <div className="svc-end">
            <div className="svc-end-copy">
              <h2 className="h2">Know your number before the call.</h2>
              <p>Add your own audience input in Valuate and see an indicative range, with the assumptions behind it.</p>
              <a href={APP} className="btn btn--white" target="_blank" rel="noopener">Try Valuate free <span className="arr" aria-hidden="true">↗</span></a>
            </div>
            <Link href="/contact?as=other#form" className="svc-next">
              <small>Have a deal in front of you?</small>
              <strong>Ask us about it</strong>
              <span>We can help scope what the brand is buying.</span>
              <span className="svc-next-arr" aria-hidden="true"><Icon name="arrow" size={20} /></span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
