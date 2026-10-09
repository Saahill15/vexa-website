import { allowAttempt } from "@/lib/accounts";
import { mutationGuard, readBody, requestIp } from "@/lib/account-security";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, googleEnabled } from "@/lib/auth";
import { upsertLead } from "@/lib/db";
import { isEmail, isRole } from "@/lib/roles";
import { LEAD_COOKIE, makeLeadCookie, canRememberLead } from "@/lib/viewer";

type LeadBody = {
  name?: string;
  email?: string;
  role?: string;
  whatsapp?: string;
  whatsappConsent?: boolean;
  consent?: boolean;
  slug?: string;
  utm?: string;
  website?: string;
};

export async function POST(request: Request): Promise<NextResponse> {
  const blocked=mutationGuard(request);if(blocked)return blocked;
  if(!allowAttempt(`lead:${requestIp(request)}`,20,60_000))return NextResponse.json({ok:false,error:"Please wait a minute before trying again."},{status:429});

  let body: LeadBody;
  try {
    body = (await readBody(request)) as LeadBody;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid request");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people never see this field.
  if (String(body.website ?? "").trim()) return NextResponse.json({ ok: true });

  const session = googleEnabled ? await getServerSession(authOptions) : null;
  const googleEmail = session?.user?.email?.trim().toLowerCase() ?? "";
  const email = googleEmail || String(body.email ?? "").trim().toLowerCase();
  const role = String(body.role ?? "");
  const name = String(body.name ?? session?.user?.name ?? "").trim().slice(0, 120) || null;
  const whatsapp = String(body.whatsapp ?? "").replace(/[^\d+]/g, "").slice(0, 16) || null;

  if (!isEmail(email)) return NextResponse.json({ ok: false, error: "Enter a full email address, for example name@gmail.com." }, { status: 400 });
  if (!isRole(role)) return NextResponse.json({ ok: false, error: "Choose what describes you best." }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ ok: false, error: "Tick the box so we can save your details and open the sheet here." }, { status: 400 });
  if (!googleEmail && !canRememberLead()) {
    return NextResponse.json({ ok: false, error: "Email access is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  upsertLead({
    name,
    email,
    role,
    whatsapp,
    whatsappConsent: Boolean(whatsapp) && body.whatsappConsent === true,
    sourceSlug: String(body.slug ?? "").slice(0, 80) || null,
    utmSource: String(body.utm ?? "").slice(0, 80) || null,
    signedInWith: googleEmail ? "google" : "email",
  });

  const response = NextResponse.json({ ok: true });
  if (!googleEmail) {
    response.cookies.set(LEAD_COOKIE, makeLeadCookie(email), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}
