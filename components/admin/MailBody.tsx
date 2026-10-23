"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STYLE = `html,body{margin:0;padding:0;background:#fff}
body{padding:2px 1px;font:15px/1.65 Arial,Helvetica,sans-serif;color:#12292a;overflow-wrap:anywhere;word-break:break-word}
img{max-width:100%;height:auto}
img[width="1"],img[height="1"]{display:none!important}
a{color:#0B7F7C}
table{max-width:100%}
pre{white-space:pre-wrap}
blockquote{margin:8px 0;padding-left:12px;border-left:3px solid #d3e6e4;color:#5E7473}`;

/** The frame's page. Its policy blocks scripts and everything from the web; images are allowed only if the admin asks. */
function frameDocument(html: string, images: boolean, quoted: boolean): string {
  const policy = `default-src 'none'; style-src 'unsafe-inline'; img-src data: ${images ? "https: http:" : ""}`;
  const hide = quoted ? "" : ".gmail_quote,blockquote.gmail_quote{display:none!important}";
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><base target="_blank"><style>${STYLE}${hide}</style></head><body>${html}</body></html>`;
}

/**
 * One message, shown in a sandboxed frame: no scripts, no forms, no web requests. Remote images (often tracking pixels)
 * stay hidden until "Show images" is chosen, and quoted earlier messages stay folded until asked for.
 */
export function MailBody({ html, hasRemoteImages, hasQuoted, guess = 140 }: { html: string; hasRemoteImages: boolean; hasQuoted: boolean; guess?: number }) {
  const [images, setImages] = useState(false);
  const [quoted, setQuoted] = useState(false);
  const [height, setHeight] = useState(guess);
  const frame = useRef<HTMLIFrameElement>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const doc = useMemo(() => frameDocument(html, images, quoted), [html, images, quoted]);

  // Set on the frame itself, so the "loaded" signal can never be missed. Then the frame follows its content's height.
  const onLoad = useCallback(() => {
    const body = frame.current?.contentDocument?.body;
    if (!body) return;
    const measure = () => setHeight(Math.max(24, Math.ceil(body.getBoundingClientRect().height) + 4));
    measure();
    observer.current?.disconnect();
    if ("ResizeObserver" in window) {
      observer.current = new ResizeObserver(measure);
      observer.current.observe(body);
    }
  }, []);

  useEffect(() => {
    // The server-rendered frame can finish loading before this script attaches, so its load signal may be missed.
    // Keep checking (up to 5 seconds) until the frame's page is ready, then measure it.
    const ready = (d?: Document | null) => d?.readyState === "complete" && Boolean(d.head?.querySelector('meta[http-equiv="Content-Security-Policy"]'));
    let tries = 0;
    let timer: number | undefined;
    const check = () => {
      if (ready(frame.current?.contentDocument)) return onLoad();
      if (++tries < 50) timer = window.setTimeout(check, 100);
    };
    check();
    return () => {
      window.clearTimeout(timer);
      observer.current?.disconnect();
    };
  }, [onLoad, doc]);

  return (
    <div className="adm-mailbody">
      {hasRemoteImages && !images ? (
        <p className="adm-mailbar">
          Images are hidden, because they can tell the sender you opened this.
          <button type="button" className="adm-mini" onClick={() => setImages(true)}>Show images</button>
        </p>
      ) : null}
      <iframe
        ref={frame}
        title="Message"
        className="adm-mailframe"
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        srcDoc={doc}
        onLoad={onLoad}
        style={{ height }}
      />
      {hasQuoted ? (
        <button type="button" className="adm-quote-toggle" onClick={() => setQuoted((q) => !q)} aria-expanded={quoted}>
          {quoted ? "Hide quoted text" : "Show quoted text"}
        </button>
      ) : null}
    </div>
  );
}
