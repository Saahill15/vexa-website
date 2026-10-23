"use client";

import { useEffect, useRef } from "react";

type GoogleId = {
  initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const SCRIPT = "https://accounts.google.com/gsi/client";

/** Google's own sign-in button. Calls onCredential with the signed Google token. */
export function GoogleSignIn({ clientId, text, onCredential }: { clientId: string; text: "signin_with" | "signup_with" | "continue_with"; onCredential: (credential: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // the Google script keeps the callback it was given, so it always calls the latest one through this ref
  const handler = useRef(onCredential);
  useEffect(() => {
    handler.current = onCredential;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const draw = () => {
      const id = window.google?.accounts.id;
      if (!id) return;
      id.initialize({ client_id: clientId, callback: (r) => handler.current(r.credential) });
      id.renderButton(el, { theme: "outline", size: "large", shape: "pill", text, width: Math.min(340, el.clientWidth || 340) });
    };
    if (window.google?.accounts.id) return draw();
    if (!document.querySelector(`script[src="${SCRIPT}"]`)) {
      const script = document.createElement("script");
      script.src = SCRIPT;
      script.async = true;
      document.head.appendChild(script);
    }
    const script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    script?.addEventListener("load", draw);
    return () => script?.removeEventListener("load", draw);
  }, [clientId, text]);

  return <div ref={ref} className="auth-google" aria-label="Sign in with Google" />;
}
