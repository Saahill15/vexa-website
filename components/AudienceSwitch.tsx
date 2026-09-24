"use client";

import { useEffect, useRef, useState } from "react";
import { AUDIENCE_EVENT, isAudience, saveAudience, type Audience } from "@/lib/audience";

const OPTIONS: readonly { value: Audience; label: string; anchor: string }[] = [
  { value: "brands", label: "A brand", anchor: "for-brands" },
  { value: "holders", label: "A team, creator or organiser", anchor: "for-teams-and-creators" },
];

/**
 * "I am" switch (DESIGN.md section 8.1). A radiogroup with arrow key support. Choosing an option
 * sets ?for=, remembers the choice, reorders the doors and takes the visitor to their door.
 * Without JavaScript each option is a plain link to its anchor.
 */
export function AudienceSwitch(): React.ReactElement {
  const [selected, setSelected] = useState<Audience | null>(null);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const current = document.documentElement.dataset.audience;
    if (isAudience(current)) setSelected(current);
    const onChange = (event: Event): void => setSelected((event as CustomEvent<Audience>).detail);
    window.addEventListener(AUDIENCE_EVENT, onChange);
    return () => window.removeEventListener(AUDIENCE_EVENT, onChange);
  }, []);

  function choose(value: Audience, jump: boolean): void {
    setSelected(value);
    saveAudience(value);
    const url = new URL(window.location.href);
    url.searchParams.set("for", value);
    url.hash = "";
    window.history.replaceState(window.history.state, "", url.toString());
    if (jump) {
      const option = OPTIONS.find((item) => item.value === value);
      if (option) {
        requestAnimationFrame(() => document.getElementById(option.anchor)?.scrollIntoView({ block: "start" }));
      }
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLAnchorElement>, index: number): void {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", " "];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (event.key === " ") {
      choose(OPTIONS[index].value, false);
      return;
    }
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next = (index + step + OPTIONS.length) % OPTIONS.length;
    choose(OPTIONS[next].value, false);
    refs.current[next]?.focus();
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <span id="audience-label" className="font-text text-small font-medium text-vx-ink-2">
        I am
      </span>
      <div role="radiogroup" aria-labelledby="audience-label" className="flex flex-wrap gap-2">
        {OPTIONS.map((option, index) => {
          const checked = selected === option.value;
          const focusable = selected ? checked : index === 0;
          return (
            <a
              key={option.value}
              ref={(node) => {
                refs.current[index] = node;
              }}
              href={`/?for=${option.value}#${option.anchor}`}
              role="radio"
              aria-checked={checked}
              tabIndex={focusable ? 0 : -1}
              onClick={(event) => {
                event.preventDefault();
                choose(option.value, true);
              }}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`inline-flex min-h-[44px] items-center gap-3 rounded-sm border-2 px-4 font-text text-small font-medium text-vx-ink transition-colors duration-fast ${
                checked ? "border-vx-peacock-blue bg-vx-white" : "border-vx-muted hover:border-vx-peacock-blue"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] ${checked ? "border-vx-peacock-blue" : "border-vx-muted"}`}
              >
                <span className={`h-2 w-2 rounded-full ${checked ? "bg-vx-peacock-blue" : "bg-transparent"}`} />
              </span>
              {option.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
