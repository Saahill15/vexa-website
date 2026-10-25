import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { getSession } from "@/lib/auth";
import { inboxBadges } from "@/lib/inbox";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Vexa Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.pendingAdmin) redirect("/login/verify");
  if (session.role !== "admin") {
    return (
      <section className="auth">
        <div className="wrap">
          <div className="auth-card">
            <h1 className="auth-title">No access</h1>
            <p className="muted">You're signed in as {session.name}, but this account isn't an admin. Ask an existing admin to give you access.</p>
            <Link href="/" className="btn">Back to the site <span className="arr" aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    );
  }
  const badges = await inboxBadges(session.id);
  return (
    <div className="adm">
      <AdminNav newEnquiries={badges.newEnquiries} unread={badges.unread} />
      <div className="adm-main">
        <AdminTopbar name={session.name} email={session.email} />
        {children}
      </div>
    </div>
  );
}
