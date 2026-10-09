"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AUDIENCE_LINKS, NAV } from "@/components/nav";

type Group = keyof typeof AUDIENCE_LINKS;

export function Header(): React.ReactElement {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobileSheet = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const dropdowns = useRef<Partial<Record<Group, HTMLDetailsElement>>>({});

  function closeDropdowns(): void {
    Object.values(dropdowns.current).forEach(details => { if (details) details.open = false; });
  }

  useEffect(() => {
    setOpen(false);
    closeDropdowns();
  }, [pathname]);

  useEffect(() => {
    const outside = (event: MouseEvent): void => {
      if (!header.current?.contains(event.target as Node)) closeDropdowns();
    };
    document.addEventListener("click", outside);
    return () => document.removeEventListener("click", outside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileSheet.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab" && mobileSheet.current) {
        const items = Array.from(mobileSheet.current.querySelectorAll<HTMLElement>("a,button,summary"))
          .filter(item => item.getClientRects().length > 0);
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = before;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function audience(group: Group, mobile = false): React.ReactElement {
    const item = AUDIENCE_LINKS[group];
    return <details
      key={group}
      className={mobile ? "mobile-audience" : "nav-audience"}
      ref={element => { if (!mobile && element) dropdowns.current[group] = element; }}
      onToggle={event => {
        if (!mobile && event.currentTarget.open) {
          Object.entries(dropdowns.current).forEach(([key, details]) => {
            if (key !== group && details) details.open = false;
          });
        }
      }}
      onKeyDown={event => {
        if (event.key === "Escape") {
          event.currentTarget.open = false;
          event.currentTarget.querySelector<HTMLElement>("summary")?.focus();
          event.stopPropagation();
        }
        if (event.key === "ArrowDown" && event.target instanceof HTMLElement && event.target.tagName === "SUMMARY") {
          event.preventDefault();
          event.currentTarget.open = true;
          event.currentTarget.querySelector<HTMLElement>("a")?.focus();
        }
      }}
    >
      <summary aria-current={(pathname.startsWith(item.href) || item.links.some(link => pathname.startsWith(link.href))) ? "page" : undefined}>
        {item.label}<span className="nav-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="audience-panel">
        <div className="audience-intro">
          <p className="vx-label">{item.label}</p>
          <p>{item.intro}</p>
          <Link href={item.href} onClick={() => { closeDropdowns(); setOpen(false); }}>Explore the work <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="audience-options">
          {item.links.map(link => <Link key={link.href} href={link.href} onClick={() => { closeDropdowns(); setOpen(false); }}>
            <span>{link.label} <span aria-hidden="true">↗</span></span>
            <small>{link.description}</small>
          </Link>)}
        </div>
      </div>
    </details>;
  }

  return <header ref={header} className="site-header" data-segment="NAV-01"
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeDropdowns(); }}>
    <div className="vx-container header-inner">
      <Link href="/" aria-label="VEXA Digital, home" className="header-brand">
        <Image src="/brand/open-feather-lockup-primary.svg" width={348} height={112} alt="" priority className="header-logo" />
      </Link>
      <nav aria-label="Primary" className="desktop-navigation">
        {NAV.map(item => "group" in item ? audience(item.group) : <Link key={item.href} href={item.href}
          aria-current={pathname.startsWith(item.href) ? "page" : undefined}>{item.label}</Link>)}
      </nav>
      <div className="header-utility">
        <Link href="/account" className="account-link">Account <span aria-hidden="true">↗</span></Link>
        <button ref={menuButton} type="button" className="mobile-menu-button" aria-expanded={open}
          aria-controls="mobile-nav" onClick={() => setOpen(true)}>
          Menu <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
      </div>
    </div>
    <noscript><nav className="nojs-nav" aria-label="Primary navigation">{NAV.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav></noscript>
    {open ? <div id="mobile-nav" ref={mobileSheet} className="mobile-sheet" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="vx-container mobile-sheet-top"><span className="vx-label">Explore VEXA</span><button type="button"
        onClick={() => { setOpen(false); menuButton.current?.focus(); }}>Close <span aria-hidden="true">×</span></button></div>
      <nav className="vx-container mobile-navigation" aria-label="Mobile navigation">
        {NAV.map(item => "group" in item ? audience(item.group, true) : <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
        <Link href="/account" className="mobile-account" onClick={() => setOpen(false)}>Your account <span aria-hidden="true">↗</span></Link>
      </nav>
    </div> : null}
  </header>;
}
