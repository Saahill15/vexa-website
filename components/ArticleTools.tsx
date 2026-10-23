"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

/** Thin bar across the top of the window showing how far through the article you are. */
export function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const body = document.querySelector<HTMLElement>(".art-body");
    if (!body) return;
    const update = () => {
      const r = body.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setP(Math.min(1, Math.max(0, -r.top / Math.max(total, 1))));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return <div className="art-progress" style={{ transform: `scaleX(${p})` }} aria-hidden="true" />;
}

/** Copy the link, or share it on LinkedIn (opens LinkedIn's own share window). */
export function ShareLinks({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => window.location.href.split("#")[0];
  return (
    <div className="art-share" aria-label="Share this article">
      <span>Share</span>
      <button
        type="button"
        aria-label={copied ? "Link copied" : "Copy link"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url());
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* clipboard unavailable */
          }
        }}
      >
        <Icon name={copied ? "check" : "doc"} size={17} />
      </button>
      <button
        type="button"
        aria-label={`Share “${title}” on LinkedIn`}
        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`, "_blank", "noopener,width=600,height=640")}
      >
        <Icon name="linkedin" size={15} />
      </button>
      {copied ? <span className="art-share-note" role="status">Link copied</span> : null}
    </div>
  );
}
