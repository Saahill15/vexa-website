"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { primaryButton } from "@/components/ButtonLink";
import { AUDIENCE_EVENT, readAudience, type Audience } from "@/lib/audience";

/** The primary "Send your brief" button. It carries the chosen audience into /contact?for=... */
export function BriefLink({ children, className = "" }: { children: React.ReactNode; className?: string }): React.ReactElement {
  const [audience, setAudience] = useState<Audience | null>(null);

  useEffect(() => {
    setAudience(readAudience());
    const onChange = (event: Event): void => setAudience((event as CustomEvent<Audience>).detail);
    window.addEventListener(AUDIENCE_EVENT, onChange);
    return () => window.removeEventListener(AUDIENCE_EVENT, onChange);
  }, []);

  return (
    <Link href={audience ? `/contact?for=${audience}` : "/contact"} className={`${primaryButton} ${className}`}>
      {children}
    </Link>
  );
}
