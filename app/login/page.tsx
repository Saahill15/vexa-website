import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";
import { safeNext } from "@/lib/session";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);
  return (
    <section className="auth">
      <div className="wrap">
        <AuthForm mode="login" next={next} googleClientId={process.env.GOOGLE_CLIENT_ID ?? null} devNote={process.env.NODE_ENV !== "production"} />
      </div>
    </section>
  );
}
