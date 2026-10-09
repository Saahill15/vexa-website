"use client";
import { useEffect } from "react";
/** Content stays visible. Motion changes position slightly, never delays reading. */
export function PageMotion(): null {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add("section-entered"); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".product-composition,.campaign-studio,.editorial-feature,.home-team,.service-chapter,.delivery-layout,.org-choice-section,.about-founder,.about-team-grid").forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return null;
}
