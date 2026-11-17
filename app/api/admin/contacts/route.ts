import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { searchContacts } from "@/lib/contacts";
import { ADDRESSES } from "@/lib/gmail";

export const dynamic = "force-dynamic";

/** Address suggestions for the compose window. Admins only: anyone else gets the same 404 as any other admin path. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return new NextResponse(null, { status: 404 });
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const contacts = await searchContacts(q, Object.values(ADDRESSES));
  return NextResponse.json({ contacts }, { headers: { "Cache-Control": "private, no-store" } });
}
