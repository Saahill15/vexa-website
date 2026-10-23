"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Checks for new mail once a minute while the inbox is open and visible. When anything changed, the page refreshes itself
 * and a small notice says so. It stops when the tab is hidden, and checks at once when you come back to it.
 */
export function MailAutoRefresh({ signature }: { signature: string }) {
  const router = useRouter();
  const known = useRef(signature);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    known.current = signature;
  }, [signature]);

  useEffect(() => {
    let stopped = false;
    const check = async () => {
      if (document.hidden || stopped) return;
      try {
        const res = await fetch("/admin/inbox/poll", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean; signature?: string };
        if (data.ok && data.signature && data.signature !== known.current) {
          known.current = data.signature;
          setNotice("Mail updated");
          router.refresh();
          window.setTimeout(() => setNotice(""), 4000);
        }
      } catch {
        /* try again at the next check */
      }
    };
    const timer = window.setInterval(check, 60_000);
    const onVisible = () => !document.hidden && void check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return notice ? <div className="adm-toast" role="status">{notice}</div> : null;
}
