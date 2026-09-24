"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/how-we-work", label: "How We Work" },
  { href: "/proof", label: "Proof" },
  { href: "/about", label: "About" },
  { href: "/valuate", label: "Valuate" },
  { href: "/contact", label: "Contact" },
] as const;

const linkFocus =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500";

export function Header(): React.ReactElement {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-vx-neutral-200 bg-vx-cream-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link href="/" className={`shrink-0 ${linkFocus}`} onClick={() => setOpen(false)}>
          <span className="inline-flex items-center gap-2">
              <Image
                src="/brand/vexa-vmark.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="font-display text-lg font-semibold tracking-tight text-vx-ink-900">
                VEXA
              </span>
            </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${linkFocus} text-sm transition-colors duration-base ease-vx-out ${
                  active
                    ? "font-medium text-vx-accent-600"
                    : "text-vx-neutral-600 hover:text-vx-ink-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="rounded-pill bg-vx-accent-500 px-4 py-2 text-sm font-medium text-white transition-[colors,transform] duration-base ease-vx-out hover:bg-vx-accent-600 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500"
          >
            Book a call
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-vx-neutral-200 transition-colors duration-base ease-vx-out hover:border-vx-neutral-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className="flex flex-col gap-1.5" aria-hidden="true">
            <span
              className={`block h-0.5 w-5 bg-vx-ink-900 transition duration-base ease-vx-out ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-vx-ink-900 transition duration-base ease-vx-out ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-vx-ink-900 transition duration-base ease-vx-out ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-50 flex min-h-[100dvh] flex-col bg-vx-cream-50 px-5 pb-8 pt-6 lg:hidden"
        >
          <div className="mb-10 flex items-center justify-between">
            <span className="font-display text-lg font-semibold">VEXA</span>
            <button
              type="button"
              className="rounded-md border border-vx-neutral-200 px-3 py-2 text-sm transition-colors duration-base ease-vx-out hover:border-vx-neutral-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          <nav className="flex flex-col gap-5" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${linkFocus} font-display text-3xl font-semibold tracking-tight text-vx-ink-900`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-4 inline-flex w-fit rounded-pill bg-vx-accent-500 px-5 py-3 text-base font-medium text-white transition-[colors,transform] duration-base ease-vx-out hover:bg-vx-accent-600 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500"
              onClick={() => setOpen(false)}
            >
              Book a call
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
