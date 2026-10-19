import { createHash, randomUUID } from "crypto";
import fs from "fs";
import { open } from "fs/promises";
import path from "path";
import { getDb, insertBrief, type BriefInput } from "@/lib/db";

export const ENQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "waiting", label: "Waiting for response" },
  { value: "resolved", label: "Resolved" },
] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number]["value"];
export const isEnquiryStatus = (value: unknown): value is EnquiryStatus => ENQUIRY_STATUSES.some((status) => status.value === value);

/** The fields the existing webhook has always received. Kept identical so the n8n flow keeps working. */
export type EnquiryEntry = {
  at: string; name: string | null; email: string; role: string; interest: string | null; company: string | null;
  problem: string; budget: string | null; launch: string | null; source: string | null; consent: boolean;
};

export function dataDir(): string {
  return process.env.VEXA_DATA_DIR ?? path.join(process.cwd(), "data");
}
export function fallbackFile(): string {
  return path.join(dataDir(), "contact-submissions.jsonl");
}

function briefInput(entry: EnquiryEntry, submissionId: string, origin: "form" | "fallback-file"): BriefInput {
  return { name: entry.name, email: entry.email, role: entry.role, interest: entry.interest, company: entry.company, problem: entry.problem, budget: entry.budget, launch: entry.launch, source: entry.source, consent: entry.consent, submissionId, createdAt: entry.at, origin };
}

/** Appends one line and flushes it to disk before returning, so "saved" means saved. */
async function appendFallback(line: string): Promise<void> {
  fs.mkdirSync(dataDir(), { recursive: true, mode: 0o700 });
  const handle = await open(fallbackFile(), "a", 0o600);
  try {
    await handle.appendFile(`${line}\n`, "utf8");
    await handle.datasync();
  } finally {
    await handle.close();
  }
}

export type WebhookResult = { status: "not_configured" | "delivered" | "failed"; detail: string | null };

export async function notifyWebhook(entry: EnquiryEntry): Promise<WebhookResult> {
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) return { status: "not_configured", detail: null };
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.CONTACT_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.CONTACT_WEBHOOK_TOKEN}` } : {}) },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(5000),
      redirect: "error",
    });
    // Before this change any HTTP status counted as delivered. A rejected request is a failure.
    return response.ok ? { status: "delivered", detail: `HTTP ${response.status}` } : { status: "failed", detail: `HTTP ${response.status}` };
  } catch (cause) {
    const timedOut = cause instanceof Error && (cause.name === "TimeoutError" || cause.name === "AbortError");
    return { status: "failed", detail: timedOut ? "Timed out after 5 seconds" : "Could not connect" };
  }
}

export function recordWebhook(briefId: number, result: WebhookResult): void {
  getDb().prepare("UPDATE briefs SET webhook_status = ?, webhook_detail = ?, webhook_at = ? WHERE id = ?").run(result.status, result.detail, new Date().toISOString(), briefId);
}

export type AcceptResult = { ok: true; stored: "database" | "fallback-file"; id: number | null; webhook: WebhookResult } | { ok: false };

/**
 * Durable first, notification second. Success is reported only after the database commit or, if the database
 * write fails, after the fallback line is flushed to disk. A webhook failure never undoes a saved enquiry.
 */
export async function acceptEnquiry(entry: EnquiryEntry): Promise<AcceptResult> {
  const submissionId = randomUUID();
  let id: number | null = null;
  let stored: "database" | "fallback-file";
  try {
    id = insertBrief(briefInput(entry, submissionId, "form"));
    stored = "database";
  } catch {
    console.error("brief database write failed; trying the fallback file");
    try {
      await appendFallback(JSON.stringify({ ...entry, submissionId }));
      stored = "fallback-file";
    } catch {
      console.error("brief fallback write failed; the visitor is told the message was not saved");
      return { ok: false };
    }
  }
  const webhook = await notifyWebhook(entry);
  if (webhook.status === "failed") console.error(`contact webhook failed (${webhook.detail})`);
  if (id !== null) {
    try { recordWebhook(id, webhook); } catch { console.error("could not record webhook outcome"); }
  }
  return { ok: true, stored, id, webhook };
}

type FallbackLine = { key: string; entry: EnquiryEntry };
export type FallbackScan = { exists: boolean; readable: FallbackLine[]; unreadable: number; pending: FallbackLine[] };

function asEntry(value: unknown): EnquiryEntry | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const text = (key: string, max: number) => (typeof v[key] === "string" && (v[key] as string).trim() ? (v[key] as string).slice(0, max) : null);
  const email = text("email", 254), problem = text("problem", 5000), at = text("at", 40);
  if (!email || !problem || !at || Number.isNaN(Date.parse(at))) return null;
  return { at: new Date(at).toISOString(), name: text("name", 120), email, role: text("role", 40) ?? "other", interest: text("interest", 300), company: text("company", 200), problem, budget: text("budget", 100), launch: text("launch", 100), source: text("source", 300), consent: v.consent === true };
}

/**
 * Reads the fallback file without changing it. Lines written before submission ids existed are keyed by a hash
 * of the line, so importing twice never duplicates a record.
 */
export function scanFallback(): FallbackScan {
  let raw: string;
  try {
    raw = fs.readFileSync(fallbackFile(), "utf8");
  } catch {
    return { exists: false, readable: [], unreadable: 0, pending: [] };
  }
  const readable: FallbackLine[] = [];
  let unreadable = 0;
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      const entry = asEntry(parsed);
      if (!entry) { unreadable++; continue; }
      const key = typeof parsed.submissionId === "string" && /^[a-f0-9-]{36}$/.test(parsed.submissionId) ? parsed.submissionId : `legacy-${createHash("sha256").update(line.trim()).digest("hex").slice(0, 32)}`;
      readable.push({ key, entry });
    } catch {
      unreadable++;
    }
  }
  const known = new Set((getDb().prepare("SELECT submission_id FROM briefs WHERE submission_id IS NOT NULL").all() as { submission_id: string }[]).map((row) => row.submission_id));
  const seen = new Set<string>();
  const pending = readable.filter((line) => !known.has(line.key) && !seen.has(line.key) && seen.add(line.key));
  return { exists: true, readable, unreadable, pending };
}

export function importFallback(): { imported: number; unreadable: number } {
  const scan = scanFallback();
  const db = getDb();
  let imported = 0;
  db.transaction(() => {
    for (const line of scan.pending) {
      insertBrief(briefInput(line.entry, line.key, "fallback-file"));
      imported++;
    }
  })();
  return { imported, unreadable: scan.unreadable };
}
