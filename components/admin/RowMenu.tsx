"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The "⋯" button at the end of a table row. The row's actions (links, and forms that run an action) sit in a small menu
 * instead of a row of buttons. The menu is placed with `position: fixed` so the table's scrolling area cannot clip it.
 */
export function RowMenu({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number; up: boolean }>({ top: 0, right: 0, up: false });
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  function toggle() {
    if (!open && button.current) {
      const r = button.current.getBoundingClientRect();
      const up = window.innerHeight - r.bottom < 220; // open upwards near the bottom of the screen
      setPos({ top: up ? r.top - 6 : r.bottom + 6, right: Math.max(window.innerWidth - r.right, 8), up });
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !button.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        button.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <div className="rowmenu">
      <button ref={button} type="button" className="rowmenu-btn" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
      <div
        ref={menu}
        role="menu"
        hidden={!open}
        className="rowmenu-list"
        style={{ top: pos.top, right: pos.right, transform: pos.up ? "translateY(-100%)" : undefined }}
        // closing waits a tick, so a form button inside is still pressed before the menu hides
        onClick={() => setTimeout(() => setOpen(false), 0)}
      >
        {children}
      </div>
    </div>
  );
}
