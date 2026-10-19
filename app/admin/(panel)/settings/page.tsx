export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { ActionButton } from "@/components/admin/actions";
import { Header, LoadError, when } from "@/components/admin/ui";
import { deliveryStats } from "@/lib/admin-data";
import { mailEnabled } from "@/lib/account-mail";
import { googleEnabled } from "@/lib/auth";
import { scanFallback } from "@/lib/enquiries";
import { registrationOpen } from "@/lib/settings";
import { secondFactorKeyStatus, secondFactorRequiredForAll, staffTwoStepCounts } from "@/lib/second-factor";
import { STAFF_FRESH_MS, staffPage } from "@/lib/staff";

export const metadata: Metadata = { title: "Settings" };
const yes = (value: boolean) => (value ? "Configured" : "Not configured");
const KEY_TEXT = { configured: "Configured", too_short: "Set but shorter than 32 characters: two-step sign-in is unavailable", missing: "Missing: two-step sign-in is unavailable, so staff cannot use the admin area", preview_fallback: "Local preview: derived from NEXTAUTH_SECRET (never used in production)" } as const;

export default async function Settings() {
  const staff = await staffPage("settings", "/admin/settings");
  let data: { open: boolean; delivery: ReturnType<typeof deliveryStats>; fallback: ReturnType<typeof scanFallback> } | null = null;
  try { data = { open: registrationOpen(), delivery: deliveryStats(), fallback: scanFallback() }; } catch { data = null; }
  const required = secondFactorRequiredForAll();
  const keys = secondFactorKeyStatus();
  let counts: ReturnType<typeof staffTwoStepCounts> | null = null;
  try { counts = staffTwoStepCounts(); } catch { counts = null; }
  return <>
    <Header title="Settings" intro="Operational status and the few switches that are safe to change from a browser. Secrets and server configuration are never shown or edited here." />
    <div className={styles.two}>
      <div>
        <section className={styles.panel}><h2>Where enquiries go</h2>
          {!data ? <LoadError what="Delivery status" /> : <dl className={styles.dl}>
            <dt>Primary store</dt><dd>The website database (table <code>briefs</code>). Every message appears under <Link href="/admin/enquiries">Enquiries</Link>.</dd>
            <dt>Fallback file</dt><dd>{data.fallback.exists ? `${data.fallback.readable.length} line(s); ${data.fallback.pending.length} not yet imported${data.fallback.unreadable ? `; ${data.fallback.unreadable} unreadable` : ""}` : "Not used so far (no file)"}</dd>
            <dt>Notification webhook</dt><dd>{yes(Boolean(process.env.CONTACT_WEBHOOK_URL))}{process.env.CONTACT_WEBHOOK_URL ? ` · token ${process.env.CONTACT_WEBHOOK_TOKEN ? "set" : "not set"}` : ""}</dd>
            <dt>Last 30 days</dt><dd>{data.delivery.length ? data.delivery.map((row) => `${row.n} ${row.status.replace(/_/g, " ")}`).join(", ") : "No enquiries"}</dd>
          </dl>}
          <p className={styles.muted} style={{ marginTop: 12 }}>The webhook address and token are set in the server&apos;s <code>.env</code> by the owner (CONTACT_WEBHOOK_URL, CONTACT_WEBHOOK_TOKEN). An enquiry is saved before any notification is attempted; a failed notification never removes it.</p>
        </section>
        <section className={styles.panel}><h2>Accounts</h2>
          {!data ? <LoadError what="Registration status" /> : <>
            <p style={{ marginBottom: 12 }}>New account registration is <strong>{data.open ? "open" : "closed"}</strong>. {data.open ? "" : "Existing readers can still sign in; new email and Google accounts are refused."}</p>
            {data.open
              ? <ActionButton endpoint="/api/admin/settings" body={{ registrationOpen: false }} label="Close registration" variant="danger" confirm={{ title: "Close new registrations?", text: "Visitors will not be able to create new reader accounts until you reopen registration. Existing accounts are unaffected.", confirmLabel: "Close registration" }} done="Registration closed." />
              : <ActionButton endpoint="/api/admin/settings" body={{ registrationOpen: true }} label="Reopen registration" variant="primary" done="Registration reopened." />}
          </>}
          <dl className={styles.dl} style={{ marginTop: 16 }}>
            <dt>Account email (verification, recovery)</dt><dd>{yes(mailEnabled)}</dd>
            <dt>Google sign-in</dt><dd>{googleEnabled ? "Enabled" : "Disabled"}</dd>
            <dt>Comment moderation</dt><dd>Always on: every new or edited comment waits for review.</dd>
            <dt>Client address detection</dt><dd>{process.env.VEXA_TRUST_PROXY === "1" ? "Trusted proxy header in use" : "Off: all visitors share one rate-limit bucket"}</dd>
          </dl>
          {process.env.VEXA_TRUST_PROXY !== "1" ? <p className={styles.warn} style={{ marginTop: 12 }}>Rate limits are currently shared by all visitors. Once the owner confirms Traefik overwrites X-Real-IP and the container is not reachable directly, set VEXA_TRUST_PROXY=1 in the server <code>.env</code>.</p> : null}
        </section>
      </div>
      <div>
        <section className={styles.panel}><h2>Your admin session</h2>
          <dl className={styles.dl}>
            <dt>Signed in as</dt><dd>{staff.email}</dd>
            <dt>Role</dt><dd>{staff.role === "admin" ? "Administrator" : "Moderator"}</dd>
            <dt>Signed in</dt><dd>{when(staff.authTime ? new Date(staff.authTime).toISOString() : null)}</dd>
            <dt>Admin access until</dt><dd>{when(staff.authTime ? new Date(staff.authTime + STAFF_FRESH_MS).toISOString() : null)}</dd>
            <dt>Two-step sign-in</dt><dd>{staff.secondFactor === "verified" ? "On; this session passed the code" : "Not set up"} · <Link href="/admin/security">Manage</Link></dd>
          </dl>
          <div style={{ marginTop: 12 }}><Link href={`/admin/users/${staff.id}`}>Your account and sessions</Link></div>
        </section>
        <section className={styles.panel}><h2>Two-step sign-in policy</h2>
          <dl className={styles.dl}>
            <dt>Enrolment</dt><dd>{required ? "Required for every staff account" : "Relaxed (STAFF_TOTP_REQUIRED=false): staff who have not enrolled can use the admin area with a password only"}</dd>
            <dt>Encryption key</dt><dd>{KEY_TEXT[keys.key]}{keys.rotating ? " · rotation in progress (previous key still accepted)" : ""}</dd>
            <dt>Staff enrolled</dt><dd>{counts ? `${counts.enrolled} of ${counts.staff} active staff accounts` : "Could not be loaded"}</dd>
            <dt>Code attempts</dt><dd>6 per 15 minutes and 30 a day per account</dd>
          </dl>
          {!required ? <p className={styles.warn} style={{ marginTop: 12 }}>Enrolment is relaxed. Remove STAFF_TOTP_REQUIRED=false from the server <code>.env</code> and restart once staff have enrolled.</p> : null}
          {keys.key === "missing" || keys.key === "too_short" ? <p className={styles.errorState} style={{ marginTop: 12 }}>Set STAFF_TOTP_KEY (32+ random characters) in the server <code>.env</code> and restart.</p> : null}
        </section>
        <section className={styles.panel}><h2>Managed on the server, not here</h2>
          <div className={styles.prose}>
            <p><strong>Administrators</strong> are granted or removed only with <code>scripts/provision-admin.mjs</code> on the server.</p>
            <p><strong>Secrets</strong> (NEXTAUTH_SECRET, webhook tokens, Google client), the data directory and deployment settings live in <code>/opt/vexa/site/.env</code> and Compose. Change them over the owner&apos;s SSH access and restart the container.</p>
            <p><strong>Backups:</strong> <code>docker exec vexa-site node scripts/backup-db.mjs</code>. See docs/admin/ADMIN.md.</p>
          </div>
        </section>
      </div>
    </div>
  </>;
}
