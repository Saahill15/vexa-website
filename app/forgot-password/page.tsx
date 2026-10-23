import type { Metadata } from "next";
import { ForgotForm } from "@/components/ForgotForm";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <section className="auth">
      <div className="wrap">
        <ForgotForm />
      </div>
    </section>
  );
}
