export const dynamic = "force-dynamic";
import { error, readBody } from "@/lib/account-security";
import { addNote, assignableStaff, getEnquiry } from "@/lib/admin-data";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { isEnquiryStatus, notifyWebhook, recordWebhook } from "@/lib/enquiries";
import { actorOf, intParam, ok, staffApi } from "@/lib/staff";

type Context = { params: Promise<{ id: string }> };

// One endpoint per enquiry; each action reads only the fields it names, so no other column can be written.
export async function POST(request: Request, { params }: Context) {
  const { staff, response } = await staffApi(request, "enquiries");
  if (response) return response;
  const id = intParam((await params).id, 0);
  const enquiry = getEnquiry(id);
  if (!enquiry) return error("Enquiry not found.", 404);
  let body: Record<string, unknown>;
  try { body = await readBody(request); } catch { return error("Invalid request."); }
  const actor = actorOf(staff);
  const now = new Date().toISOString();

  if (body.action === "status") {
    if (!isEnquiryStatus(body.status)) return error("Choose a valid status.");
    if (body.status === enquiry.status) return ok();
    getDb().transaction(() => {
      getDb().prepare("UPDATE briefs SET status = ?, updated_at = ? WHERE id = ?").run(body.status, now, id);
      audit(actor, "enquiry.status", { type: "enquiry", id }, { from: enquiry.status, to: String(body.status) });
    })();
    return ok();
  }
  if (body.action === "assign") {
    const to = body.assignedTo === null || body.assignedTo === "" ? null : String(body.assignedTo);
    const owner = to ? assignableStaff().find((person) => person.id === to) : null;
    if (to && !owner) return error("Choose an active administrator.");
    getDb().transaction(() => {
      getDb().prepare("UPDATE briefs SET assigned_to = ?, updated_at = ? WHERE id = ?").run(to, now, id);
      audit(actor, "enquiry.assign", { type: "enquiry", id }, { to: owner?.label ?? "unassigned" });
    })();
    return ok();
  }
  if (body.action === "note") {
    const text = typeof body.body === "string" ? body.body.trim() : "";
    if (text.length < 1 || text.length > 4000) return error("Write a note of up to 4,000 characters.");
    addNote("enquiry", id, actor, text);
    return ok();
  }
  if (body.action === "retry-webhook") {
    const result = await notifyWebhook({ at: enquiry.created_at, name: enquiry.name, email: enquiry.email, role: enquiry.role ?? "other", interest: enquiry.interest, company: enquiry.company, problem: enquiry.problem, budget: enquiry.budget, launch: enquiry.launch, source: enquiry.source, consent: Boolean(enquiry.consent) });
    if (result.status === "not_configured") return error("No notification webhook is configured.", 409);
    recordWebhook(id, result);
    audit(actor, "enquiry.webhook_retry", { type: "enquiry", id }, { result: result.status });
    return result.status === "delivered" ? ok({ message: "Notification delivered." }) : error(`Notification failed again (${result.detail}).`, 502);
  }
  return error("Unknown action.");
}
