import { mkdir, appendFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

type ContactBody = {
  name?: string;
  email?: string;
  company?: string;
  problem?: string;
  source?: string;
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

  if (!name || !email || !company || !problem) {
    return NextResponse.json(
      { ok: false, error: "Name, work email, company, and business problem are required." },
      { status: 400 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid work email." }, { status: 400 });
  }

  const entry = {
    at: new Date().toISOString(),
    name,
    email,
    company,
    problem,
    source: source || null,
  };

  const dir = path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "contact-submissions.jsonl"), `${JSON.stringify(entry)}\n`, "utf8");

  return NextResponse.json({ ok: true });
}
