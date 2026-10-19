export const dynamic = "force-dynamic";
import { error } from "@/lib/account-security";
import { audit } from "@/lib/audit";
import { importFallback } from "@/lib/enquiries";
import { actorOf, ok, staffApi } from "@/lib/staff";

/** Copies fallback-file submissions into briefs. Idempotent; the file itself is never modified. */
export async function POST(request: Request) {
  const { staff, response } = await staffApi(request, "enquiries");
  if (response) return response;
  try {
    const result = importFallback();
    audit(actorOf(staff), "enquiry.fallback_import", null, result);
    return ok(result);
  } catch {
    return error("The fallback file could not be imported. Nothing was changed.", 500);
  }
}
