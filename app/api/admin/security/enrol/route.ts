export const dynamic = "force-dynamic";
import { error, readBody } from "@/lib/account-security";
import { notifyStaffSecurity } from "@/lib/account-mail";
import { audit } from "@/lib/audit";
import { confirmEnrolment, SecondFactorUnavailable, startEnrolment } from "@/lib/second-factor";
import { codeAttemptLimited, codeInput } from "@/lib/second-factor-api";
import { actorOf, ok, secondFactorRefusal, staffApi } from "@/lib/staff";

// Two-step enrolment for the signed-in staff member only; there is no way to enrol or change someone else.
// Replacing an existing authenticator needs a session that already passed the current one.
export async function POST(request: Request) {
  const { staff, sessionId, response } = await staffApi(request, "dashboard", { secondFactor: false });
  if (response) return response;
  if (staff.secondFactor === "needs_code") return secondFactorRefusal(staff)!;
  let body: Record<string, unknown>;
  try { body = await readBody(request); } catch { return error("Invalid request."); }
  try {
    if (body.action === "start") return ok(startEnrolment(staff.id, staff.email));
    if (body.action !== "confirm") return error("Unknown action.");
    const code = codeInput(body);
    if (!code) return error("Enter the six-digit code from your authenticator app.");
    const limited = codeAttemptLimited(staff, "enrol");
    if (limited) return limited;
    const result = await confirmEnrolment(staff.id, sessionId, code);
    if (!result.ok) {
      if (result.reason === "wrong_code") {
        audit(actorOf(staff), "auth.second_factor_failed", { type: "user", id: staff.id }, { purpose: "enrol" });
        return error("That code did not match. Check the time on your phone and try the newest code.");
      }
      return error(result.reason === "expired" ? "Set-up timed out. Start again to get a new key." : "Start set-up first.", 409);
    }
    const event = result.replaced ? "totp_replaced" : "totp_enrolled";
    const notified = await notifyStaffSecurity(staff, event);
    audit(actorOf(staff), `staff.${event}`, { type: "user", id: staff.id }, { codes: result.recoveryCodes.length, notified });
    return ok({ recoveryCodes: result.recoveryCodes });
  } catch (cause) {
    if (cause instanceof SecondFactorUnavailable) return error("Two-step sign-in is not available on this server. Ask the site owner to check its configuration.", 503);
    throw cause;
  }
}
