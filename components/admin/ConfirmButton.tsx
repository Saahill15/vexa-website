"use client";

import type { ButtonHTMLAttributes } from "react";

/** A submit button that asks first. Used for deletes. */
export function ConfirmButton({ message, children, ...rest }: { message: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="submit" {...rest} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
