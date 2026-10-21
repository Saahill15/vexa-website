import Image from "next/image";
import type { CSSProperties } from "react";
import { Button } from "@/components/Button";
import { Cta } from "@/components/Cta";
import { Reveal } from "@/components/Reveal";
import { Split } from "@/components/Split";

const TICKER = ["Creator campaigns", "Team partnerships", "Tournament activations", "Esports advisory"];

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-label="Introduction">
        <div className="sun" aria-hidden="true" />
        <div className="floor" aria-hidden="true" />
        <div className="wrap">
          <div className="hero-top">
            <Reveal className="hero-meta">
              <p className="tag">Esports consultancy · Est. 2025</p>
              <p><b>New Delhi, India</b></p>
            </Reveal>
            <Reveal className="orbit" variant="s" delay={300} aria-hidden="true">
              <svg viewBox="0 0 300 300">
                <defs>
                  <path id="ring" d="M150,150 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0" />
                </defs>
                <text>
                  <textPath href="#ring" startOffset="0" textLength="735" lengthAdjust="spacing">
                    Brand campaigns ✦ Esports advisory ✦ Creators ✦ Teams ✦{" "}
                  </textPath>
                </text>
              </svg>
              <Image src="/img/vexa-vmark.png" alt="" width={335} height={318} />
            </Reveal>
          </div>
          <Split as="h1" className="h-xl">Where brands *meet* gaming.</Split>
          <div className="hero-bottom">
            <Reveal as="p" className="lede" delay={700}>
              We help brands succeed in gaming, and help esports teams build partnerships brands can buy.
            </Reveal>
            <Reveal className="row" delay={850}>
              <Button href="/services">Our services</Button>
              <Button href="/contact" variant="line">Contact us</Button>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>

      <section className="sec" aria-labelledby="svc-h">
        <div className="wrap">
          <div className="sec-head">
            <Reveal as="p" className="tag">Services</Reveal>
            <Split as="h2" className="h-lg" id="svc-h">Two ways we help.</Split>
          </div>
          <div className="stack">
            <Reveal as="link" href="/services#brands" className="panel panel--b" style={{ "--n": 0 } as CSSProperties}>
              <div className="panel-main">
                <div>
                  <span className="panel-num" aria-hidden="true">01</span>
                  <p className="tag" style={{ marginTop: 18 }}>For brands</p>
                </div>
                <div style={{ display: "grid", gap: 18 }}>
                  <h3 className="h-lg">A campaign built around your goal.</h3>
                  <p>We develop the idea, choose the right gaming partners and manage delivery.</p>
                </div>
                <span className="panel-cta"><i aria-hidden="true">→</i> Brand campaigns</span>
              </div>
              <ul aria-label="Brand services">
                <li>Creator campaigns</li>
                <li>Team partnerships</li>
                <li>Tournament activations</li>
              </ul>
            </Reveal>
            <Reveal as="link" href="/services#esports" className="panel panel--e" style={{ "--n": 1 } as CSSProperties}>
              <div className="panel-main">
                <div>
                  <span className="panel-num" aria-hidden="true">02</span>
                  <p className="tag" style={{ marginTop: 18 }}>For esports teams and organisers</p>
                </div>
                <div style={{ display: "grid", gap: 18 }}>
                  <h3 className="h-lg">A partnership a brand can understand.</h3>
                  <p>We help define what a brand can buy from you, and build the proposal behind it.</p>
                </div>
                <span className="panel-cta"><i aria-hidden="true">→</i> Esports advisory</span>
              </div>
              <ul aria-label="Esports advisory services">
                <li>Your commercial offer</li>
                <li>Content and audience</li>
                <li>Organiser partnerships</li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <Cta>Let’s build in *gaming.*</Cta>
    </>
  );
}
