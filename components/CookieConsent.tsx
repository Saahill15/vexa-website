"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

const KEY = "vexa-cookie-choice";
export const REOPEN_EVENT = "vexa-cookie-reopen";
type Choice = "accepted" | "declined" | null;

const read = (): Choice => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null; // storage blocked: ask each time, load nothing optional
  }
};

/**
 * The notice at the bottom of public pages. Strictly necessary cookies (sign-in) need no consent. The one optional thing, the
 * Cloudflare Web Analytics counter, loads only after Accept. The choice is kept in the browser and can be changed from the footer.
 */
export function CookieConsent({ analyticsToken }: { analyticsToken?: string }) {
  const [choice, setChoice] = useState<Choice>(null);
  const [token, setToken] = useState<string | undefined>(analyticsToken);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = read();
    setChoice(saved);
    setOpen(saved === null);
    const reopen = () => setOpen(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  // the token comes from the Worker's settings at request time; it is fetched only once a visitor has accepted
  useEffect(() => {
    if (choice !== "accepted" || token) return;
    let live = true;
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d: { token?: string | null }) => live && d.token && setToken(d.token))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [choice, token]);

  function decide(next: "accepted" | "declined") {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage blocked */
    }
    setChoice(next);
    setOpen(false);
  }

  return (
    <>
      {open ? (
        <div className="cookie" role="dialog" aria-modal="false" aria-labelledby="cookie-h" aria-describedby="cookie-p">
          <h2 id="cookie-h">Cookies and your choice</h2>
          <p id="cookie-p">
            We use only the cookies the site needs to work, such as keeping you signed in. With your permission we also count visits to see which pages help, without cookies and without following you across sites. See our <Link href="/privacy">Privacy Policy</Link>.
          </p>
          <div className="cookie-actions">
            <button type="button" className="btn btn--line btn--sm" onClick={() => decide("declined")}>Decline</button>
            <button type="button" className="btn btn--sm" onClick={() => decide("accepted")}>Accept</button>
          </div>
        </div>
      ) : null}
      {choice === "accepted" && token ? (
        <Script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token })} strategy="afterInteractive" />
      ) : null}
    </>
  );
}
