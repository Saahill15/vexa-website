"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { expoOut } from "@/lib/ease";
import { Reveal } from "./motion/Reveal";

/*
 * The hero from the tunnel-link version, kept as it was: perspective grid floor, soft sun,
 * a rotating ring of text around the V mark, and a headline whose letters rise into place.
 * Only the colours follow the new palette.
 */
// two fixed lines: "Where brands" / "meet gaming."
const LINES = ["Where brands", "*meet* gaming."];

function Title() {
  const reduce = useReducedMotion();
  let i = 0;
  const words = (text: string, accent: boolean, key: string) =>
    text.split(/(\s+)/).map((w, wi) => {
      if (!w) return null;
      if (/^\s+$/.test(w)) return " ";
      return (
        <span className={accent ? "wd acc" : "wd"} key={`${key}-${wi}`} aria-hidden="true">
          {w.split("").map((c, ci) => (
            <motion.span
              key={ci}
              className="ch"
              initial={reduce ? false : { y: "112%", rotate: 7 }}
              animate={{ y: "0%", rotate: 0 }}
              transition={{ duration: 1, ease: expoOut, delay: 0.15 + i++ * 0.022 }}
              style={{ transformOrigin: "0 100%" }}
            >
              {c}
            </motion.span>
          ))}
        </span>
      );
    });

  return (
    <h1 className="hero-title" aria-label={LINES.join(" ").replace(/\*/g, "")}>
      {LINES.map((line, li) => (
        <span className="hero-line" key={li}>
          {line.split(/\*(.+?)\*/).map((p, pi) => words(p, pi % 2 === 1, `l${li}p${pi}`))}
        </span>
      ))}
    </h1>
  );
}

export function HeroTunnel() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="sun" aria-hidden="true" />
      <div className="floor" aria-hidden="true" />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <Reveal>
            <p className="hero-formats">
              <span>Creator campaigns</span>
              <span>Team partnerships</span>
              <span>Tournament activations</span>
            </p>
          </Reveal>
          <Title />
          <Reveal delay={0.7}>
            <p className="lede">We help brands succeed in gaming, and help esports teams build partnerships brands can buy.</p>
          </Reveal>
          <Reveal delay={0.85} className="row">
            <Link href="/services" className="btn">Our services <span className="arr" aria-hidden="true">→</span></Link>
            <Link href="/contact" className="btn btn--line">Start a conversation</Link>
          </Reveal>
        </div>
        <Reveal className="orbit" delay={0.3}>
          <svg viewBox="0 0 300 300" aria-hidden="true">
            <defs>
              <path id="ring" d="M150,150 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0" />
            </defs>
            <text>
              <textPath href="#ring" startOffset="0" textLength="735" lengthAdjust="spacing">
                Brand campaigns ✦ Esports advisory ✦ Creators ✦ Teams ✦{" "}
              </textPath>
            </text>
          </svg>
          <Image src="/img/vexa-vmark-teal.png" alt="" width={335} height={318} priority />
        </Reveal>
      </div>
      <a href="#services" className="scroll-cue" aria-label="Scroll to services">
        <span className="scroll-mouse" aria-hidden="true"><i /></span>
        <span>Scroll</span>
      </a>
    </section>
  );
}
