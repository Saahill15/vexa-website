export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";
import { SignOut } from "@/components/admin/actions";
import { EnrolForm } from "@/components/admin/SecondFactor";
import { Header, LoadError, params, when, type SearchParams } from "@/components/admin/ui";
import { secondFactorRequiredForAll, secondFactorStatus, type SecondFactorStatus } from "@/lib/second-factor";
import { safeAdminNext, staffPage } from "@/lib/staff";

export const metadata: Metadata = { title: "Two-step sign-in" };

// Reachable before two-step sign-in is done, because staff who must enrol are sent here. Someone already
// enrolled must pass their current code first, so a stolen password alone cannot replace the authenticator.
export default async function Security({ searchParams }: { searchParams: SearchParams }) {
  const query = await params(searchParams);
  const next = query.next ? safeAdminNext(query.next) : null;
  const staff = await staffPage("dashboard", "/admin/security", { secondFactor: false });
  if (staff.secondFactor === "needs_code") redirect(`/admin/verify?next=${encodeURIComponent("/admin/security")}`);
  let status: SecondFactorStatus | null = null;
  try { status = secondFactorStatus(staff.id); } catch { status = null; }
  const required = secondFactorRequiredForAll();
  const framed = staff.secondFactor !== "needs_enrolment";
  return <div className={framed ? undefined : styles.login} style={framed ? undefined : { maxWidth: 720 }}>
    <Header title="Two-step sign-in" intro="A code from an authenticator app on your phone, asked for after your password on each new admin sign-in." />
    {staff.secondFactor === "needs_enrolment" ? <p className={styles.warn} role="alert">Two-step sign-in is required for staff accounts on this site. Set it up to continue to the admin area. <SignOut /></p> : null}
    {!status ? <LoadError what="Two-step status" /> : <div className={styles.two}>
      <section className={styles.panel}>
        <h2>{status.enrolled ? "On" : "Not set up"}</h2>
        {status.enrolled ? <>
          <dl className={styles.dl} style={{ marginBottom: 16 }}>
            <dt>Turned on</dt><dd>{when(status.enabledAt)}</dd>
            <dt>Recovery codes left</dt><dd>{status.recoveryCodesLeft} of 10</dd>
          </dl>
          {status.recoveryCodesLeft <= 3 ? <p className={styles.warn}>Few recovery codes left. Replace them below.</p> : null}
          <p className={styles.muted} style={{ marginBottom: 12 }}>New phone, or codes running out? Replacing creates a new key and ten new recovery codes; the old ones stop working, and your other signed-in browsers must enter a code again.</p>
          <EnrolForm replacing next={null} />
        </> : <>
          <p style={{ marginBottom: 12 }}>{required ? "Required for all staff." : "Optional for now. Once you turn it on, every admin sign-in to your account needs a code, and your current password-only sessions must enter one."}</p>
          <EnrolForm replacing={false} next={next} />
        </>}
      </section>
      <section className={styles.panel}>
        <h2>If you lose your phone</h2>
        <div className={styles.prose}>
          <p>Sign in with your password, choose <strong>Use a recovery code</strong>, then replace your authenticator here.</p>
          <p>No phone and no recovery codes: ask the site owner to reset two-step sign-in for your account with the server command in the admin guide. It also signs you out everywhere.</p>
        </div>
      </section>
    </div>}
  </div>;
}
