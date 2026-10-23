"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLenis } from "./SmoothScroll";

/*
 * Smooth scrolling skips the browser's jump to a #section, so links such as /services#brands or /contact#form
 * would open at the top. Once the page and its fonts have loaded, this glides smoothly to the section, once per link.
 */
export function ScrollToHash() {
  const lenis = useLenis();
  const pathname = usePathname();
  const done = useRef("");

  useEffect(() => {
    const hash = window.location.hash;
    const key = `${pathname}${hash}`;
    if (!hash || done.current === key) return;

    let cancelled = false;
    (async () => {
      if (document.readyState !== "complete") await new Promise((r) => window.addEventListener("load", r, { once: true }));
      await document.fonts.ready;
      // let the first layout settle before measuring
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      done.current = key;
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.2 });
      else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" });
    })();

    return () => {
      cancelled = true;
    };
  }, [lenis, pathname]);

  return null;
}
