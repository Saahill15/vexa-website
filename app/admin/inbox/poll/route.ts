import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { mailConfigured, pollMail } from "@/lib/gmail";

/** A short fingerprint of the mail inbox, for the page to notice new mail. Admins only. */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") return new NextResponse("Not found", { status: 404 });
  if (!mailConfigured()) return NextResponse.json({ ok: false });
  try {
    return NextResponse.json({ ok: true, ...(await pollMail()) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false }, { headers: { "Cache-Control": "no-store" } });
  }
}
