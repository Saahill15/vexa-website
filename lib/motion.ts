"use client";

import { useEffect, useState } from "react";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function hasFinePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** One shared observer that adds the `in` class the first time an element scrolls into view. */
let observer: IntersectionObserver | null = null;

export function revealOnView(el: Element): () => void {
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    el.classList.add("in");
    return () => {};
  }
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
  }
  observer.observe(el);
  // failsafe: never leave above-the-fold content hidden
  const timer = window.setTimeout(() => {
    if (!el.classList.contains("in") && el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add("in");
    }
  }, 2500);
  return () => {
    window.clearTimeout(timer);
    observer?.unobserve(el);
  };
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);
  return reduced;
}
