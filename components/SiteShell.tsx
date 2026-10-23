"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { ScrollToHash } from "./motion/ScrollToHash";
import { SmoothScroll } from "./motion/SmoothScroll";

/** The public site's header, footer and smooth scrolling. The admin panel has its own layout, so it skips them. */
export function SiteShell({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const admin = usePathname().startsWith("/admin");
  if (admin) return <main id="main">{children}</main>;
  return (
    <SmoothScroll>
      <Header />
      <main id="main">{children}</main>
      {footer}
      <ScrollToHash />
    </SmoothScroll>
  );
}
