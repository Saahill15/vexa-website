"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { folderSpring } from "@/lib/ease";
import { Numeral3D } from "./Numeral3D";

export type FolderTone = "teal" | "ink" | "mint";

type Props = {
  number: string;
  title: string;
  text: string;
  href: string;
  tone?: FolderTone;
};

/*
 * Folder card, rebuilt to match the reference: a framed card with a grainy gradient on top and
 * a folder-tab panel holding the number, an arrow, a title and a description. On hover the
 * panel springs down and a 3D numeral rises out of the folder.
 */
export function FolderCard({ number, title, text, href, tone = "teal" }: Props) {
  const reduce = useReducedMotion();
  const rest = { fg: { y: 0 }, obj: { y: 84, scale: 0.985 }, bg: { scale: 1 } };
  const hover = { fg: { y: 100 }, obj: { y: -4, scale: 1.17 }, bg: { scale: 1.06 } };

  return (
    <motion.div className={`fc fc--${tone}`} initial="rest" animate="rest" whileHover={reduce ? undefined : "hover"} whileFocus={reduce ? undefined : "hover"}>
      <Link href={href} className="fc-link" aria-label={`${title}: ${text}`}>
        <div className="fc-in">
          <motion.div className="fc-bg" variants={{ rest: rest.bg, hover: hover.bg }} transition={folderSpring}>
            <span className="fc-grain" />
          </motion.div>

          <motion.div className="fc-obj" variants={{ rest: rest.obj, hover: hover.obj }} transition={folderSpring}>
            <Numeral3D value={String(Number(number))} tone={tone} />
          </motion.div>

          <motion.div className="fc-fg" variants={{ rest: rest.fg, hover: hover.fg }} transition={folderSpring}>
            <svg className="fc-tab" viewBox="0 0 150 32" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 32V20C0 8.954 8.954 0 20 0h83.6c6.9 0 13.3 3.56 16.95 9.42l9.9 15.86c2.73 4.37 7.52 6.72 12.67 6.72H150v0H0z" />
            </svg>
            <div className="fc-body">
              <div className="fc-head">
                <span className="fc-num">{number}</span>
                <svg className="fc-arrow" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* the title and description stay anchored while the panel slides beneath them */}
          <div className="fc-text">
            <p className="fc-title">{title}</p>
            <p className="fc-desc">{text}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
