"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV } from "@/components/nav";

export function Header(): React.ReactElement {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    sheet.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab" && sheet.current) {
        const items = Array.from(sheet.current.querySelectorAll<HTMLElement>("a, button"));
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string): boolean => !href.startsWith("/#") && pathname.startsWith(href);

  return (
    <header
      data-segment="NAV-01"
      className={`sticky top-0 z-40 border-b bg-vx-paper/[0.96] transition-colors duration-fast ${scrolled ? "border-vx-hair" : "border-transparent"}`}
    >
      <div className="vx-container flex h-16 items-center justify-between gap-6 lg:h-[72px]">
        <Link href="/" className="-m-1 shrink-0 rounded-sm p-1" aria-label="VEXA Digital, home">
          <Image src="/brand/vexa-logo-compact-ink.png" alt="" width={236} height={144} priority className="h-9 w-auto lg:h-10" />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-sm py-2 font-text text-small font-medium underline-offset-[10px] transition-colors duration-fast ${
                  active ? "text-vx-accent-deep underline decoration-2" : "text-vx-ink hover:underline hover:decoration-vx-peacock-blue hover:decoration-1"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden min-h-[44px] items-center rounded-sm border border-vx-accent-deep bg-vx-accent-500 px-5 font-text text-small font-medium text-vx-ink transition-colors duration-fast hover:bg-vx-accent-600 active:translate-y-px lg:inline-flex"
          >
            Send your brief
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center rounded-sm px-2 font-text text-small font-semibold text-vx-accent-deep underline decoration-1 underline-offset-4 lg:hidden"
          >
            Send your brief
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path d="M3 7h18M3 12h18M3 17h18" stroke="#17140F" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>
      {open ? (
        <div
          ref={sheet}
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex min-h-[100dvh] flex-col overflow-y-auto bg-vx-paper lg:hidden"
        >
          <div className="vx-container flex h-16 items-center justify-between">
            <Link href="/" className="-m-1 rounded-sm p-1" aria-label="VEXA Digital, home" onClick={() => setOpen(false)}>
              <Image src="/brand/vexa-logo-compact-ink.png" alt="" width={236} height={144} className="h-9 w-auto" />
            </Link>
            <button
              type="button"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm px-2 font-text text-small font-medium"
              onClick={() => {
                setOpen(false);
                menuButton.current?.focus();
              }}
            >
              Close
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="#17140F" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          <nav className="vx-container mt-6 flex flex-col" aria-label="Menu">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-vx-hair py-4 font-display text-[28px] leading-tight text-vx-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-10 inline-flex min-h-[48px] items-center justify-center rounded-sm border border-vx-accent-deep bg-vx-accent-500 px-6 font-text text-body font-medium text-vx-ink"
            >
              Send your brief
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
