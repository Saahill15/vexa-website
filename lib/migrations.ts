import type Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// Versioned, additive schema changes. Never edit or reorder an applied migration: append a new one.
// Every step is idempotent so a partially applied database (for example from a crash) still converges.
type Migration = { version: number; name: string; up: (db: Database.Database) => void };

function hasColumn(db: Database.Database, table: string, column: string): boolean {
  return (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).some((entry) => entry.name === column);
}
function addColumn(db: Database.Database, table: string, column: string, definition: string): void {
  if (!hasColumn(db, table, column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: "staff roles, account status and session age",
    up(db) {
      addColumn(db, "readers", "admin", "INTEGER NOT NULL DEFAULT 0");
      addColumn(db, "readers", "disabled_at", "TEXT");
      // Sessions created before this migration have no age and are treated as not recent enough for admin work.
      addColumn(db, "reader_sessions", "created_at", "INTEGER");
    },
  },
  {
    version: 2,
    name: "enquiry workflow and delivery record",
    up(db) {
      addColumn(db, "briefs", "status", "TEXT NOT NULL DEFAULT 'new'");
      addColumn(db, "briefs", "assigned_to", "TEXT");
      addColumn(db, "briefs", "updated_at", "TEXT");
      addColumn(db, "briefs", "submission_id", "TEXT");
      addColumn(db, "briefs", "origin", "TEXT NOT NULL DEFAULT 'form'");
      addColumn(db, "briefs", "webhook_status", "TEXT");
      addColumn(db, "briefs", "webhook_detail", "TEXT");
      addColumn(db, "briefs", "webhook_at", "TEXT");
      db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS briefs_submission ON briefs(submission_id) WHERE submission_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS briefs_created ON briefs(created_at);
        CREATE INDEX IF NOT EXISTS briefs_status ON briefs(status, created_at);
      `);
    },
  },
  {
    version: 3,
    name: "lead follow-up status",
    up(db) {
      addColumn(db, "leads", "status", "TEXT NOT NULL DEFAULT 'new'");
      addColumn(db, "leads", "updated_at", "TEXT");
    },
  },
  {
    version: 4,
    name: "comment moderation record",
    up(db) {
      addColumn(db, "reader_comments", "moderated_by", "TEXT");
      addColumn(db, "reader_comments", "moderated_at", "TEXT");
    },
  },
  {
    version: 5,
    name: "internal notes, audit log, settings and article visibility",
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS admin_notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subject_type TEXT NOT NULL,
          subject_id TEXT NOT NULL,
          author_id TEXT,
          author_label TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS admin_notes_subject ON admin_notes(subject_type, subject_id, created_at);
        CREATE TABLE IF NOT EXISTS admin_audit (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          at TEXT NOT NULL,
          actor_id TEXT,
          actor_label TEXT NOT NULL,
          action TEXT NOT NULL,
          target_type TEXT,
          target_id TEXT,
          metadata TEXT
        );
        CREATE INDEX IF NOT EXISTS admin_audit_at ON admin_audit(at);
        CREATE INDEX IF NOT EXISTS admin_audit_target ON admin_audit(target_type, target_id, at);
        CREATE TRIGGER IF NOT EXISTS admin_audit_no_update BEFORE UPDATE ON admin_audit BEGIN SELECT RAISE(ABORT, 'audit records are append-only'); END;
        CREATE TRIGGER IF NOT EXISTS admin_audit_no_delete BEFORE DELETE ON admin_audit BEGIN SELECT RAISE(ABORT, 'audit records are append-only'); END;
        CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by TEXT);
        CREATE TABLE IF NOT EXISTS article_visibility (slug TEXT PRIMARY KEY, hidden INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, updated_by TEXT);
      `);
    },
  },
  {
    version: 6,
    name: "staff two-step sign-in (TOTP)",
    up(db) {
      // The secret is stored encrypted (AES-256-GCM, lib/second-factor.ts); a pending one waits for its first code.
      addColumn(db, "readers", "totp_secret", "TEXT");
      addColumn(db, "readers", "totp_pending", "TEXT");
      addColumn(db, "readers", "totp_pending_at", "INTEGER");
      addColumn(db, "readers", "totp_enabled_at", "TEXT");
      // Last accepted time step, so a code cannot be used twice.
      addColumn(db, "readers", "totp_last_step", "INTEGER");
      // When this browser session passed the second factor; null means password (or Google) only.
      addColumn(db, "reader_sessions", "second_factor_at", "INTEGER");
      db.exec(`
        CREATE TABLE IF NOT EXISTS staff_recovery_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reader_id TEXT NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
          code_hash TEXT NOT NULL,
          created_at TEXT NOT NULL,
          used_at TEXT
        );
        CREATE UNIQUE INDEX IF NOT EXISTS staff_recovery_codes_hash ON staff_recovery_codes(reader_id, code_hash);
      `);
    },
  },
];

/**
 * Applies pending migrations. When the database already held data, a consistent snapshot is written first
 * with VACUUM INTO (it includes committed WAL content), so a failed or unwanted migration can be rolled back.
 */
export function runMigrations(db: Database.Database, dataDir: string, existed: boolean): { applied: number[]; backup: string | null } {
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)");
  const done = new Set((db.prepare("SELECT version FROM schema_migrations").all() as { version: number }[]).map((row) => row.version));
  const pending = MIGRATIONS.filter((migration) => !done.has(migration.version));
  if (!pending.length) return { applied: [], backup: null };
  let backup: string | null = null;
  if (existed) {
    const dir = path.join(dataDir, "backups");
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    backup = path.join(dir, `pre-migration-v${pending[0].version}-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
    db.prepare("VACUUM INTO ?").run(backup);
    fs.chmodSync(backup, 0o600);
  }
  for (const migration of pending) {
    db.transaction(() => {
      migration.up(db);
      db.prepare("INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)").run(migration.version, migration.name, new Date().toISOString());
    })();
  }
  return { applied: pending.map((migration) => migration.version), backup };
}
