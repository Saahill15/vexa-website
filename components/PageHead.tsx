import Link from "next/link";
import { Reveal } from "./motion/Reveal";
import { WordReveal } from "./motion/WordReveal";

export function PageHead({ label, lines, lede, back }: { label: string; lines: string[]; lede?: string; back?: { href: string; label: string } }) {
  return (
    <header className="phead">
      <div className="wrap">
        <div className="phead-in">
          {back ? <Link className="tl back-link" href={back.href}>{back.label}</Link> : null}
          <Reveal><span className="label">{label}</span></Reveal>
          <WordReveal as="h1" className="h1" lines={lines} />
          {lede ? <Reveal delay={0.3}><p className="lede">{lede}</p></Reveal> : null}
        </div>
      </div>
    </header>
  );
}
