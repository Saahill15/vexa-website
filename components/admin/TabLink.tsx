"use client";

import Link, { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

function Pending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="tab-spin" aria-hidden="true" /> : null;
}

/** A filter tab. While the next list is loading it shows a small spinner, so a click is never met with silence. */
export function TabLink({ href, current, children }: { href: string; current?: boolean; children: ReactNode }) {
  return (
    <Link href={href} aria-current={current ? "page" : undefined}>
      {children}
      <Pending />
    </Link>
  );
}
