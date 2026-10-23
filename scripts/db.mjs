#!/usr/bin/env node
// Database tools for the Vexa site. Needs DATABASE_URL (in .env.local or .env.production).
//   npm run db:schema        create or update the tables (safe to run again)
//   npm run db:import-json   copy the old JSON data folder into the database (safe to run again)
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const command = process.argv[2];

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Put it in .env.local (development) or .env.production (server).");
  process.exit(1);
}
if (!["schema", "import-json"].includes(command)) {
  console.error("Usage: node scripts/db.mjs schema | import-json");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  if (command === "schema") {
    await client.query(readFileSync(path.join(root, "db", "schema.sql"), "utf8"));
    console.log("Database schema is up to date.");
  } else {
    await importJson();
  }
} finally {
  await client.end();
}

/** Reads one JSON collection from the old data folder. A missing file is an empty list. */
function readCollection(dataDir, name) {
  const file = path.join(dataDir, `${name}.json`);
  if (!existsSync(file)) return [];
  return JSON.parse(readFileSync(file, "utf8"));
}

async function importJson() {
  const dataDir = process.env.VEXA_DATA_DIR ?? path.join(root, "data");
  const users = readCollection(dataDir, "users");
  const articles = readCollection(dataDir, "articles");
  const comments = readCollection(dataDir, "comments");
  const enquiries = readCollection(dataDir, "enquiries");
  const legacyLines = existsSync(path.join(dataDir, "contact-submissions.jsonl"))
    ? readFileSync(path.join(dataDir, "contact-submissions.jsonl"), "utf8").split("\n").filter(Boolean)
    : [];
  console.log(`Found in ${dataDir}: ${users.length} users, ${articles.length} articles, ${comments.length} comments, ${enquiries.length} enquiries, ${legacyLines.length} older enquiries.`);

  await client.query("begin");
  try {
    for (const u of users) {
      await client.query(
        `insert into users (id, name, email, password_hash, google_id, email_verified, role, disabled, created_at, last_login_at,
           password_changed_at, sessions_revoked_at, inbox_read_all, inbox_read)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) on conflict do nothing`,
        [
          u.id, u.name, u.email.toLowerCase(), u.passwordHash ?? null, u.googleId ?? null, Boolean(u.emailVerified),
          u.role === "admin" ? "admin" : "user", Boolean(u.disabled), u.createdAt, u.lastLoginAt ?? null,
          u.passwordChangedAt ?? null, u.sessionsRevokedAt ?? null, u.inboxReadAll ?? null, u.inboxRead ?? [],
        ],
      );
    }

    if (articles.length) {
      for (const a of articles) {
        await client.query(
          `insert into articles (id, slug, title, excerpt, category, date, status, preview_blocks, blocks, created_at, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict do nothing`,
          [a.id, a.slug, a.title, a.excerpt, a.category, a.date, a.status, a.previewBlocks, JSON.stringify(a.blocks), a.createdAt, a.updatedAt],
        );
      }
      await client.query("insert into app_meta (key) values ('articles_seeded') on conflict do nothing");
    }

    // a comment whose account is gone keeps its text, shown as from a former member
    const userIds = new Set(users.map((u) => u.id));
    for (const c of comments) {
      await client.query(
        `insert into comments (id, slug, user_id, name, text, created_at) values ($1,$2,$3,$4,$5,$6) on conflict do nothing`,
        [c.id, c.slug, c.userId && userIds.has(c.userId) ? c.userId : null, c.userId && userIds.has(c.userId) ? c.name : "Former member", c.text, c.createdAt],
      );
    }

    for (const e of enquiries) {
      await client.query(
        `insert into enquiries (id, at, name, email, role, interest, company, problem, budget, launch, source, consent, status, notes, emailed)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) on conflict do nothing`,
        [e.id, e.at, e.name ?? null, e.email, e.role, e.interest ?? null, e.company ?? null, e.problem, e.budget ?? null, e.launch ?? null,
          e.source ?? null, Boolean(e.consent), e.status ?? "new", e.notes ?? "", e.emailed ?? "not_configured"],
      );
    }

    // the first version of the form kept enquiries as plain text, one JSON object per line; only when none are in the database yet
    const { rows } = await client.query("select count(*)::int as n from enquiries");
    if (rows[0].n === 0 && !enquiries.length) {
      for (const line of legacyLines) {
        try {
          const e = JSON.parse(line);
          if (!e.email || !e.problem) continue;
          await client.query(
            `insert into enquiries (id, at, name, email, role, interest, company, problem, budget, launch, source, consent, status, notes, emailed)
             values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'new','','not_configured')`,
            [e.id ?? randomUUID(), e.at, e.name ?? null, e.email, e.role ?? "", e.interest ?? null, e.company ?? null, e.problem, e.budget ?? null,
              e.launch ?? null, e.source ?? null, Boolean(e.consent)],
          );
        } catch {
          console.warn("Skipped one damaged line in contact-submissions.jsonl");
        }
      }
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
  console.log("Import finished. Password-reset links and pending sign-ups are not copied: they expire within a day.");
}
