"use client";

import { useRef } from "react";

/** Six separate boxes for a six-digit code: type, paste or delete, and the focus moves on by itself. */
export function OtpInput({ value, onChange, autoFocus = false, label = "Six-digit code" }: { value: string; onChange: (next: string) => void; autoFocus?: boolean; label?: string }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, k) => value[k] ?? "");

  // writes digits from a position on, then moves the focus to the next empty box
  function fill(from: number, text: string) {
    const next = Array.from({ length: 6 }, (_, k) => value[k] ?? "");
    const typed = text.replace(/\D/g, "");
    for (let k = 0; k < typed.length && from + k < 6; k++) next[from + k] = typed[k];
    const joined = next.join("").replace(/[^\d]/g, "");
    onChange(joined);
    refs.current[Math.min(from + typed.length, 5)]?.focus();
  }

  return (
    <div role="group" aria-label={label} style={{ display: "flex", gap: 8 }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="in"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1} of 6`}
          autoFocus={autoFocus && i === 0}
          maxLength={1}
          value={d}
          onChange={(e) => (e.target.value === "" ? onChange(value.slice(0, i)) : fill(i, e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) {
              e.preventDefault();
              onChange(value.slice(0, i - 1));
              refs.current[i - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            fill(i, e.clipboardData.getData("text"));
          }}
          style={{ width: 44, height: 52, textAlign: "center", fontSize: 22, fontWeight: 600, padding: 0 }}
        />
      ))}
    </div>
  );
}
