import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { runMigrations } from "@/lib/migrations";

// One small SQLite file in the Docker volume (/app/data), so leads and briefs survive a rebuild.
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  const dir = process.env.VEXA_DATA_DIR ?? path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, "vexa.db");
  const existed = fs.existsSync(file) && fs.statSync(file).size > 0;
  const opened = new Database(file);
  fs.chmodSync(path.join(dir,"vexa.db"),0o600);
  opened.pragma("journal_mode = WAL");
  opened.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      role TEXT,
      whatsapp TEXT,
      whatsapp_consent INTEGER NOT NULL DEFAULT 0,
      source_slug TEXT,
      utm_source TEXT,
      signed_in_with TEXT,
      last_seen TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS briefs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      name TEXT,
      email TEXT NOT NULL,
      role TEXT,
      interest TEXT,
      company TEXT,
      problem TEXT,
      budget TEXT,
      launch TEXT,
      source TEXT,
      consent INTEGER NOT NULL DEFAULT 0
    );
  `);
  opened.pragma("foreign_keys = ON");
  opened.exec(`
    CREATE TABLE IF NOT EXISTS readers (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT,
      google_sub TEXT UNIQUE, email_verified INTEGER NOT NULL DEFAULT 0, name TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT '',
      industry TEXT NOT NULL DEFAULT '', job TEXT NOT NULL DEFAULT '', organisation TEXT NOT NULL DEFAULT '',
      public_details INTEGER NOT NULL DEFAULT 0, moderator INTEGER NOT NULL DEFAULT 0,
      contributor INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reader_sessions (
      id TEXT PRIMARY KEY, reader_id TEXT NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reader_comments (
      id TEXT PRIMARY KEY, reader_id TEXT NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
      slug TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS comments_slug ON reader_comments(slug, status, created_at);
    CREATE TABLE IF NOT EXISTS reader_tokens (hash TEXT PRIMARY KEY, reader_id TEXT NOT NULL REFERENCES readers(id) ON DELETE CASCADE, purpose TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS account_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
  `);
  if(!(opened.prepare("PRAGMA table_info(readers)").all() as {name:string}[]).some(column=>column.name==="email_verified"))opened.exec("ALTER TABLE readers ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0");
  const migrated = runMigrations(opened, dir, existed);
  if (migrated.applied.length) console.info(`database migrations applied: ${migrated.applied.join(", ")}${migrated.backup ? "; pre-migration snapshot saved in the data directory's backups folder" : ""}`);
  db = opened;
  return opened;
}

export type LeadInput = {
  name?: string | null;
  email: string;
  role: string;
  whatsapp?: string | null;
  whatsappConsent: boolean;
  sourceSlug?: string | null;
  utmSource?: string | null;
  signedInWith: "google" | "email";
};

export function upsertLead(input: LeadInput): void {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO leads (created_at, name, email, role, whatsapp, whatsapp_consent, source_slug, utm_source, signed_in_with, last_seen)
       VALUES (@now, @name, @email, @role, @whatsapp, @wc, @slug, @utm, @via, @now)
       ON CONFLICT(email) DO UPDATE SET
         name = COALESCE(excluded.name, leads.name),
         role = excluded.role,
         whatsapp = COALESCE(excluded.whatsapp, leads.whatsapp),
         whatsapp_consent = MAX(leads.whatsapp_consent, excluded.whatsapp_consent),
         last_seen = excluded.last_seen`,
    )
    .run({
      now,
      name: input.name ?? null,
      email: input.email.toLowerCase(),
      role: input.role,
      whatsapp: input.whatsapp ?? null,
      wc: input.whatsappConsent ? 1 : 0,
      slug: input.sourceSlug ?? null,
      utm: input.utmSource ?? null,
      via: input.signedInWith,
    });
}

export function getLeadRole(email: string): string | null {
  const row = getDb().prepare("SELECT role FROM leads WHERE email = ?").get(email.toLowerCase()) as { role: string | null } | undefined;
  return row?.role ?? null;
}

export function touchLead(email: string): void {
  getDb().prepare("UPDATE leads SET last_seen = ? WHERE email = ?").run(new Date().toISOString(), email.toLowerCase());
}

export type BriefInput = {
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
  submissionId: string;
  createdAt?: string;
  origin?: "form" | "fallback-file";
};

export function insertBrief(entry: BriefInput): number {
  const result = getDb()
    .prepare(
      `INSERT INTO briefs (created_at, name, email, role, interest, company, problem, budget, launch, source, consent, submission_id, origin, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      entry.createdAt ?? new Date().toISOString(),
      entry.name,
      entry.email,
      entry.role,
      entry.interest,
      entry.company,
      entry.problem,
      entry.budget,
      entry.launch,
      entry.source,
      entry.consent ? 1 : 0,
      entry.submissionId,
      entry.origin ?? "form",
      new Date().toISOString(),
    );
  return Number(result.lastInsertRowid);
}
