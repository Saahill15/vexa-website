"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TITLES: [string, string][] = [
  ["/admin/inbox", "Inbox"],
  ["/admin/enquiries", "Enquiries"],
  ["/admin/articles", "Articles"],
  ["/admin/comments", "Comments"],
  ["/admin/users", "Users"],
];

export function AdminTopbar({ name, email }: { name: string; email: string }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const section = TITLES.find(([p]) => path.startsWith(p))?.[1] ?? "Dashboard";

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !(e.target as HTMLElement).closest(".adm-profile") && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="adm-top">
      <p className="adm-crumb"><span>Admin</span> / <strong>{section}</strong></p>
      <div className="adm-top-right">
        <Link href="/" className="adm-top-link" target="_blank">View site ↗</Link>
        <div className="adm-profile">
          <button type="button" className="adm-avatar" aria-expanded={open} aria-haspopup="menu" aria-label="Account menu" onClick={() => setOpen((v) => !v)}>
            <span>{name.charAt(0).toUpperCase()}</span>
            <b>{name.split(" ")[0]}</b>
            <i aria-hidden="true">▾</i>
          </button>
          {open ? (
            <div className="adm-profile-menu" role="menu">
              <div className="adm-profile-who"><strong>{name}</strong><small>{email}</small><em>Admin</em></div>
              <Link href="/" role="menuitem">View the site</Link>
              <Link href="/admin/users" role="menuitem">Manage users</Link>
              <button type="button" role="menuitem" onClick={logout}>Log out</button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
