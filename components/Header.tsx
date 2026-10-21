"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setSolid(y > 30);
      setHidden(y > lastY.current && y > 400 && !openRef.current);
      lastY.current = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className={`hdr${solid ? " solid" : ""}${hidden ? " hide" : ""}`}>
      <div className="pill">
        <Link className="brand" href="/" aria-label="VEXA Digital, home">
          <Image className="logo-on-light" src="/img/vexa-logo.png" alt="VEXA Esports Consultancy" width={77} height={40} priority />
          <Image className="logo-on-dark" src="/img/vexa-logo-light.png" alt="" aria-hidden="true" width={77} height={40} priority />
        </Link>
        <button
          className="burger"
          type="button"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <i></i>
          <i></i>
        </button>
        <nav className="menu" id="site-menu" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
          <Link className="go" href="/contact">Say hello</Link>
        </nav>
      </div>
    </header>
  );
}
