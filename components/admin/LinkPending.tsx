"use client";

import { useLinkStatus } from "next/link";

/** Put inside a <Link>: shows a small spinner the instant that link is clicked, until the next page is ready. */
export function LinkPending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="spin spin--small" role="status" aria-label="Loading" /> : null;
}
