import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/components/ResetForm";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  return (
    <section className="auth">
      <div className="wrap">
        {token ? (
          <ResetForm token={token} />
        ) : (
          <div className="auth-card">
            <h1 className="auth-title">This link is incomplete</h1>
            <p className="muted">Open the link from your email again, or ask for a new one.</p>
            <Link className="btn" href="/forgot-password">Request a new link <span className="arr" aria-hidden="true">→</span></Link>
          </div>
        )}
      </div>
    </section>
  );
}
