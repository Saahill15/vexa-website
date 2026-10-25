import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SecondStepForm } from "@/components/SecondStepForm";
import { getSession } from "@/lib/auth";
import { listFactors } from "@/lib/mfa";

export const metadata: Metadata = { title: "Confirm it is you", robots: { index: false } };

/** Where an admin lands after the password: the second step before the admin panel opens. */
export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!session.pendingAdmin) redirect("/admin");
  const factors = await listFactors(session.id);
  return (
    <section className="auth">
      <div className="wrap">
        <SecondStepForm hasAuthenticator={factors.some((f) => f.kind === "totp")} hasPasskey={factors.some((f) => f.kind === "passkey")} />
      </div>
    </section>
  );
}
