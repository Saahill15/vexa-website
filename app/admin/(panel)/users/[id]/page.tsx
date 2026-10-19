export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";
import { ActionButton } from "@/components/admin/actions";
import { Badge, Empty, Header, LoadError, when } from "@/components/admin/ui";
import { getUser } from "@/lib/admin-data";
import { mailEnabled } from "@/lib/account-mail";
import { READER_ROLES } from "@/lib/accounts";
import { AUDIT_LABELS, auditFor } from "@/lib/audit";
import { staffPage, UUID } from "@/lib/staff";

export const metadata: Metadata = { title: "User" };

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const staff = await staffPage("users", `/admin/users/${encodeURIComponent(id)}`);
  if (!UUID.test(id)) notFound();
  let data;
  try {
    const user = getUser(id);
    data = user ? { user, history: auditFor("user", id) } : null;
  } catch {
    return <><Header title="User" back={{ href: "/admin/users", label: "Users" }} /><LoadError what="This account" /></>;
  }
  if (!data) notFound();
  const { user, history } = data;
  const endpoint = `/api/admin/users/${user.id}`;
  const self = user.id === staff.id;
  const protectedAccount = user.admin || self;
  return <>
    <Header title={user.email} intro={`Registered ${when(user.createdAt)}`} back={{ href: "/admin/users", label: "Users" }}>
      {user.disabledAt ? <Badge value="disabled" /> : <Badge value="active" />}
      {user.admin ? <Badge value="neutral" label="administrator" /> : user.moderator ? <Badge value="neutral" label="moderator" /> : null}
    </Header>
    <div className={styles.two}>
      <div>
        <section className={styles.panel}><h2>Account</h2>
          <dl className={styles.dl}>
            <dt>Display name</dt><dd>{user.name || "—"}</dd>
            <dt>Role (self-described)</dt><dd>{READER_ROLES.find((r) => r.value === user.role)?.label ?? "—"}</dd>
            <dt>Profile</dt><dd>{user.complete ? "Complete" : "Incomplete"}{user.complete && !user.disabledAt ? <> · <Link href={`/members/${user.id}`}>public profile</Link></> : null}</dd>
            <dt>Workplace details</dt><dd>{[user.job, user.organisation, user.industry].filter(Boolean).join(" · ") || "—"} <span className={styles.muted}>({user.publicDetails ? "shown publicly" : "private"})</span></dd>
            <dt>Sign-in methods</dt><dd>{[user.hasPassword ? "Email and password" : "", user.hasGoogle ? "Google" : ""].filter(Boolean).join(", ") || "—"}</dd>
            <dt>Email verified</dt><dd>{user.emailVerified ? "Yes" : "No"}</dd>
            <dt>Active sessions</dt><dd>{user.activeSessions}</dd>
            {user.admin || user.moderator ? <><dt>Two-step sign-in</dt><dd>{user.twoStep ? "On" : "Not set up"}{user.twoStep ? <span className={styles.muted}> · reset only with the server command</span> : null}</dd></> : null}
            <dt>Comments</dt><dd>{user.comments.length ? user.comments.map((c) => `${c.n} ${c.status}`).join(", ") : "None"}{user.comments.length ? <> · <Link href={`/admin/comments?status=all&q=${encodeURIComponent(user.name)}`}>view</Link></> : null}</dd>
            {user.disabledAt ? <><dt>Disabled</dt><dd>{when(user.disabledAt)}</dd></> : null}
          </dl>
        </section>
        <section className={styles.panel}><h2>Account activity</h2>
          {history.length ? <ul className={styles.history}>{history.map((row) => <li key={row.id}>{AUDIT_LABELS[row.action] ?? row.action}<div className={styles.muted}>{row.actor_label} · {when(row.at)}</div></li>)}</ul> : <Empty>No recorded administrative or staff sign-in activity for this account.</Empty>}
        </section>
      </div>
      <div>
        <section className={styles.panel}><h2>Actions</h2>
          {protectedAccount ? <p className={styles.info}>{self ? "This is your own account. You can sign out your sessions here; other changes need another administrator." : "Administrator accounts are changed with the server command in the admin guide, not from the browser."}</p> : null}
          <div className={styles.actions} style={{ flexDirection: "column", alignItems: "stretch" }}>
            <ActionButton endpoint={endpoint} body={{ action: "revoke-sessions" }} label={self ? "Sign out all my sessions" : "Revoke all sessions"} confirm={{ title: "Revoke all sessions?", text: self ? "You will be signed out everywhere, including this browser." : "This account will be signed out on every device immediately. They can sign in again unless the account is disabled.", confirmLabel: "Revoke sessions" }} done="Sessions revoked." />
            {!protectedAccount ? <>
              {user.disabledAt
                ? <ActionButton endpoint={endpoint} body={{ action: "reactivate" }} label="Reactivate account" done="Account reactivated." />
                : <ActionButton endpoint={endpoint} body={{ action: "disable" }} label="Disable account" variant="danger" confirm={{ title: "Disable this account?", text: "The person is signed out everywhere and cannot sign in. Their public profile is hidden. Their comments and data are kept, and you can reactivate the account later.", confirmLabel: "Disable account" }} done="Account disabled." />}
              {user.moderator
                ? <ActionButton endpoint={endpoint} body={{ action: "revoke-moderator" }} label="Remove moderator role" confirm={{ title: "Remove the moderator role?", text: "They lose access to comment moderation and are signed out so the change applies immediately.", confirmLabel: "Remove role" }} done="Moderator role removed." />
                : <ActionButton endpoint={endpoint} body={{ action: "grant-moderator" }} label="Make moderator" confirm={{ title: "Grant the moderator role?", text: "Moderators can approve, reject and remove comments in the admin area. They cannot see enquiries, leads or accounts.", confirmLabel: "Grant role" }} done="Moderator role granted." />}
            </> : null}
            {!self && user.hasPassword && mailEnabled && !user.disabledAt ? <ActionButton endpoint={endpoint} body={{ action: "send-reset" }} label="Send password reset email" confirm={{ title: "Send a password reset email?", text: "A single-use link valid for 30 minutes goes to the account's own address. You never see the link or the password.", confirmLabel: "Send email" }} /> : null}
            {!self && user.hasPassword && mailEnabled && !user.emailVerified && !user.disabledAt ? <ActionButton endpoint={endpoint} body={{ action: "send-verification" }} label="Resend verification email" /> : null}
          </div>
          {!mailEnabled ? <p className={styles.muted} style={{ marginTop: 12 }}>Account email is not configured on this server, so recovery emails cannot be sent from here.</p> : null}
        </section>
        {!protectedAccount ? <section className={styles.panel}><h2>Delete account</h2>
          <p className={styles.muted} style={{ marginBottom: 12 }}>Permanently deletes the account, its sessions and all of its comments. Enquiries and waiting-list entries with the same email are separate records and are not deleted. Use this for verified deletion requests; disable the account instead if you may need it again.</p>
          <ActionButton endpoint={endpoint} body={{ action: "delete" }} label="Delete account permanently" variant="danger" after="/admin/users" confirm={{ title: "Delete this account permanently?", text: "This cannot be undone. The audit log keeps only the account id.", confirmLabel: "Delete permanently", typeToConfirm: user.email }} done="Account deleted." />
        </section> : null}
      </div>
    </div>
  </>;
}
