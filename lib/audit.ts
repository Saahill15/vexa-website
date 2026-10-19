import { getDb } from "@/lib/db";

export type AuditActor = { id: string | null; label: string };
type Meta = Record<string, string | number | boolean | null | undefined>;

// Metadata is limited to short scalar values so credentials, tokens or whole messages cannot be logged by accident.
const FORBIDDEN = /pass|token|secret|hash|session|cookie|authorization|link/i;
function safeMetadata(metadata: Meta | undefined): string | null {
  if (!metadata) return null;
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || FORBIDDEN.test(key)) continue;
    clean[key.slice(0, 40)] = typeof value === "string" ? value.slice(0, 160) : value;
  }
  return Object.keys(clean).length ? JSON.stringify(clean) : null;
}

/** Append-only: the table rejects UPDATE and DELETE at the database level. */
export function audit(actor: AuditActor, action: string, target?: { type: string; id: string | number } | null, metadata?: Meta): void {
  getDb()
    .prepare("INSERT INTO admin_audit (at, actor_id, actor_label, action, target_type, target_id, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(new Date().toISOString(), actor.id, actor.label.slice(0, 254), action, target?.type ?? null, target ? String(target.id) : null, safeMetadata(metadata));
}

export type AuditRow = { id: number; at: string; actor_id: string | null; actor_label: string; action: string; target_type: string | null; target_id: string | null; metadata: string | null };

export function auditFor(type: string, id: string | number, limit = 50): AuditRow[] {
  return getDb().prepare("SELECT * FROM admin_audit WHERE target_type = ? AND target_id = ? ORDER BY id DESC LIMIT ?").all(type, String(id), limit) as AuditRow[];
}

export const AUDIT_LABELS: Record<string, string> = {
  "auth.sign_in": "Staff sign-in",
  "auth.sign_in_failed": "Failed staff sign-in",
  "auth.sign_in_blocked": "Sign-in refused for a disabled account",
  "admin.access_denied": "Admin access refused",
  "auth.second_factor": "Two-step code accepted",
  "auth.second_factor_failed": "Wrong two-step code",
  "auth.second_factor_limited": "Two-step attempts rate-limited",
  "staff.totp_enrolled": "Two-step sign-in set up",
  "staff.totp_replaced": "Authenticator and recovery codes replaced",
  "staff.totp_reset": "Two-step sign-in reset by server command",
  "enquiry.status": "Enquiry status changed",
  "enquiry.assign": "Enquiry assignment changed",
  "enquiry.note": "Internal note added",
  "enquiry.webhook_retry": "Notification resent",
  "enquiry.fallback_import": "Fallback submissions imported",
  "lead.status": "Lead status changed",
  "lead.note": "Internal note added",
  "lead.export": "Leads exported",
  "user.disable": "Account disabled",
  "user.reactivate": "Account reactivated",
  "user.revoke_sessions": "Sessions revoked",
  "user.send_reset": "Password reset email sent",
  "user.send_verification": "Verification email sent",
  "user.grant_moderator": "Moderator role granted",
  "user.revoke_moderator": "Moderator role removed",
  "user.grant_admin": "Administrator role granted",
  "user.revoke_admin": "Administrator role removed",
  "user.delete": "Account deleted",
  "comment.approved": "Comment approved",
  "comment.rejected": "Comment rejected",
  "comment.removed": "Comment removed",
  "article.unpublish": "Article unpublished",
  "article.publish": "Article published again",
  "settings.registration": "Registration setting changed",
};
