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
  interest?: string;
  website?: string;
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
    interest: interest || null,
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

  // Optional notification, for example an n8n webhook that emails Soda. See LAUNCH_NOTES.md.
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.CONTACT_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.CONTACT_WEBHOOK_TOKEN}` } : {}),
        },
        body: JSON.stringify(entry),
        signal: AbortSignal.timeout(5000),
      });
    } catch (error) {
      // The brief is already saved to disk; a failed notification must not fail the visitor.
      console.error("contact webhook failed", error);
    }
  }

  return NextResponse.json({ ok: true });
}
