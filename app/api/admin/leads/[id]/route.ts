export const dynamic = "force-dynamic";
import { error, readBody } from "@/lib/account-security";
import { addNote, getLead, LEAD_STATUSES } from "@/lib/admin-data";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { actorOf, intParam, ok, staffApi } from "@/lib/staff";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const { staff, response } = await staffApi(request, "leads");
  if (response) return response;
  const id = intParam((await params).id, 0);
  const lead = getLead(id);
  if (!lead) return error("Lead not found.", 404);
  let body: Record<string, unknown>;
  try { body = await readBody(request); } catch { return error("Invalid request."); }
  const actor = actorOf(staff);
  if (body.action === "status") {
    if (!LEAD_STATUSES.some((status) => status.value === body.status)) return error("Choose a valid status.");
    if (body.status === lead.status) return ok();
    getDb().transaction(() => {
      getDb().prepare("UPDATE leads SET status = ?, updated_at = ? WHERE id = ?").run(body.status, new Date().toISOString(), id);
      audit(actor, "lead.status", { type: "lead", id }, { from: lead.status, to: String(body.status) });
    })();
    return ok();
  }
  if (body.action === "note") {
    const text = typeof body.body === "string" ? body.body.trim() : "";
    if (text.length < 1 || text.length > 4000) return error("Write a note of up to 4,000 characters.");
    addNote("lead", id, actor, text);
    return ok();
  }
  return error("Unknown action.");
}
