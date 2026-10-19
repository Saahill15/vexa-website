export const dynamic = "force-dynamic";
import { error, readBody } from "@/lib/account-security";
import { audit } from "@/lib/audit";
import { SecondFactorUnavailable, verifySecondFactor } from "@/lib/second-factor";
import { codeAttemptLimited, codeInput } from "@/lib/second-factor-api";
import { actorOf, ok, staffApi } from "@/lib/staff";

// Turns a password (or Google) staff session into a two-step verified one, with an app code or a recovery code.
export async function POST(request: Request) {
  const { staff, sessionId, response } = await staffApi(request, "dashboard", { secondFactor: false });
  if (response) return response;
  if (staff.secondFactor === "verified") return ok();
  if (staff.secondFactor !== "needs_code") return error("Two-step sign-in is not set up for this account.", 409);
  let body: Record<string, unknown>;
  try { body = await readBody(request); } catch { return error("Invalid request."); }
  const code = codeInput(body);
  if (!code) return error("Enter the code from your authenticator app or a recovery code.");
  const limited = codeAttemptLimited(staff, "verify");
  if (limited) return limited;
  try {
    const result = await verifySecondFactor(staff.id, sessionId, code);
    if (!result.ok) {
      audit(actorOf(staff), "auth.second_factor_failed", { type: "user", id: staff.id }, { purpose: "verify" });
      return error("That code did not work. Use the newest code from your app, or an unused recovery code.");
    }
    audit(actorOf(staff), "auth.second_factor", { type: "user", id: staff.id }, { method: result.method, ...(result.method === "recovery" ? { remaining: result.recoveryCodesLeft } : {}) });
    return ok({ method: result.method, recoveryCodesLeft: result.recoveryCodesLeft });
  } catch (cause) {
    if (cause instanceof SecondFactorUnavailable) return error("Your two-step key cannot be read on this server. Ask the site owner to reset two-step sign-in for your account.", 503);
    throw cause;
  }
}
