"use client";

import { useEffect, useState } from "react";

/** A small notice at the bottom of the screen. Anything on the page can ask for one with: window.dispatchEvent(new CustomEvent("vexa:toast", { detail: "text" })). */
export function MailToast() {
  const [text, setText] = useState("");
  useEffect(() => {
    let timer: number | undefined;
    const show = (e: Event) => {
      setText(String((e as CustomEvent).detail ?? ""));
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setText(""), 4500);
    };
    window.addEventListener("vexa:toast", show);
    return () => {
      window.removeEventListener("vexa:toast", show);
      window.clearTimeout(timer);
    };
  }, []);
  return text ? <div className="adm-toast" role="status">{text}</div> : null;
}

/** The Compose button in the list header. It opens the floating compose window, whatever else is on screen. */
export function ComposeButton() {
  return (
    <button type="button" className="btn btn--sm adm-compose-btn" onClick={() => window.dispatchEvent(new Event("vexa:compose"))}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      Compose
    </button>
  );
}
