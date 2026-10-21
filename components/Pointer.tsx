"use client";

import { useEffect, useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

const HOVER = "a,button,summary,label,[role=button],.panel,.tile,.member,.mini li,.acard";
const TEXT = "input:not([type=checkbox]):not([type=radio]),textarea";

/** Mouse-only effects: soft spotlight, custom cursor, and the glow on cards. */
export function Pointer() {
  const spotRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const spot = spotRef.current;
    if (prefersReducedMotion() || !hasFinePointer()) {
      if (spot) spot.style.display = "none";
      return;
    }
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    let cx = 0, cy = 0, rx = 0, ry = 0, seen = false, raf = 0;

    const onMove = (e: MouseEvent) => {
      cx = e.clientX;
      cy = e.clientY;
      dot.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      spot?.style.setProperty("--mx", `${cx}px`);
      spot?.style.setProperty("--my", `${cy}px`);
      if (!seen) {
        seen = true;
        rx = cx;
        ry = cy;
        root.classList.add("has-cursor");
        dot.classList.add("on");
        ring.classList.add("on");
      }
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(".tile,.member,.acard");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--tx", `${e.clientX - r.left}px`);
        card.style.setProperty("--ty", `${e.clientY - r.top}px`);
      }
    };
    const loop = () => {
      rx += (cx - rx) * 0.16;
      ry += (cy - ry) * 0.16;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      const isText = !!t.closest?.(TEXT);
      root.classList.toggle("cursor-text", isText);
      ring.classList.toggle("is-link", !isText && !!t.closest?.(HOVER));
    };
    const down = () => ring.classList.add("is-down");
    const up = () => ring.classList.remove("is-down");
    const leave = () => {
      dot.classList.remove("on");
      ring.classList.remove("on");
    };
    const enter = () => {
      if (seen) {
        dot.classList.add("on");
        ring.classList.add("on");
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);
    root.addEventListener("mouseleave", leave);
    root.addEventListener("mouseenter", enter);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup", up);
      root.removeEventListener("mouseleave", leave);
      root.removeEventListener("mouseenter", enter);
      root.classList.remove("has-cursor", "cursor-text");
    };
  }, []);

  return (
    <>
      <div className="spot" ref={spotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
}
