"use client";

import { useRef, useState } from "react";

type Step = { title: string; body: string; counsel?: boolean };

/**
 * The order we work in (DESIGN.md section 6, Process). Native details and summary, so every row
 * opens without JavaScript. "Open all" toggles every row at once.
 */
export function ProcessAccordion({ steps }: { steps: readonly Step[] }): React.ReactElement {
  const list = useRef<HTMLOListElement>(null);
  const [allOpen, setAllOpen] = useState(false);

  function toggleAll(): void {
    const next = !allOpen;
    list.current?.querySelectorAll("details").forEach((item) => {
      item.open = next;
    });
    setAllOpen(next);
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleAll}
          aria-pressed={allOpen}
          className="min-h-[44px] rounded-sm px-1 font-text text-small font-medium text-vx-ink underline decoration-vx-hair underline-offset-4 hover:decoration-vx-peacock-blue"
        >
          {allOpen ? "Close all" : "Open all"}
        </button>
      </div>
      <ol ref={list} className="mt-2 border-b border-vx-hair">
        {steps.map((step, index) => (
          <li key={step.title} className="border-t border-vx-hair">
            <details className="group">
              <summary className="flex min-h-[64px] cursor-pointer list-none items-center gap-6 rounded-sm py-4 [&::-webkit-details-marker]:hidden">
                <span className="figure-nums w-10 shrink-0 font-display text-h3 font-medium text-vx-peacock-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-text text-body font-semibold text-vx-ink">{step.title}</span>
                <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 transition-transform duration-base group-open:rotate-180" aria-hidden="true">
                  <path d="M3 6l5 5 5-5" fill="none" stroke="#17140F" strokeWidth="1.5" />
                </svg>
              </summary>
              <p data-counsel={step.counsel ? "true" : undefined} className="max-w-body pb-6 pl-16 font-text text-body text-vx-ink-2">
                {step.body}
              </p>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
