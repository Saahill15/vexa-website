"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { expoOut, REVEAL_DURATION } from "@/lib/ease";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "p" | "article" | "aside" | "header";
};

/** Block-level version of the reference reveal: fade, de-blur and rise into place. */
export function Reveal({ children, className, style, delay = 0, y = 16, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0.001, filter: "blur(10px)", y }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: REVEAL_DURATION, ease: expoOut, delay }}
      // once the reveal has finished, drop the blur: a finished filter keeps a costly layer alive while scrolling
      onAnimationComplete={() => {
        if (ref.current) ref.current.style.filter = "none";
      }}
    >
      {children}
    </Tag>
  );
}
