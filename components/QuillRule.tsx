"use client";

import { useEffect, useRef, useState } from "react";
import { FeatherEye } from "@/components/FeatherEye";

/**
 * A 1px hair line with the feather eye at its right end. Used once per page to close the final
 * section. It is fully drawn at rest; with JavaScript it waits off screen and draws once (600ms).
 */
export function QuillRule(): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"rest" | "waiting" | "drawn">("rest");

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;
    setState("waiting");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("drawn");
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="quill flex items-center gap-2" data-state={state} aria-hidden="true">
      <span className="quill-line block h-px flex-1 origin-left bg-vx-feather-gold" />
      <FeatherEye className="w-6 shrink-0" />
    </div>
  );
}
