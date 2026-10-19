// Grants or removes the administrator role for one EXISTING website account. Run on the server only:
//   docker exec vexa-site node scripts/provision-admin.mjs --email owner@example.com
//   docker exec vexa-site node scripts/provision-admin.mjs --email owner@example.com --revoke
// There is no default account, password or browser route for this. The person first registers normally,
// verifies their email (or signs in with Google), then the owner runs this command.
import Database from 'better-sqlite3';
import path from 'node:path';

const args = process.argv.slice(2);
const revoke = args.includes('--revoke');
const at = args.indexOf('--email');
const email = at >= 0 ? String(args[at + 1] ?? '').trim().toLowerCase() : '';
const unknown = args.filter((arg, i) => arg !== '--revoke' && arg !== '--email' && i !== at + 1);
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || unknown.length) {
  console.error('Usage: node scripts/provision-admin.mjs --email <existing account email> [--revoke]');
  process.exit(2);
}
if (!process.env.VEXA_DATA_DIR) {
  console.error('Set VEXA_DATA_DIR to the intended website data directory first.');
  process.exit(2);
}

const db = new Database(path.join(process.env.VEXA_DATA_DIR, 'vexa.db'), { fileMustExist: true });
try {
  const columns = db.prepare('PRAGMA table_info(readers)').all().map((c) => c.name);
  const audited = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='admin_audit'").get();
  if (!columns.includes('admin') || !columns.includes('disabled_at') || !audited) {
    console.error('The admin migration has not been applied yet. Start the new website version first; it migrates on start-up. No changes made.');
    process.exit(1);
  }
  const reader = db.prepare('SELECT id, email, email_verified, google_sub, disabled_at, admin FROM readers WHERE email = ?').get(email);
  if (!reader) {
    console.error('No website account uses that email. Register it through the website first. No changes made.');
    process.exit(1);
  }
  if (!revoke && !reader.email_verified && !reader.google_sub) {
    console.error('That account has not verified its email address. Verify it first. No changes made.');
    process.exit(1);
  }
  if (!revoke && reader.disabled_at) {
    console.error('That account is disabled. Reactivate it first. No changes made.');
    process.exit(1);
  }
  if (Boolean(reader.admin) === !revoke) {
    console.log(`No change: that account ${revoke ? 'is not' : 'is already'} an administrator.`);
    process.exit(0);
  }
  db.transaction(() => {
    db.prepare('UPDATE readers SET admin = ? WHERE id = ?').run(revoke ? 0 : 1, reader.id);
    // Removing the role also ends that person's sessions, so the change applies immediately.
    if (revoke) db.prepare('DELETE FROM reader_sessions WHERE reader_id = ?').run(reader.id);
    db.prepare('INSERT INTO admin_audit (at, actor_id, actor_label, action, target_type, target_id, metadata) VALUES (?, NULL, ?, ?, ?, ?, NULL)')
      .run(new Date().toISOString(), 'server command', revoke ? 'user.revoke_admin' : 'user.grant_admin', 'user', reader.id);
  })();
  console.log(`Administrator role ${revoke ? 'removed from' : 'granted to'} account ${reader.id}. No password or session was created.`);
} finally {
  db.close();
}
