export const dynamic = "force-dynamic";
import { error, readBody } from "@/lib/account-security";
import { audit } from "@/lib/audit";
import { registrationOpen, setRegistrationOpen } from "@/lib/settings";
import { actorOf, ok, staffApi } from "@/lib/staff";

// The only browser-editable settings. Secrets, paths and server configuration are deliberately not here.
export async function POST(request: Request) {
  const { staff, response } = await staffApi(request, "settings");
  if (response) return response;
  let body: Record<string, unknown>;
  try { body = await readBody(request); } catch { return error("Invalid request."); }
  if (typeof body.registrationOpen !== "boolean") return error("Unknown setting.");
  if (registrationOpen() === body.registrationOpen) return ok();
  setRegistrationOpen(body.registrationOpen, staff.id);
  audit(actorOf(staff), "settings.registration", null, { open: body.registrationOpen });
  return ok();
}
