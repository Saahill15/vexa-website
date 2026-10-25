import { NextResponse } from "next/server";
import { acceptEnquiry } from "@/lib/enquiries";
import { clientIp, readBody, sameOrigin } from "@/lib/http";
import { peekLimit, tooMany } from "@/lib/ratelimit";
import { SITE } from "@/lib/site";
import { istIso } from "@/lib/time";

const ROLES = ["brand", "organisation", "other"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This form can only be sent from the Vexa website.", 403);

  const ip = clientIp(request);
  // 5 accepted enquiries an hour per address (a refused attempt does not count against it)
  if (await peekLimit(`contact:${ip}`, 5, 3600_000)) return fail("You have sent a few messages already. Please wait an hour, or email us directly.", 429);

  let body: Record<string, unknown>;
  try {
    const raw = await readBody(request, 20_000);
    if (raw === null) return fail("The message is too long.", 413);
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("not an object");
  } catch {
    return fail("The form could not be read. Please try again.");
  }

  // honeypot: people never see this field, so anything in it is a bot. Pretend it worked.
  if (text(body.website, 200)) return NextResponse.json({ ok: true });

  const role = text(body.role, 40);
  const problem = text(body.problem, 2000);
  const email = text(body.email, 254);
  if (!ROLES.includes(role)) return fail("Choose the description that fits you.");
  if (!problem) return fail("Tell us a little about what you have in mind.");
  if (!EMAIL.test(email)) return fail("Enter a full email address so we can reply.");
  if (body.consent !== true) return fail("Tick the box so we can use these details to reply.");

  const ok = await acceptEnquiry({
    at: istIso(),
    name: text(body.name, 80) || null,
    email,
    role,
    interest: text(body.interest, 300) || null,
    company: text(body.company, 120) || null,
    problem,
    budget: null,
    launch: text(body.timing, 80) || null,
    source: null,
    consent: true,
  });
  if (!ok) return fail(`Your message did not send. Please try again in a few minutes, or email ${SITE.email}.`, 503);
  await tooMany(`contact:${ip}`, 5, 3600_000);
  return NextResponse.json({ ok: true });
}
