import { getSession } from "@/lib/auth";
import { AUDIT_ACTIONS, queryAudit, type AuditAction } from "@/lib/audit";
import { istDate } from "@/lib/time";

// a cell that starts with = + - or @ can run as a formula in a spreadsheet, so it is prefixed with a quote
const cell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return new Response("Not found", { status: 404 });
  const p = new URL(request.url).searchParams;
  const { rows } = await queryAudit({ group: p.get("group") ?? "all", range: p.get("range") ?? "week", q: p.get("q") ?? "", page: 1, perPage: 5000 });
  const lines = [["Time (UTC)", "Who", "What happened", "Target", "Details", "IP", "Browser"], ...rows.map((r) => [r.at, r.actor, AUDIT_ACTIONS[r.action as AuditAction] ?? r.action, r.target, r.detail, r.ip, r.agent])];
  return new Response(lines.map((l) => l.map(cell).join(",")).join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="vexa-activity-log-${istDate()}.csv"`, "Cache-Control": "private, no-store" },
  });
}
