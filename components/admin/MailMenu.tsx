"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MailIcon } from "./MailIcons";

/** A three-dot menu, like Gmail's. It closes on a click elsewhere or Escape. */
export function MailMenu({ label = "More", children }: { label?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const escape = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className="adm-menu" ref={box} onClick={(e) => e.stopPropagation()}>
      <button type="button" className="adm-icon-btn" title={label} aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <MailIcon name="more" />
      </button>
      {open ? <div className="adm-menu-list" role="menu">{children}</div> : null}
    </div>
  );
}

/** An icon button that prints the open conversation. */
export function PrintButton({ asItem = false }: { asItem?: boolean }) {
  return asItem ? (
    <button type="button" role="menuitem" onClick={() => window.print()}>Print</button>
  ) : (
    <button type="button" className="adm-icon-btn" title="Print" aria-label="Print" onClick={() => window.print()}>
      <MailIcon name="print" />
    </button>
  );
}
