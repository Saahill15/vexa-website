export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { currentStaff, safeAdminNext } from "@/lib/staff";

export const metadata: Metadata = { title: "Admin sign-in", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  const query = await searchParams;
  const next = safeAdminNext(query.next);
  const { staff } = await currentStaff();
  if (staff?.fresh) redirect(next);
  return <AdminLogin next={next} expired={query.expired === "1"} />;
}
