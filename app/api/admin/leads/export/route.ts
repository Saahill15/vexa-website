export const dynamic = "force-dynamic";
import { readBody } from "@/lib/account-security";
import { leadsCsv } from "@/lib/admin-data";
import { audit } from "@/lib/audit";
import { actorOf, staffApi } from "@/lib/staff";

// POST rather than a GET link: the same-origin check applies and a cross-site page cannot trigger an export.
export async function POST(request: Request) {
  const { staff, response } = await staffApi(request, "leads");
  if (response) return response;
  let body: Record<string, unknown> = {};
  try { body = await readBody(request); } catch { /* export everything when no filter is sent */ }
  const text = (key: string) => (typeof body[key] === "string" ? (body[key] as string) : undefined);
  const filter = { q: text("q"), role: text("role"), source: text("source"), consent: text("consent"), status: text("status") };
  const { csv, count } = leadsCsv(filter);
  audit(actorOf(staff), "lead.export", null, { rows: count, filtered: Object.values(filter).some(Boolean) });
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="vexa-leads-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
}
