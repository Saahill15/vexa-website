export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";
import { VerifyForm } from "@/components/admin/SecondFactor";
import { currentStaff, safeAdminNext } from "@/lib/staff";

export const metadata: Metadata = { title: "Two-step sign-in", robots: { index: false, follow: false } };

export default async function AdminVerifyPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeAdminNext((await searchParams).next);
  const { staff, signedIn } = await currentStaff();
  if (!signedIn) redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  if (!staff) notFound();
  if (!staff.fresh) redirect(`/admin/login?next=${encodeURIComponent(next)}&expired=1`);
  if (staff.secondFactor === "needs_enrolment") redirect(`/admin/security?next=${encodeURIComponent(next)}`);
  if (staff.secondFactor !== "needs_code") redirect(next);
  return <div className={styles.login}>
    <p className={styles.label}>VEXA website</p>
    <h1>Two-step sign-in</h1>
    <p className={styles.muted}>Enter the six-digit code from your authenticator app for {staff.email}.</p>
    <VerifyForm next={next} />
  </div>;
}
