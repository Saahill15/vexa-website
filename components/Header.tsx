"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { expoOut } from "@/lib/ease";
import { NAV } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: "user" | "admin" } | null | undefined>(undefined);
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  // who is signed in (the page itself stays cached; only this small request is per visitor)
  useEffect(() => {
    let live = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user: { name: string; role: "user" | "admin" } | null }) => live && setUser(d.user))
      .catch(() => live && setUser(null));
    return () => {
      live = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !(e.target as HTMLElement).closest(".acct") && setMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menu]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
    setMenu(false);
    setOpen(false);
    router.refresh();
  }

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
  }, [open]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 24);
      setHidden(y > lastY.current && y > 480);
      lastY.current = y;
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  // log in, then come back to the page you were on (not to the login or signup page itself)
  const back = encodeURIComponent(/^\/(login|signup)\b/.test(pathname) ? "/articles" : pathname);
  const loginHref = `/login?next=${back}`;
  const signupHref = `/signup?next=${back}`;

  return (
    <header className={`nav${solid ? " is-solid" : ""}${hidden && !open ? " is-hidden" : ""}`}>
      <div className="nav-card">
        <Link href="/" className="nav-logo" aria-label="Vexa Digital, home">
          <Image src="/img/vexa-logo-teal.png" alt="Vexa Esports Consultancy" width={65} height={34} priority />
        </Link>
        <nav className="nav-links" aria-label="Main">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nav-cta nav-auth">
          {user ? (
            <div className="acct">
              <button type="button" className="acct-btn" aria-expanded={menu} aria-haspopup="menu" aria-label="Account menu" onClick={() => setMenu((v) => !v)}>
                <span>{user.name.charAt(0).toUpperCase()}</span>
              </button>
              {menu ? (
                <div className="acct-menu" role="menu">
                  <p>{user.name}</p>
                  <Link href="/account" role="menuitem">Your account</Link>
                  {user.role === "admin" ? <Link href="/admin" role="menuitem">Admin panel</Link> : null}
                  <button type="button" role="menuitem" onClick={logout}>Log out</button>
                </div>
              ) : null}
            </div>
          ) : user === null ? (
            <>
              <Link href={loginHref} className="nav-login" aria-current={pathname === "/login" ? "page" : undefined}>Log in</Link>
              <Link href={signupHref} className="btn btn--sm">Sign up</Link>
            </>
          ) : null}
        </div>
        <button type="button" className="nav-burger" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
          <span />
          <span />
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className="sheet"
            initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: expoOut }}
          >
            <nav aria-label="Mobile">
              {[{ href: "/", label: "Home" }, ...NAV].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0.001, y: 10, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, ease: expoOut, delay: 0.04 + i * 0.05 }}
                >
                  <Link href={item.href} aria-current={item.href === "/" ? (pathname === "/" ? "page" : undefined) : isActive(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {user ? (
                <div className="sheet-acct">
                  <p>Signed in as <strong>{user.name}</strong></p>
                  <Link href="/account" className="btn btn--line">Your account</Link>
                  {user.role === "admin" ? <Link href="/admin" className="btn btn--line">Admin panel</Link> : null}
                  <button type="button" className="btn btn--line" onClick={logout}>Log out</button>
                </div>
              ) : user === null ? (
                <div className="sheet-auth">
                  <Link href={loginHref} className="btn btn--line">Log in</Link>
                  <Link href={signupHref} className="btn">Sign up</Link>
                </div>
              ) : null}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
