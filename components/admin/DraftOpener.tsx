"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { DraftContent } from "@/lib/gmail";

/** A draft is not read like a message: it opens in the compose window, and the list stays where it was. */
export function DraftOpener({ draft, back }: { draft: DraftContent; back: string }) {
  const router = useRouter();
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("vexa:compose", { detail: draft }));
    router.replace(back);
  }, [draft, back, router]);
  return (
    <div className="adm-inbox-empty adm-inbox-pick">
      <strong>Opening your draft…</strong>
      <p>It opens in the New Message window.</p>
    </div>
  );
}
