export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { Nav } from "@/components/admin/Nav";
import { SignOut } from "@/components/admin/actions";
import { currentStaff, can, secondFactorOk, type Permission } from "@/lib/staff";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin | VEXA" }, robots: { index: false, follow: false } };

const ITEMS: { href: string; label: string; permission: Permission }[] = [
  { href: "/admin", label: "Overview", permission: "dashboard" },
  { href: "/admin/enquiries", label: "Enquiries", permission: "enquiries" },
  { href: "/admin/leads", label: "Leads", permission: "leads" },
  { href: "/admin/users", label: "Users", permission: "users" },
  { href: "/admin/articles", label: "Articles", permission: "articles" },
  { href: "/admin/comments", label: "Comments", permission: "comments" },
  { href: "/admin/audit", label: "Audit log", permission: "audit" },
  { href: "/admin/settings", label: "Settings", permission: "settings" },
  { href: "/admin/security", label: "Two-step sign-in", permission: "dashboard" },
];

// Every page also checks access itself (lib/staff.ts staffPage); this layout only draws the frame.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { staff } = await currentStaff();
  if (!staff?.fresh || !secondFactorOk(staff)) return <>{children}</>;
  let counts: Record<string, number> = {};
  try {
    const db = getDb();
    counts = {
      "/admin/enquiries": can(staff.role, "enquiries") ? (db.prepare("SELECT COUNT(*) AS n FROM briefs WHERE status = 'new'").get() as { n: number }).n : 0,
      "/admin/comments": (db.prepare("SELECT COUNT(*) AS n FROM reader_comments WHERE status = 'pending'").get() as { n: number }).n,
    };
  } catch { /* counts are a convenience; pages report their own load errors */ }
  const items = ITEMS.filter((item) => can(staff.role, item.permission)).map((item) => ({ href: item.href, label: item.label, count: counts[item.href] }));
  return <div className={styles.shell}>
    <aside className={styles.side}>
      <Link href="/admin" className={styles.brand}>VEXA<span>Website admin</span></Link>
      <Nav items={items} />
      <div className={styles.who}><strong>{staff.name || staff.email}</strong>{staff.role === "admin" ? "Administrator" : "Moderator"} · <SignOut /><br /><Link href="/" style={{ color: "inherit" }}>View website</Link></div>
    </aside>
    <div className={styles.main}>{children}</div>
  </div>;
}
