import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAttachment, MailError } from "@/lib/gmail";

/**
 * Downloads one mail attachment, for admins only. It is always sent as a download (never opened in the browser), with a
 * generic file type, so a file can never run as part of the site. Programs and very large files are refused.
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return new NextResponse("Not found", { status: 404 });
  const url = new URL(request.url);
  try {
    const file = await getAttachment(url.searchParams.get("message") ?? "", url.searchParams.get("attachment") ?? "");
    const safe = file.name.replace(/[^\w.() -]+/g, "_").slice(0, 120) || "attachment";
    return new NextResponse(new Uint8Array(file.data), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (error) {
    return new NextResponse(error instanceof MailError ? error.message : "The attachment could not be downloaded.", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
