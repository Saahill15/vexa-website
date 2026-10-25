import { db, isUuid, iso } from "./db";
import { sendNew } from "./gmail";

/*
 * Enquiries from the Start a conversation form. Each one is saved first, then sent to CONTACT_WEBHOOK_URL
 * (the n8n flow that emails the Vexa inbox, same fields as before). The admin panel works from the saved copy.
 */

export const STATUSES = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "waiting", label: "Waiting for a reply" },
  { value: "resolved", label: "Resolved" },
] as const;
export type EnquiryStatus = (typeof STATUSES)[number]["value"];
export const isStatus = (v: unknown): v is EnquiryStatus => STATUSES.some((s) => s.value === v);

/** What each status means to the person who sent the enquiry. */
export const STATUS_NOTE: Record<EnquiryStatus, string> = {
  new: "We have your enquiry and will reply by email.",
  in_progress: "We are working on your enquiry.",
  waiting: "We are waiting for a reply. Check your email for our latest message.",
  resolved: "This enquiry is closed. If you need anything more, reply to our email.",
};

export type EnquiryEntry = {
  at: string;
  name: string | null;
  email: string;
  role: string;
  interest: string | null;
  company: string | null;
  problem: string;
  budget: string | null;
  launch: string | null;
  source: string | null;
  consent: boolean;
};

export type Enquiry = EnquiryEntry & { id: string; status: EnquiryStatus; notes: string; emailed: "delivered" | "failed" | "not_configured" };

type EnquiryRow = {
  id: string;
  at: Date;
  name: string | null;
  email: string;
  role: string;
  interest: string | null;
  company: string | null;
  problem: string;
  budget: string | null;
  launch: string | null;
  source: string | null;
  consent: boolean;
  status: EnquiryStatus;
  notes: string;
  emailed: Enquiry["emailed"];
};

const toEnquiry = (r: EnquiryRow): Enquiry => ({ ...r, at: iso(r.at) });

export async function listEnquiries(): Promise<Enquiry[]> {
  const { rows } = await db.query<EnquiryRow>("select * from enquiries order by at desc");
  return rows.map(toEnquiry);
}
/** Enquiries sent with this email address, newest first. Only show them to someone who has proven the address. */
export async function listForEmail(email: string): Promise<Enquiry[]> {
  const { rows } = await db.query<EnquiryRow>("select * from enquiries where lower(email) = $1 order by at desc", [email.toLowerCase()]);
  return rows.map(toEnquiry);
}
export async function getEnquiry(id: string): Promise<Enquiry | null> {
  if (!isUuid(id)) return null;
  const { rows } = await db.query<EnquiryRow>("select * from enquiries where id = $1", [id]);
  return rows[0] ? toEnquiry(rows[0]) : null;
}

export async function updateEnquiry(id: string, patch: { status?: EnquiryStatus; notes?: string }) {
  if (!isUuid(id)) return;
  await db.query(
    "update enquiries set status = coalesce($2, status), notes = coalesce($3, notes) where id = $1",
    [id, patch.status ?? null, patch.notes === undefined ? null : patch.notes.slice(0, 5000)],
  );
}
export async function deleteEnquiry(id: string) {
  if (!isUuid(id)) return;
  await db.query("delete from enquiries where id = $1", [id]);
}

async function notify(entry: EnquiryEntry): Promise<Enquiry["emailed"]> {
  const url = process.env.CONTACT_WEBHOOK_URL;
  if (!url) return "not_configured";
  try {
    const token = process.env.CONTACT_WEBHOOK_TOKEN;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(5000),
      redirect: "manual",
    });
    return res.ok ? "delivered" : "failed";
  } catch {
    return "failed";
  }
}

/**
 * Sends the person who enquired a short confirmation from the contact mailbox, through Gmail (not Resend, which has a
 * small daily limit on the free plan). The team does not get an email: each enquiry is in the admin Enquiries page.
 */
async function confirmToSender(entry: EnquiryEntry): Promise<void> {
  const first = (entry.name || "").trim().split(/\s+/)[0];
  const opening = first ? `Hi ${first},` : "Hi there,";
  const middle = entry.interest
    ? `It's great to hear about ${entry.interest}, and thank you for taking the time to write to us.`
    : "Thank you for taking the time to write to us.";
  await sendNew({
    from: "contact",
    to: entry.email,
    subject: first ? `${first}, we've got your message` : "We've got your message",
    body: `${opening}\n\n${middle}\n\nYour enquiry is with our team now. Someone will read it properly and get back to you here within two working days. If anything else comes to mind in the meantime, just reply to this email and add it to the thread. We read every message.\n\nSpeak soon,\nThe Vexa Digital team\ncontact@vexadigital.in`,
  });
}

/** Accepts an enquiry when at least one route holds it: saved in the database or delivered to the webhook. */
export async function acceptEnquiry(entry: EnquiryEntry): Promise<boolean> {
  await confirmToSender(entry).catch(() => undefined);
  const emailed = await notify(entry);
  if (emailed === "failed") console.error("enquiry: webhook delivery failed");
  if (emailed === "not_configured" && process.env.NODE_ENV === "production") console.error("enquiry: CONTACT_WEBHOOK_URL is not set, nothing was emailed");
  try {
    await db.query(
      `insert into enquiries (at, name, email, role, interest, company, problem, budget, launch, source, consent, emailed)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [entry.at, entry.name, entry.email, entry.role, entry.interest, entry.company, entry.problem, entry.budget, entry.launch, entry.source, entry.consent, emailed],
    );
    return true;
  } catch {
    console.error("enquiry: could not save to the database");
    return emailed === "delivered";
  }
}
