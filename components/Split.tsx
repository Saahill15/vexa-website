"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { revealOnView } from "@/lib/motion";

type Props = {
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  style?: CSSProperties;
  id?: string;
  delay?: number;
  /** Plain text. Wrap words in *asterisks* to colour them with the accent. */
  children: string;
};

function renderWords(text: string, counter: { n: number }, keyPrefix: string) {
  return text.split(/(\s+)/).map((part, i) => {
    if (!part) return null;
    if (/^\s+$/.test(part)) return " ";
    return (
      <span className="wd" aria-hidden="true" key={`${keyPrefix}-${i}`}>
        {part.split("").map((char, j) => (
          <span className="ch" key={j} style={{ "--i": counter.n++ } as CSSProperties}>
            {char}
          </span>
        ))}
      </span>
    );
  });
}

/** A heading whose characters rise into place when it scrolls into view. */
export function Split({ as: Tag = "h2", className, style, id, delay = 0, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return revealOnView(ref.current);
  }, []);

  const counter = { n: 0 };
  const segments = children.split(/\*(.+?)\*/); // odd indexes are accent segments
  const label = segments.join("").replace(/\s+/g, " ").trim();

  return (
    <Tag
      ref={ref as never}
      id={id}
      data-split=""
      aria-label={label}
      className={className}
      style={{ ...style, "--d": delay } as CSSProperties}
    >
      {segments.map((segment, i) =>
        i % 2 === 1 ? (
          <span className="acc" key={i}>{renderWords(segment, counter, `a${i}`)}</span>
        ) : (
          renderWords(segment, counter, `t${i}`)
        ),
      )}
    </Tag>
  );
}
