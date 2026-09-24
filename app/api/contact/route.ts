import { mkdir, appendFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

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
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  const problem = String(body.problem ?? "").trim();
  const source = String(body.source ?? "").trim();
  const role = String(body.role ?? "").trim();
  const budget = String(body.budget ?? "").trim();
  const launch = String(body.launch ?? "").trim();
  const consent = body.consent === true;

  if (!email || !role || !problem) {
    return NextResponse.json(
      { ok: false, error: "Email, who you are and your brief are required." },
      { status: 400 },
    );
  }
  if (!consent) {
    return NextResponse.json(
      { ok: false, error: "Tick the box to let us use these details to reply to your brief." },
      { status: 400 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }

  const entry = {
    at: new Date().toISOString(),
    name: name || null,
    email,
    role,
    company: company || null,
    problem,
    budget: budget || null,
    launch: launch || null,
    source: source || null,
    consent,
  };

  const dir = path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "contact-submissions.jsonl"), `${JSON.stringify(entry)}\n`, "utf8");

  return NextResponse.json({ ok: true });
}
