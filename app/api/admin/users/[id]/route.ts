export const dynamic = "force-dynamic";
import { error, readBody } from "@/lib/account-security";
import { allowAttempt, endAllReaderSessions, readerById } from "@/lib/accounts";
import { deliverAccountLink, mailEnabled } from "@/lib/account-mail";
import { deleteReader, setDisabled } from "@/lib/admin-data";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { actorOf, ok, staffApi, UUID } from "@/lib/staff";

type Context = { params: Promise<{ id: string }> };

/**
 * Account administration. Administrator rights themselves are never granted or removed here (server command only),
 * and an administrator cannot disable or delete their own account or another administrator's from the browser.
 */
export async function POST(request: Request, { params }: Context) {
  const { staff, response } = await staffApi(request, "users");
  if (response) return response;
  const id = (await params).id;
  const target = UUID.test(id) ? readerById(id) : null;
  if (!target) return error("Account not found.", 404);
  let body: Record<string, unknown>;
  try { body = await readBody(request); } catch { return error("Invalid request."); }
  const actor = actorOf(staff);
  const self = target.id === staff.id;
  const ref = { type: "user", id: target.id };
  const action = body.action;

  if (action === "revoke-sessions") {
    const ended = endAllReaderSessions(target.id);
    audit(actor, "user.revoke_sessions", ref, { sessions: ended, own: self || undefined });
    return ok({ sessions: ended });
  }
  if (self) return error("You cannot change your own account from here.", 403);
  if (target.admin && action !== "send-reset" && action !== "send-verification") return error("Administrator accounts are changed with the server command described in the admin guide.", 403);

  if (action === "disable" || action === "reactivate") {
    const disable = action === "disable";
    if (Boolean(target.disabled_at) === disable) return ok();
    setDisabled(target, disable);
    audit(actor, disable ? "user.disable" : "user.reactivate", ref);
    return ok();
  }
  if (action === "grant-moderator" || action === "revoke-moderator") {
    const grant = action === "grant-moderator";
    if (grant && target.disabled_at) return error("Reactivate the account first.", 409);
    if (Boolean(target.moderator) === grant) return ok();
    getDb().transaction(() => {
      getDb().prepare("UPDATE readers SET moderator = ? WHERE id = ?").run(grant ? 1 : 0, target.id);
      // Removing a role takes effect immediately rather than at the next sign-in.
      if (!grant) endAllReaderSessions(target.id);
      audit(actor, grant ? "user.grant_moderator" : "user.revoke_moderator", ref);
    })();
    return ok();
  }
  if (action === "send-reset" || action === "send-verification") {
    const reset = action === "send-reset";
    if (!mailEnabled) return error("Account email delivery is not configured on this server.", 409);
    if (!target.password_hash) return error("This account signs in with Google; there is no password to reset.", 409);
    if (!reset && target.email_verified) return error("This email address is already verified.", 409);
    if (target.disabled_at) return error("Reactivate the account first.", 409);
    if (!allowAttempt(`admin-mail:${target.id}`, 3, 3600_000)) return error("Three emails have been sent to this account in the last hour. Try later.", 429);
    try {
      // The link goes only to the account's own inbox; it is never shown to or stored for the administrator.
      await deliverAccountLink(target, reset ? "reset" : "verify");
    } catch {
      return error("The email could not be sent. Check the mail service and try again.", 502);
    }
    audit(actor, reset ? "user.send_reset" : "user.send_verification", ref);
    return ok({ message: "Email sent to the account's address." });
  }
  if (action === "delete") {
    if (typeof body.confirmEmail !== "string" || body.confirmEmail.trim().toLowerCase() !== target.email) return error("Type the account's email address exactly to confirm deletion.");
    const { comments } = deleteReader(target);
    audit(actor, "user.delete", ref, { comments });
    return ok({ deleted: true });
  }
  return error("Unknown action.");
}
