// Turns off two-step sign-in for one staff account, for someone who lost both their phone and their recovery
// codes. Run on the server only, after confirming the request with the person by another channel:
//   docker exec vexa-site node scripts/reset-staff-totp.mjs --email person@example.com
// It removes the authenticator key and recovery codes and ends every session of that account, so whoever held
// one must sign in again. The person then signs in with their password and sets up two-step sign-in again.
import Database from 'better-sqlite3';
import path from 'node:path';

const args = process.argv.slice(2);
const at = args.indexOf('--email');
const email = at >= 0 ? String(args[at + 1] ?? '').trim().toLowerCase() : '';
const unknown = args.filter((arg, i) => arg !== '--email' && i !== at + 1);
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || unknown.length) {
  console.error('Usage: node scripts/reset-staff-totp.mjs --email <staff account email>');
  process.exit(2);
}
if (!process.env.VEXA_DATA_DIR) {
  console.error('Set VEXA_DATA_DIR to the intended website data directory first.');
  process.exit(2);
}

const db = new Database(path.join(process.env.VEXA_DATA_DIR, 'vexa.db'), { fileMustExist: true });
try {
  const applied = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='staff_recovery_codes'").get();
  if (!applied) {
    console.error('The two-step sign-in migration has not been applied yet. Nothing to reset. No changes made.');
    process.exit(1);
  }
  const reader = db.prepare('SELECT id, totp_secret, totp_pending FROM readers WHERE email = ?').get(email);
  if (!reader) {
    console.error('No website account uses that email. No changes made.');
    process.exit(1);
  }
  if (!reader.totp_secret && !reader.totp_pending) {
    console.log('No change: two-step sign-in is not set up for that account.');
    process.exit(0);
  }
  let sessions = 0;
  db.transaction(() => {
    db.prepare('UPDATE readers SET totp_secret = NULL, totp_pending = NULL, totp_pending_at = NULL, totp_enabled_at = NULL, totp_last_step = NULL WHERE id = ?').run(reader.id);
    db.prepare('DELETE FROM staff_recovery_codes WHERE reader_id = ?').run(reader.id);
    sessions = db.prepare('DELETE FROM reader_sessions WHERE reader_id = ?').run(reader.id).changes;
    db.prepare('INSERT INTO admin_audit (at, actor_id, actor_label, action, target_type, target_id, metadata) VALUES (?, NULL, ?, ?, ?, ?, ?)')
      .run(new Date().toISOString(), 'server command', 'staff.totp_reset', 'user', reader.id, JSON.stringify({ ended: sessions }));
  })();
  console.log(`Two-step sign-in reset for account ${reader.id}; ${sessions} session(s) ended. They can now sign in with their password and set it up again.`);
} finally {
  db.close();
}
