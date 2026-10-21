"use client";

import Link from "next/link";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

type Props = {
  href: string;
  variant?: "line";
  arrow?: boolean;
  children: ReactNode;
};

/** A pill button that gently follows the pointer. */
export function Button({ href, variant, arrow = true, children }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const move = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !hasFinePointer()) return;
    const r = el.getBoundingClientRect();
    el.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1)}px`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.translate = "";
  };

  return (
    <Link ref={ref} href={href} className={variant === "line" ? "btn btn--line" : "btn"} onMouseMove={move} onMouseLeave={leave}>
      {children}
      {arrow && variant !== "line" ? (
        <>
          {" "}
          <span className="arr" aria-hidden="true">→</span>
        </>
      ) : null}
    </Link>
  );
}
