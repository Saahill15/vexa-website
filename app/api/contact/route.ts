import { allowClient } from "@/lib/accounts";
import { mutationGuard, readBody, requestIp } from "@/lib/account-security";
import { NextResponse } from "next/server";
import { acceptEnquiry } from "@/lib/enquiries";
import { SITE } from "@/lib/site";

type ContactBody = {
  name?: string;
  email?: string;
  company?: string;
  problem?: string;
  source?: string;
  role?: string;
  budget?: string;
  launch?: string;
  consent?: boolean;
  interest?: string;
  website?: string;
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request): Promise<NextResponse> {
  const blocked=mutationGuard(request);if(blocked)return blocked;
  if(!allowClient(requestIp(request),"contact",10,200,3600_000))return NextResponse.json({ok:false,error:"Please wait an hour before sending another brief."},{status:429});
  let body: ContactBody;
  try {
    body = (await readBody(request)) as ContactBody;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid request");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  const problem = String(body.problem ?? "").trim().slice(0, 5000);
  const source = String(body.source ?? "").trim();
  const role = String(body.role ?? "").trim();
  const budget = String(body.budget ?? "").trim();
  const launch = String(body.launch ?? "").trim();
  const consent = body.consent === true;
  const interest = String(body.interest ?? "").trim().slice(0, 300);

  // Honeypot: people never see this field, so anything in it is a bot. Pretend success.
  if (String(body.website ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  if (!email || !role || !problem) {
    return NextResponse.json(
      { ok: false, error: "Email, who you are and your brief are required." },
      { status: 400 },
    );
  }
  if (!["brand", "organisation", "other"].includes(role)) {
    return NextResponse.json({ ok: false, error: "Choose who you are." }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json(
      { ok: false, error: "Tick the box to let us use these details to reply to your brief." },
      { status: 400 },
    );
  }
  if (email.length>254 || name.length>120 || company.length>200 || source.length>300 || budget.length>100 || launch.length>100 || !isEmail(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }

  const entry = {
    at: new Date().toISOString(),
    name: name || null,
    email,
    role,
    interest: interest || null,
    company: company || null,
    problem,
    budget: budget || null,
    launch: launch || null,
    source: source || null,
    consent,
  };

  const result = await acceptEnquiry(entry);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: `We could not save your message. Please try again in a few minutes, or email ${SITE.email}.` },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
