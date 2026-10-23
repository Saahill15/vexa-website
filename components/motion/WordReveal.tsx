"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, type CSSProperties, type ElementType } from "react";
import { expoOut, REVEAL_DURATION, WORD_STAGGER } from "@/lib/ease";

type Props = {
  /** One entry per line. Lines after the first are shown in the softer second tone. */
  lines: string[];
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  id?: string;
};

const hidden = { opacity: 0.001, filter: "blur(10px)", y: 10 };
const shown = { opacity: 1, filter: "blur(0px)", y: 0 };

/** One word: sharpens from a 10px blur and rises 10px, then drops the blur so it stops costing paint time. */
function Word({ text, delay }: { text: string; delay: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <motion.span
      ref={ref}
      className="tt-inner"
      initial={reduce ? false : hidden}
      whileInView={shown}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: REVEAL_DURATION, ease: expoOut, delay }}
      onAnimationComplete={() => {
        if (ref.current) ref.current.style.filter = "none";
      }}
    >
      {text}
    </motion.span>
  );
}

/** Heading that reveals word by word. */
export function WordReveal({ lines, as: Tag = "h2", className, style, delay = 0, id }: Props) {
  let index = 0;

  return (
    <Tag className={className} style={style} id={id} aria-label={lines.join(" ")}>
      {lines.map((line, li) => (
        <span key={li} className={li === 0 ? "tt-line" : "tt-line tt-2"} aria-hidden="true">
          {line.split(" ").map((word, wi, words) => {
            const i = index++;
            return (
              <span key={wi} className="tt-word">
                <Word text={word} delay={delay + i * WORD_STAGGER} />
                {wi < words.length - 1 ? " " : null}
              </span>
            );
          })}
          {li < lines.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
