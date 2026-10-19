"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Admin.module.css";

export function Nav({ items }: { items: { href: string; label: string; count?: number }[] }) {
  const pathname = usePathname();
  return <nav className={styles.nav} aria-label="Admin">{items.map((item) => {
    const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`);
    return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}><span>{item.label}</span>{item.count ? <span className={styles.count} aria-label={`${item.count} need attention`}>{item.count}</span> : null}</Link>;
  })}</nav>;
}
