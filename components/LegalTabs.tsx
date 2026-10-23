"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";

const DOCS = [
  { key: "privacy", label: "Privacy Policy", href: "/privacy" },
  { key: "terms", label: "Terms & Conditions", href: "/terms" },
] as const;

/*
 * Switches between the legal documents with motion: the pill slides to the new tab, the current page fades out,
 * then the new page's heading and sections fade in one after another. Modified clicks still open a new tab.
 */
const DIR_KEY = "legal-dir";

export function LegalTabs({ current }: { current: "privacy" | "terms" }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string>(current);

  // arriving from the other tab: the page enters from the side it came from
  useEffect(() => {
    try {
      const forward = sessionStorage.getItem(DIR_KEY) === "forward";
      sessionStorage.removeItem(DIR_KEY);
      if (forward) document.querySelector(".legal")?.classList.add("legal-enter-left");
    } catch {
      /* storage unavailable */
    }
  }, []);

  function go(e: MouseEvent<HTMLAnchorElement>, key: string, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (key === current) return;
    setActive(key);
    if (reduce) return router.push(href);
    // both directions move right to left: the page leaves to the left and the next one enters from the right
    // Privacy to Terms moves left to right; Terms back to Privacy moves right to left
    const forward = key === "terms";
    try {
      sessionStorage.setItem(DIR_KEY, forward ? "forward" : "back");
    } catch {
      /* storage unavailable */
    }
    // drop the entrance direction first, so it can't override the exit animation
    const page = document.querySelector(".legal");
    page?.classList.remove("legal-enter-left");
    page?.classList.add(forward ? "legal-leave-right" : "legal-leave-left");
    setTimeout(() => router.push(href), 260);
  }

  return (
    <nav className="legal-tabs" aria-label="Legal documents">
      {DOCS.map((d) => (
        <a key={d.key} href={d.href} className="legal-tab" aria-current={active === d.key ? "page" : undefined} onClick={(e) => go(e, d.key, d.href)}>
          {active === d.key ? (
            <motion.span layoutId="legal-pill" className="legal-pill" transition={{ type: "spring", stiffness: 420, damping: 38 }} />
          ) : null}
          <span className="legal-tab-label">{d.label}</span>
        </a>
      ))}
    </nav>
  );
}
