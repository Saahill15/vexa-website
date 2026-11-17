"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Cloudflare's spam check. Calls onToken with the one-time token (or "" when it expires). Bump resetSignal to ask for a fresh one. */
export function Turnstile({ siteKey, onToken, resetSignal = 0 }: { siteKey: string; onToken: (token: string) => void; resetSignal?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  const handler = useRef(onToken);
  useEffect(() => {
    handler.current = onToken;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let live = true;
    const draw = () => {
      if (!live || !window.turnstile || widget.current) return;
      widget.current = window.turnstile.render(el, {
        sitekey: siteKey,
        callback: (t: string) => handler.current(t),
        "expired-callback": () => handler.current(""),
        "error-callback": () => handler.current(""),
      });
    };
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (window.turnstile) draw();
    else {
      if (!script) {
        script = document.createElement("script");
        script.src = SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", draw);
    }
    return () => {
      live = false;
      script?.removeEventListener("load", draw);
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = undefined;
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetSignal && widget.current) window.turnstile?.reset(widget.current);
  }, [resetSignal]);

  return <div ref={ref} className="turnstile" />;
}
