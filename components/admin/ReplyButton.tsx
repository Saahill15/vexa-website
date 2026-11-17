"use client";

/** Opens the compose window on the page, with the sender's address, a subject and a short greeting already filled in. */
export function ReplyButton({ to, subject, html, small }: { to: string; subject: string; html: string; small?: boolean }) {
  return (
    <button type="button" className={small ? "btn btn--sm" : "btn"} onClick={() => window.dispatchEvent(new CustomEvent("vexa:compose", { detail: { prefill: { to, subject, html } } }))}>
      Reply by email
    </button>
  );
}
