import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { folderCounts, mailConfigured } from "@/lib/gmail";

/** Unread numbers per folder, for the sidebar to show unread folders in bold. Admins only. */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") return new NextResponse("Not found", { status: 404 });
  if (!mailConfigured()) return NextResponse.json({});
  try {
    const { drafts, spam, ...unread } = await folderCounts(); // those two are totals, not unread
    void drafts;
    void spam;
    return NextResponse.json(unread, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({}, { headers: { "Cache-Control": "no-store" } });
  }
}
