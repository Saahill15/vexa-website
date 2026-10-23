"use client";

import { useEffect, useRef } from "react";

const KEY = "vexa-inbox-list-width";
const MIN = 280;
const MAX = 680;
const DEFAULT = 420;
const clamp = (n: number) => Math.min(MAX, Math.max(MIN, Math.round(n)));

/**
 * The divider between the list and the message. Drag it, or focus it and use the arrow keys, to change the list width.
 * Double-click puts it back. The width is remembered in this browser.
 */
export function SplitHandle() {
  const ref = useRef<HTMLDivElement>(null);
  const width = useRef(DEFAULT);

  const apply = (w: number, save = false) => {
    width.current = clamp(w);
    ref.current?.parentElement?.style.setProperty("--list-w", `${width.current}px`);
    ref.current?.setAttribute("aria-valuenow", String(width.current));
    if (save) {
      try {
        localStorage.setItem(KEY, String(width.current));
      } catch {
        /* the width simply is not remembered */
      }
    }
  };

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(KEY));
      if (saved >= MIN && saved <= MAX) apply(saved);
    } catch {
      /* use the default width */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const handle = ref.current;
    const parent = handle?.parentElement;
    if (!handle || !parent) return;
    e.preventDefault();
    handle.focus(); // preventDefault stops the browser doing this, and the arrow keys need it
    handle.setPointerCapture(e.pointerId);
    const left = parent.getBoundingClientRect().left;
    parent.classList.add("is-resizing");
    const move = (ev: PointerEvent) => apply(ev.clientX - left);
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      parent.classList.remove("is-resizing");
      apply(width.current, true);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") apply(width.current - 24, true);
    else if (e.key === "ArrowRight") apply(width.current + 24, true);
    else if (e.key === "Home") apply(DEFAULT, true);
    else return;
    e.preventDefault();
  }

  return (
    <div
      ref={ref}
      className="adm-split"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the message list"
      aria-valuemin={MIN}
      aria-valuemax={MAX}
      aria-valuenow={DEFAULT}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={() => apply(DEFAULT, true)}
    />
  );
}
