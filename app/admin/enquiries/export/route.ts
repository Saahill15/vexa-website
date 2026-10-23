import { getSession } from "@/lib/auth";
import { listEnquiries } from "@/lib/enquiries";
import { ROLE_LABEL } from "@/lib/format";
import { istDate } from "@/lib/time";

// a cell that starts with = + - or @ can run as a formula in a spreadsheet, so it is prefixed with a quote
const cell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") return new Response("Not found", { status: 404 });
  const rows = await listEnquiries();
  const head = ["Received", "Status", "Name", "Email", "Is", "Interested in", "Company", "Timing", "Message", "Notes", "Inbox email"];
  const lines = [head, ...rows.map((e) => [e.at, e.status, e.name, e.email, ROLE_LABEL[e.role] ?? e.role, e.interest, e.company, e.launch, e.problem, e.notes, e.emailed])].map((r) => r.map(cell).join(","));
  return new Response("﻿" + lines.join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="vexa-enquiries-${istDate()}.csv"`, "Cache-Control": "no-store" },
  });
}
