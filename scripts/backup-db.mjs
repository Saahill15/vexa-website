// Online, consistent copy of the website database using SQLite's backup API (safe while the site runs in WAL mode).
//   docker exec vexa-site node scripts/backup-db.mjs
// Writes /app/data/backups/manual-<timestamp>.db inside the data volume, then checks the copy's integrity.
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dir = process.env.VEXA_DATA_DIR ?? path.join(process.cwd(), 'data');
const source = path.join(dir, 'vexa.db');
const target = process.argv[2] ?? path.join(dir, 'backups', `manual-${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
const db = new Database(source, { readonly: true, fileMustExist: true });
try {
  await db.backup(target);
} finally {
  db.close();
}
fs.chmodSync(target, 0o600);
const copy = new Database(target, { readonly: true });
const check = copy.pragma('integrity_check', { simple: true });
const tables = copy.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table'").get().n;
copy.close();
if (check !== 'ok') {
  console.error(`Backup written to ${target} but failed its integrity check: ${check}`);
  process.exit(1);
}
console.log(`Backup written and verified (${tables} tables): ${target}`);
