"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { revealOnView } from "@/lib/motion";

type Props = {
  as?: ElementType | "link";
  variant?: "x" | "s";
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
};

/** Fades and lifts its content into view the first time it is scrolled to. */
export function Reveal({ as = "div", variant, delay = 0, className, style, children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const Tag: ElementType = as === "link" ? Link : as;

  useEffect(() => {
    if (!ref.current) return;
    return revealOnView(ref.current);
  }, []);

  return (
    <Tag
      ref={ref}
      data-r={variant ?? ""}
      className={className}
      style={{ ...style, "--d": delay } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}
