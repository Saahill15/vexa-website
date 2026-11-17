"use client";

import { useEffect } from "react";

const LIMIT_MS = 45 * 60_000;

/**
 * Signs an administrator out after 45 minutes without any activity (mouse, keys, touch or scrolling). The server enforces the
 * same limit, but the inbox refreshes itself in the background, and that alone must not keep a forgotten tab signed in.
 */
export function IdleGuard() {
  useEffect(() => {
    let last = Date.now();
    let leaving = false;
    const touch = () => {
      last = Date.now();
    };
    const events = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));

    async function check() {
      if (leaving || Date.now() - last < LIMIT_MS) return;
      leaving = true;
      try {
        await fetch("/api/auth/logout", { method: "POST", headers: { "x-idle-signout": "1" } });
      } catch {
        /* the server will end it anyway when the time is up */
      }
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}&idle=1`);
    }
    const timer = setInterval(check, 30_000);
    const onVisible = () => document.visibilityState === "visible" && void check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, []);
  return null;
}
