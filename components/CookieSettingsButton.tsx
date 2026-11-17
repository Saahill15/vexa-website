"use client";

import { REOPEN_EVENT } from "./CookieConsent";

/** Footer link that reopens the cookie notice so the choice can be changed. */
export function CookieSettingsButton() {
  return (
    <button type="button" className="foot-link-btn" onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))}>
      Cookie settings
    </button>
  );
}
