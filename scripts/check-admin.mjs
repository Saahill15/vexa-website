// Admin panel, enquiry reliability and migration checks against a real production build.
// Everything runs in a disposable data directory with synthetic accounts; it never touches preview or live data.
//   npm run test:admin                      (builds into .next-admin-check, then tests)
//   VEXA_ADMIN_CHECK_SKIP_BUILD=1 npm run test:admin   (reuse the last build)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createHash, createHmac, randomBytes, scryptSync, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';

const root = process.cwd();
const port = 3324;
const base = `http://127.0.0.1:${port}`;
const buildDir = '.next-admin-check';
const data = fs.mkdtempSync(path.join(tmpdir(), 'vexa-admin-test-'));
const dbFile = path.join(data, 'vexa.db');
const fallback = path.join(data, 'contact-submissions.jsonl');
const PASSWORD = 'Synthetic-admin-test-password-4471';
const TOTP_KEY = randomBytes(32).toString('base64url');

// ---------- synthetic services ----------
let webhookMode = 500;
const webhookCalls = [];
const webhook = createServer(async (req, res) => { let body = ''; for await (const chunk of req) body += chunk; webhookCalls.push(JSON.parse(body)); res.writeHead(webhookMode).end('{}'); });
const mailToken = randomBytes(24).toString('hex');
const mails = [];
const mail = createServer(async (req, res) => { if (req.headers.authorization !== `Bearer ${mailToken}`) { res.writeHead(403).end(); return; } let body = ''; for await (const chunk of req) body += chunk; mails.push(JSON.parse(body)); res.writeHead(200).end('{}'); });
const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));

// ---------- the schema exactly as it was before the admin migrations ----------
const hash = (password) => { const salt = randomBytes(16).toString('hex'); return `scrypt:32768:8:3:${salt}:${scryptSync(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }).toString('hex')}`; };
const ids = { admin: randomUUID(), mod: randomUUID(), user: randomUUID(), other: randomUUID(), target: randomUUID(), unverified: randomUUID(), lockout: randomUUID() };
const emails = { admin: 'admin@example.invalid', mod: 'mod@example.invalid', user: 'user@example.invalid', other: 'other@example.invalid', target: 'target@example.invalid', unverified: 'unverified@example.invalid', lockout: 'lockout@example.invalid' };
const comments = { pending: randomUUID(), approved: randomUUID() };
function seedLegacyDatabase() {
  const db = new Database(dbFile);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE leads (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, name TEXT, email TEXT NOT NULL UNIQUE, role TEXT, whatsapp TEXT, whatsapp_consent INTEGER NOT NULL DEFAULT 0, source_slug TEXT, utm_source TEXT, signed_in_with TEXT, last_seen TEXT NOT NULL);
    CREATE TABLE briefs (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, name TEXT, email TEXT NOT NULL, role TEXT, interest TEXT, company TEXT, problem TEXT, budget TEXT, launch TEXT, source TEXT, consent INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE readers (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT, google_sub TEXT UNIQUE, email_verified INTEGER NOT NULL DEFAULT 0, name TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT '', industry TEXT NOT NULL DEFAULT '', job TEXT NOT NULL DEFAULT '', organisation TEXT NOT NULL DEFAULT '', public_details INTEGER NOT NULL DEFAULT 0, moderator INTEGER NOT NULL DEFAULT 0, contributor INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
    CREATE TABLE reader_sessions (id TEXT PRIMARY KEY, reader_id TEXT NOT NULL REFERENCES readers(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
    CREATE TABLE reader_comments (id TEXT PRIMARY KEY, reader_id TEXT NOT NULL REFERENCES readers(id) ON DELETE CASCADE, slug TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE INDEX comments_slug ON reader_comments(slug, status, created_at);
    CREATE TABLE reader_tokens (hash TEXT PRIMARY KEY, reader_id TEXT NOT NULL REFERENCES readers(id) ON DELETE CASCADE, purpose TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE account_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
  `);
  const now = new Date().toISOString();
  const reader = db.prepare('INSERT INTO readers (id,email,password_hash,email_verified,name,role,moderator,created_at) VALUES (?,?,?,?,?,?,?,?)');
  const pw = hash(PASSWORD);
  reader.run(ids.admin, emails.admin, pw, 1, 'Admin Person', 'brand', 0, now);
  reader.run(ids.mod, emails.mod, pw, 1, 'Mod Person', 'esports', 1, now);
  reader.run(ids.user, emails.user, pw, 1, 'Reader One', 'brand', 0, now);
  reader.run(ids.other, emails.other, pw, 1, 'Reader Two', 'enthusiast', 0, now);
  reader.run(ids.target, emails.target, pw, 1, 'Target Reader', 'brand', 0, now);
  reader.run(ids.unverified, emails.unverified, pw, 0, '', '', 0, now);
  reader.run(ids.lockout, emails.lockout, pw, 1, 'Lockout Reader', 'brand', 0, now);
  db.prepare('INSERT INTO reader_sessions VALUES (?,?,?)').run(randomBytes(32).toString('hex'), ids.admin, Date.now() + 86400000);
  db.prepare('INSERT INTO reader_comments (id,reader_id,slug,body,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').run(comments.pending, ids.user, 'money-map', 'A pending synthetic comment.', 'pending', now, now);
  db.prepare('INSERT INTO reader_comments (id,reader_id,slug,body,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').run(comments.approved, ids.target, 'money-map', 'An approved synthetic comment by the target.', 'approved', now, now);
  const brief = db.prepare('INSERT INTO briefs (created_at,name,email,role,company,problem,consent) VALUES (?,?,?,?,?,?,1)');
  for (let i = 0; i < 30; i++) brief.run(new Date(Date.now() - (i + 2) * 86400000).toISOString(), `Legacy Sender ${i}`, `legacy${i}@example.invalid`, 'brand', `Legacy Co ${i}`, `Legacy brief ${i}`);
  brief.run(new Date(Date.now() - 86400000).toISOString(), 'Findable Person', 'findme@company.example', 'organisation', 'Acme Findable', 'A brief that search should find.');
  const lead = db.prepare('INSERT INTO leads (created_at,name,email,role,whatsapp,whatsapp_consent,source_slug,signed_in_with,last_seen) VALUES (?,?,?,?,?,?,?,?,?)');
  lead.run(now, 'Consenting Lead', 'lead1@example.invalid', 'player', '+919800000001', 1, 'room-waitlist', 'email', now);
  lead.run(now, 'Quiet Lead', 'lead2@example.invalid', 'creator', '+919800000002', 0, 'room-waitlist', 'email', now);
  db.close();
  // One fallback line written by the old route (no submission id).
  fs.writeFileSync(fallback, JSON.stringify({ at: new Date(Date.now() - 3 * 3600000).toISOString(), name: 'Fallback Legacy', email: 'fallback-legacy@example.invalid', role: 'brand', interest: null, company: null, problem: 'Saved while the database was down.', budget: null, launch: null, source: null, consent: true }) + '\n');
}
const sql = () => new Database(dbFile);
const one = (query, ...args) => { const db = sql(); try { return db.prepare(query).get(...args); } finally { db.close(); } };
const run = (query, ...args) => { const db = sql(); try { return db.prepare(query).run(...args); } finally { db.close(); } };

// ---------- server ----------
let server = null;
let env;
async function startServer() {
  server = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(port)], { env, stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  server.stderr.on('data', (chunk) => { stderr += chunk; });
  for (let i = 0; i < 300; i++) {
    if (server.exitCode !== null) throw Error(`Test server exited: ${stderr.slice(-2000)}`);
    try { if ((await fetch(`${base}/learn`)).ok) return; } catch { /* starting */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw Error('Test server did not become ready.');
}
async function stopServer() {
  if (!server || server.exitCode !== null) return;
  const ended = new Promise((resolve) => server.once('exit', resolve));
  server.kill('SIGTERM');
  await ended;
}

class Client {
  cookies = new Map();
  async req(pathname, { method = 'GET', json, form, origin = base, headers = {} } = {}) {
    const h = { ...headers };
    if (this.cookies.size) h.cookie = [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ');
    let body;
    if (json !== undefined) { h['content-type'] = 'application/json'; body = JSON.stringify(json); }
    if (form) { h['content-type'] = 'application/x-www-form-urlencoded'; body = new URLSearchParams(form).toString(); }
    if (method !== 'GET' && origin) h.origin = origin;
    const response = await fetch(base + pathname, { method, headers: h, body, redirect: 'manual' });
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';');
      const at = pair.indexOf('=');
      const name = pair.slice(0, at), value = pair.slice(at + 1);
      if (!value || /max-age=0|expires=thu, 01 jan 1970/i.test(cookie)) this.cookies.delete(name); else this.cookies.set(name, value);
    }
    const text = (await response.text()).replaceAll('<!-- -->', ''); // React text separators
    let parsed = null; try { parsed = JSON.parse(text); } catch { /* html or csv */ }
    return { status: response.status, text, json: parsed, location: response.headers.get('location') || '', headers: response.headers };
  }
  async signIn(email, password = PASSWORD) {
    const csrf = (await this.req('/api/auth/csrf')).json.csrfToken;
    await this.req('/api/auth/callback/credentials', { method: 'POST', form: { csrfToken: csrf, email, password, json: 'true', callbackUrl: `${base}/admin` } });
    return [...this.cookies.keys()].some((name) => name.endsWith('vexa-public-session'));
  }
  post(pathname, json, options = {}) { return this.req(pathname, { method: 'POST', json, ...options }); }
}
const contact = (overrides = {}) => new Client().post('/api/contact', { role: 'brand', email: 'sender@example.invalid', name: 'Form Sender', company: 'Sender Co', problem: 'A synthetic brief from the test.', consent: true, ...overrides });

// ---------- lifecycle ----------
before(async () => {
  seedLegacyDatabase();
  const webhookPort = await listen(webhook);
  const mailPort = await listen(mail);
  env = { ...process.env, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1', VEXA_BUILD_DIR: buildDir, VEXA_DATA_DIR: data, VEXA_PREVIEW: '1', VEXA_TRUST_PROXY: '0', NEXTAUTH_URL: base, NEXTAUTH_SECRET: randomBytes(32).toString('base64url'), GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '', GOOGLE_IDENTITY_ENABLED: 'false', CONTACT_WEBHOOK_URL: `http://127.0.0.1:${webhookPort}/hook`, CONTACT_WEBHOOK_TOKEN: 'synthetic', ACCOUNT_MAIL_WEBHOOK_URL: `http://127.0.0.1:${mailPort}/mail`, ACCOUNT_MAIL_WEBHOOK_TOKEN: mailToken,
    // The admin features are tested first with two-step enrolment relaxed; the TOTP section below restores the
    // production default (required) and tests it separately.
    STAFF_TOTP_REQUIRED: 'false', STAFF_TOTP_KEY: TOTP_KEY };
  if (process.env.VEXA_ADMIN_CHECK_SKIP_BUILD !== '1') {
    const configPath = path.join(root, 'tsconfig.json');
    const original = fs.readFileSync(configPath, 'utf8');
    try {
      const build = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build'], { env: { ...env, VEXA_DATA_DIR: fs.mkdtempSync(path.join(tmpdir(), 'vexa-admin-build-')) }, stdio: 'inherit' });
      assert.equal(build.status, 0, 'next build failed');
    } finally {
      fs.writeFileSync(configPath, original); // next build adds its private type path; keep the repository file unchanged
    }
  }
  await startServer();
});
after(async () => {
  await stopServer();
  webhook.close();
  mail.close();
  fs.rmSync(data, { recursive: true, force: true });
});

// ---------- database and deployment ----------
test('migrations keep every existing record and snapshot the database first', () => {
  assert.equal(one('SELECT COUNT(*) AS n FROM schema_migrations').n, 6);
  assert.equal(one('SELECT COUNT(*) AS n FROM readers').n, 7);
  assert.equal(one('SELECT COUNT(*) AS n FROM briefs').n, 31);
  assert.equal(one('SELECT COUNT(*) AS n FROM leads').n, 2);
  assert.equal(one('SELECT COUNT(*) AS n FROM reader_comments').n, 2);
  assert.equal(one('SELECT COUNT(*) AS n FROM reader_sessions').n, 1, 'existing sessions survive');
  assert.equal(one("SELECT status FROM briefs WHERE email = 'findme@company.example'").status, 'new');
  const backups = fs.readdirSync(path.join(data, 'backups')).filter((name) => name.startsWith('pre-migration-v1-'));
  assert.equal(backups.length, 1);
  const snapshot = new Database(path.join(data, 'backups', backups[0]), { readonly: true });
  assert.equal(snapshot.prepare('SELECT COUNT(*) AS n FROM briefs').get().n, 31);
  snapshot.close();
});

test('administrator provisioning is a server command for existing verified accounts only', () => {
  const provision = (...args) => spawnSync(process.execPath, ['scripts/provision-admin.mjs', ...args], { env: { ...process.env, VEXA_DATA_DIR: data }, encoding: 'utf8' });
  assert.equal(provision('--email', 'nobody@example.invalid').status, 1);
  assert.equal(provision('--email', emails.unverified).status, 1);
  assert.equal(provision().status, 2);
  const granted = provision('--email', emails.admin);
  assert.equal(granted.status, 0, granted.stderr);
  assert.doesNotMatch(granted.stdout, /scrypt|password_hash/);
  assert.equal(one('SELECT admin FROM readers WHERE id = ?', ids.admin).admin, 1);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'user.grant_admin' AND target_id = ?", ids.admin).n, 1);
});

// ---------- authentication and permissions ----------
test('unauthenticated visitors cannot reach admin pages or APIs', async () => {
  const anon = new Client();
  for (const page of ['/admin', '/admin/enquiries', '/admin/enquiries/1', '/admin/users', '/admin/settings']) {
    const response = await anon.req(page);
    assert.equal(response.status, 307, page);
    assert.match(response.location, /\/admin\/login\?next=/);
  }
  assert.equal((await anon.req('/admin/login')).status, 200);
  for (const [endpoint, body] of [['/api/admin/enquiries/1', { action: 'status', status: 'resolved' }], ['/api/admin/users/' + ids.user, { action: 'disable' }], ['/api/admin/leads/export', {}], ['/api/admin/comments/' + comments.pending, { action: 'approve' }], ['/api/admin/settings', { registrationOpen: false }], ['/api/admin/enquiries/import-fallback', {}]]) {
    assert.equal((await anon.post(endpoint, body)).status, 401, endpoint);
  }
  assert.equal((await anon.post('/api/admin/enquiries/1', { action: 'status', status: 'resolved' }, { origin: 'https://evil.example' })).status, 403, 'foreign origin');
  assert.equal(one('SELECT status FROM briefs WHERE id = 1').status, 'new');
});

test('ordinary readers, tampered roles and tampered cookies get no admin access', async () => {
  const reader = new Client();
  assert.ok(await reader.signIn(emails.user));
  assert.equal((await reader.req('/admin')).status, 404);
  assert.equal((await reader.req('/admin/enquiries')).status, 404);
  assert.equal((await reader.post('/api/admin/enquiries/1', { action: 'status', status: 'resolved' })).status, 403);
  assert.equal((await reader.post('/api/admin/users/' + ids.other, { action: 'disable' })).status, 403);
  // Mass assignment: role fields in a profile update are ignored.
  await reader.req('/api/account/profile', { method: 'PATCH', json: { name: 'Reader One', role: 'brand', consent: true, admin: 1, moderator: 1, staffRole: 'admin' } });
  const row = one('SELECT admin, moderator FROM readers WHERE id = ?', ids.user);
  assert.deepEqual([row.admin, row.moderator], [0, 0]);
  assert.equal((await reader.post('/api/admin/enquiries/1', { action: 'status', status: 'resolved' })).status, 403);
  assert.equal((await reader.req('/api/comments/moderate', { method: 'PATCH', json: { id: comments.pending, status: 'approved' } })).status, 403);
  // A modified session cookie is rejected outright.
  const forged = new Client();
  for (const [name, value] of reader.cookies) forged.cookies.set(name, name.endsWith('session') ? value.slice(0, -4) + 'AAAA' : value);
  assert.equal((await forged.post('/api/admin/enquiries/1', { action: 'status', status: 'resolved' })).status, 401);
  assert.equal(one('SELECT status FROM briefs WHERE id = 1').status, 'new');
});

let admin, moderator;
test('moderators reach comment moderation only', async () => {
  moderator = new Client();
  assert.ok(await moderator.signIn(emails.mod));
  assert.equal((await moderator.req('/admin/comments')).status, 200);
  const users = await moderator.req('/admin/users');
  assert.equal(users.status, 307);
  assert.match(users.location, /\/admin\?denied=1/);
  assert.equal((await moderator.post('/api/admin/users/' + ids.user, { action: 'disable' })).status, 403);
  assert.equal((await moderator.post('/api/admin/leads/export', {})).status, 403);
  assert.equal((await moderator.post('/api/admin/enquiries/1', { action: 'note', body: 'x' })).status, 403);
  assert.equal((await moderator.post('/api/admin/settings', { registrationOpen: false })).status, 403);
});

test('admin work requires a recent sign-in', async () => {
  admin = new Client();
  assert.ok(await admin.signIn(emails.admin));
  const dashboard = await admin.req('/admin');
  assert.equal(dashboard.status, 200);
  assert.match(dashboard.text, /Registered users/);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'auth.sign_in' AND actor_id = ?", ids.admin).n, 1);
  run('UPDATE reader_sessions SET created_at = ? WHERE reader_id = ?', Date.now() - 13 * 3600000, ids.admin);
  assert.equal((await admin.post('/api/admin/enquiries/1', { action: 'status', status: 'in_progress' })).status, 401);
  assert.match((await admin.req('/admin')).location, /expired=1/);
  assert.ok(await admin.signIn(emails.admin));
  assert.equal((await admin.req('/admin')).status, 200);
});

test('failed staff sign-ins are audited without logging the password', async () => {
  const attacker = new Client();
  assert.equal(await attacker.signIn(emails.admin, 'Wrong-password-for-test-1'), false);
  const rowsBefore = one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'auth.sign_in_failed'").n;
  assert.ok(rowsBefore >= 1);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE metadata LIKE '%Wrong-password%'").n, 0);
});

// ---------- enquiries ----------
test('a valid enquiry is saved before success, and a webhook failure does not lose it', async () => {
  webhookMode = 500;
  const response = await contact({ email: 'webhook-fail@example.invalid' });
  assert.equal(response.status, 200);
  assert.equal(response.json.ok, true);
  const row = one("SELECT * FROM briefs WHERE email = 'webhook-fail@example.invalid'");
  assert.ok(row, 'saved');
  assert.equal(row.status, 'new');
  assert.equal(row.webhook_status, 'failed');
  assert.equal(row.webhook_detail, 'HTTP 500');
  assert.ok(row.submission_id);
  assert.equal(webhookCalls.at(-1).email, 'webhook-fail@example.invalid');
  assert.equal(webhookCalls.at(-1).submissionId, undefined, 'webhook payload unchanged');
  webhookMode = 200;
  await contact({ email: 'webhook-ok@example.invalid' });
  assert.equal(one("SELECT webhook_status FROM briefs WHERE email = 'webhook-ok@example.invalid'").webhook_status, 'delivered');
  const page = await admin.req('/admin/enquiries?q=webhook-fail');
  assert.match(page.text, /notification failed/);
  const retried = await admin.post(`/api/admin/enquiries/${row.id}`, { action: 'retry-webhook' });
  assert.equal(retried.status, 200);
  assert.equal(one('SELECT webhook_status FROM briefs WHERE id = ?', row.id).webhook_status, 'delivered');
});

test('a database failure is never reported as success unless the fallback file holds the enquiry', async () => {
  run("CREATE TRIGGER test_block_briefs BEFORE INSERT ON briefs BEGIN SELECT RAISE(ABORT, 'synthetic outage'); END;");
  try {
    const saved = await contact({ email: 'db-down@example.invalid' });
    assert.equal(saved.status, 200);
    assert.equal(saved.json.ok, true);
    assert.match(fs.readFileSync(fallback, 'utf8'), /db-down@example\.invalid","role/);
    // Both stores unavailable: the visitor must see a failure.
    fs.renameSync(fallback, fallback + '.moved');
    fs.mkdirSync(fallback);
    try {
      const failed = await contact({ email: 'all-down@example.invalid' });
      assert.equal(failed.status, 503);
      assert.equal(failed.json.ok, false);
      assert.match(failed.json.error, /could not save/);
    } finally {
      fs.rmdirSync(fallback);
      fs.renameSync(fallback + '.moved', fallback);
    }
  } finally {
    run('DROP TRIGGER test_block_briefs');
  }
  assert.equal(one("SELECT COUNT(*) AS n FROM briefs WHERE email = 'all-down@example.invalid'").n, 0);
});

test('fallback-file submissions are surfaced and imported exactly once', async () => {
  const list = await admin.req('/admin/enquiries');
  assert.match(list.text, /2 submissions were saved to the fallback file/);
  const first = await admin.post('/api/admin/enquiries/import-fallback', {});
  assert.equal(first.json.imported, 2);
  const second = await admin.post('/api/admin/enquiries/import-fallback', {});
  assert.equal(second.json.imported, 0);
  assert.equal(one("SELECT COUNT(*) AS n FROM briefs WHERE email IN ('db-down@example.invalid','fallback-legacy@example.invalid') AND origin = 'fallback-file'").n, 2);
  assert.doesNotMatch((await admin.req('/admin/enquiries')).text, /saved to the fallback file/);
});

test('enquiry search, filters, pagination and workflow', async () => {
  const found = await admin.req('/admin/enquiries?q=findme');
  assert.match(found.text, /Acme Findable/);
  assert.doesNotMatch(found.text, /Legacy Co 3/);
  assert.match((await admin.req('/admin/enquiries?q=Acme+Find')).text, /Findable Person/);
  const all = await admin.req('/admin/enquiries');
  assert.match(all.text, /page 1 of 2/);
  assert.match((await admin.req('/admin/enquiries?page=2')).text, /page 2 of 2/);
  const id = one("SELECT id FROM briefs WHERE email = 'findme@company.example'").id;
  assert.equal((await admin.post(`/api/admin/enquiries/${id}`, { action: 'status', status: 'waiting' })).status, 200);
  assert.equal((await admin.post(`/api/admin/enquiries/${id}`, { action: 'status', status: 'deleted' })).status, 400);
  assert.equal((await admin.post(`/api/admin/enquiries/${id}`, { action: 'assign', assignedTo: ids.user })).status, 400, 'only administrators can own an enquiry');
  assert.equal((await admin.post(`/api/admin/enquiries/${id}`, { action: 'assign', assignedTo: ids.admin })).status, 200);
  assert.equal((await admin.post(`/api/admin/enquiries/${id}`, { action: 'note', body: 'Private synthetic note 8812.' })).status, 200);
  // Unknown fields are ignored: the request cannot rewrite the sender's email.
  await admin.post(`/api/admin/enquiries/${id}`, { action: 'status', status: 'in_progress', email: 'hijack@example.invalid' });
  const row = one('SELECT * FROM briefs WHERE id = ?', id);
  assert.equal(row.email, 'findme@company.example');
  assert.equal(row.status, 'in_progress');
  assert.equal(row.assigned_to, ids.admin);
  assert.ok(row.updated_at);
  const detail = await admin.req(`/admin/enquiries/${id}`);
  assert.match(detail.text, /Private synthetic note 8812/);
  assert.match(detail.text, /Enquiry status changed/);
  assert.equal((await admin.req('/admin/enquiries?status=waiting')).text.includes('Acme Findable'), false);
  assert.match((await admin.req('/admin/enquiries?status=in_progress')).text, /Acme Findable/);
  const anon = new Client();
  assert.equal((await anon.req(`/admin/enquiries/${id}`)).status, 307);
  for (const pathname of ['/', '/contact', '/learn', '/api/comments?slug=money-map']) assert.doesNotMatch((await anon.req(pathname)).text, /Private synthetic note 8812/);
});

// ---------- accounts ----------
test('account pages never expose password hashes or tokens', async () => {
  for (const pathname of ['/admin/users', `/admin/users/${ids.user}`, `/admin/users/${ids.admin}`, '/admin/settings']) {
    const page = await admin.req(pathname);
    assert.equal(page.status, 200, pathname);
    assert.doesNotMatch(page.text, /scrypt:|password_hash|reader_tokens/, pathname);
  }
  const reset = await admin.post(`/api/admin/users/${ids.other}`, { action: 'send-reset' });
  assert.equal(reset.status, 200);
  assert.doesNotMatch(reset.text, /token=|[a-f0-9]{64}/);
  assert.equal(mails.at(-1).to, emails.other);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'user.send_reset' AND (metadata IS NULL OR metadata NOT LIKE '%token%')").n, 1);
});

test('session revocation, disable and reactivate take effect immediately', async () => {
  const reader = new Client();
  assert.ok(await reader.signIn(emails.user));
  assert.equal((await reader.req('/api/account/profile')).status, 200);
  assert.equal((await admin.post(`/api/admin/users/${ids.user}`, { action: 'revoke-sessions' })).status, 200);
  assert.equal((await reader.req('/api/account/profile')).status, 401);
  assert.ok(await reader.signIn(emails.user));
  assert.equal((await admin.post(`/api/admin/users/${ids.user}`, { action: 'disable' })).status, 200);
  assert.equal((await reader.req('/api/account/profile')).status, 401);
  assert.equal(await new Client().signIn(emails.user), false);
  assert.equal((await new Client().req(`/members/${ids.user}`)).status, 404);
  assert.equal((await admin.post(`/api/admin/users/${ids.user}`, { action: 'reactivate' })).status, 200);
  assert.ok(await new Client().signIn(emails.user));
  assert.equal((await admin.post(`/api/admin/users/${ids.admin}`, { action: 'disable' })).status, 403, 'not on own account');
  assert.equal((await admin.post(`/api/admin/users/${ids.user}`, { action: 'grant-admin' })).status, 400, 'no browser route to administrator');
});

test('moderator role changes are audited and removal applies at once', async () => {
  assert.equal((await admin.post(`/api/admin/users/${ids.other}`, { action: 'grant-moderator' })).status, 200);
  const other = new Client();
  assert.ok(await other.signIn(emails.other));
  assert.equal((await other.req('/admin/comments')).status, 200);
  assert.equal((await admin.post(`/api/admin/users/${ids.other}`, { action: 'revoke-moderator' })).status, 200);
  assert.equal((await other.post(`/api/admin/comments/${comments.pending}`, { action: 'approve' })).status, 401);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action IN ('user.grant_moderator','user.revoke_moderator') AND target_id = ?", ids.other).n, 2);
});

// ---------- comments ----------
test('moderation controls public visibility and cannot be self-approved by a moderator', async () => {
  const other = new Client();
  assert.ok(await other.signIn(emails.other));
  const visible = async () => (await other.req('/api/comments?slug=money-map')).json.comments.map((c) => c.id);
  assert.ok(!(await visible()).includes(comments.pending));
  assert.equal((await moderator.post(`/api/admin/comments/${comments.pending}`, { action: 'approve' })).status, 200);
  assert.ok((await visible()).includes(comments.pending));
  assert.ok(one('SELECT moderated_by FROM reader_comments WHERE id = ?', comments.pending).moderated_by === ids.mod);
  assert.equal((await admin.post(`/api/admin/comments/${comments.pending}`, { action: 'remove' })).status, 200);
  assert.ok(!(await visible()).includes(comments.pending));
  assert.equal(one('SELECT status FROM reader_comments WHERE id = ?', comments.pending).status, 'removed', 'soft removal keeps the record');
  assert.equal((await admin.post(`/api/admin/comments/${comments.pending}`, { action: 'approve' })).status, 409);
  const own = await moderator.post('/api/comments', { slug: 'money-map', body: 'The moderator writes a comment.' });
  assert.equal(own.status, 201);
  assert.equal((await moderator.post(`/api/admin/comments/${own.json.id}`, { action: 'approve' })).status, 403);
  assert.equal((await moderator.req('/api/comments/moderate', { method: 'PATCH', json: { id: own.json.id, status: 'approved' } })).status, 403);
  assert.equal(one('SELECT status FROM reader_comments WHERE id = ?', own.json.id).status, 'pending');
  assert.equal((await new Client().post(`/api/admin/comments/${own.json.id}`, { action: 'approve' })).status, 401);
});

// ---------- articles ----------
test('every article URL renders, and withdrawing one hides it until it is restored', async () => {
  const sitemap = (await new Client().req('/sitemap.xml')).text;
  const slugs = [...sitemap.matchAll(/\/learn\/([a-z0-9-]+)</g)].map((m) => m[1]);
  assert.ok(slugs.length >= 4);
  for (const slug of slugs) assert.equal((await new Client().req(`/learn/${slug}`)).status, 200, slug);
  assert.equal((await admin.post('/api/admin/articles/page-check', { hidden: true })).status, 200);
  assert.equal((await new Client().req('/learn/page-check')).status, 404);
  assert.doesNotMatch((await new Client().req('/learn')).text, /href="\/learn\/page-check"/);
  assert.doesNotMatch((await new Client().req('/sitemap.xml')).text, /learn\/page-check</);
  assert.equal((await admin.post('/api/admin/articles/page-check', { hidden: false })).status, 200);
  assert.equal((await new Client().req('/learn/page-check')).status, 200);
  assert.equal((await moderator.post('/api/admin/articles/page-check', { hidden: true })).status, 403);
  assert.equal((await admin.post('/api/admin/articles/not-an-article', { hidden: true })).status, 404);
});

// ---------- leads ----------
test('lead export is administrator-only, consent-aware and audited', async () => {
  const csv = await admin.post('/api/admin/leads/export', {});
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get('content-type'), /text\/csv/);
  assert.match(csv.text, /\+919800000001/);
  assert.doesNotMatch(csv.text, /\+919800000002/, 'number without WhatsApp consent is excluded');
  assert.doesNotMatch(csv.text, /scrypt|password|token/i);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'lead.export'").n, 1);
  assert.equal((await admin.req('/admin/leads?consent=whatsapp')).text.includes('Quiet Lead'), false);
  const id = one("SELECT id FROM leads WHERE email = 'lead2@example.invalid'").id;
  assert.equal((await admin.post(`/api/admin/leads/${id}`, { action: 'status', status: 'contacted' })).status, 200);
});

// ---------- deletion, settings and audit integrity ----------
test('account deletion needs typed confirmation and removes dependent data', async () => {
  assert.equal((await admin.post(`/api/admin/users/${ids.target}`, { action: 'delete', confirmEmail: 'wrong@example.invalid' })).status, 400);
  assert.ok(one('SELECT id FROM readers WHERE id = ?', ids.target));
  assert.equal((await admin.post(`/api/admin/users/${ids.target}`, { action: 'delete', confirmEmail: emails.target })).status, 200);
  assert.equal(one('SELECT id FROM readers WHERE id = ?', ids.target), undefined);
  assert.equal(one('SELECT COUNT(*) AS n FROM reader_comments WHERE reader_id = ?', ids.target).n, 0);
  const entry = one("SELECT * FROM admin_audit WHERE action = 'user.delete'");
  assert.equal(entry.target_id, ids.target);
  assert.doesNotMatch(entry.metadata ?? '', /target@/);
});

test('registration can be closed and reopened from settings', async () => {
  assert.equal((await admin.post('/api/admin/settings', { registrationOpen: false })).status, 200);
  const closed = await new Client().post('/api/account/register', { email: 'new@example.invalid', password: 'Another-synthetic-pass-1', consent: true });
  assert.equal(closed.status, 503);
  assert.match(closed.json.error, /closed/);
  assert.equal((await admin.post('/api/admin/settings', { registrationOpen: true })).status, 200);
  assert.equal((await new Client().post('/api/account/register', { email: 'new@example.invalid', password: 'Another-synthetic-pass-1', consent: true })).status, 201);
});

test('audit records cannot be edited or deleted', () => {
  assert.throws(() => run("UPDATE admin_audit SET actor_label = 'someone else'"), /append-only/);
  assert.throws(() => run('DELETE FROM admin_audit'), /append-only/);
});

// ---------- rate limits without a trusted proxy ----------
test('without a trusted proxy, one visitor cannot exhaust registration or sign-in for everyone, and headers are ignored', async () => {
  // The old per-address limit (5 an hour) applied to all visitors together; seven different people can now register.
  for (let i = 0; i < 7; i++) {
    const response = await new Client().post('/api/account/register', { email: `crowd${i}@example.invalid`, password: 'Crowd-synthetic-pass-1', consent: true }, { headers: { 'x-real-ip': `203.0.113.${i}`, 'x-forwarded-for': `198.51.100.${i}` } });
    assert.equal(response.status, 201, `registration ${i}`);
  }
  // The same email cannot be hammered: three attempts an hour, whatever address header is sent.
  for (let i = 0; i < 3; i++) await new Client().post('/api/account/register', { email: 'crowd0@example.invalid', password: 'Crowd-synthetic-pass-1', consent: true }, { headers: { 'x-real-ip': `192.0.2.${i}` } });
  assert.equal((await new Client().post('/api/account/register', { email: 'crowd0@example.invalid', password: 'Crowd-synthetic-pass-1', consent: true })).status, 429);
  // Per-account guessing limit still applies: after 12 attempts even the right password is refused.
  for (let i = 0; i < 12; i++) assert.equal(await new Client().signIn(emails.lockout, `Wrong-guess-${i}-synthetic`), false);
  assert.equal(await new Client().signIn(emails.lockout), false, 'locked for this account');
  // Other people are unaffected by that guessing run, and successful sign-ins do not use up the shared failure budget.
  assert.ok(await new Client().signIn(emails.other));
  assert.ok(one("SELECT COUNT(*) AS n FROM account_limits").n > 0);
});

test('the legacy moderation queue requires the same recent staff sign-in', async () => {
  const mod = new Client();
  assert.ok(await mod.signIn(emails.mod));
  assert.equal((await mod.req('/api/comments/moderate')).status, 200);
  run('UPDATE reader_sessions SET created_at = ? WHERE reader_id = ?', Date.now() - 13 * 3600000, ids.mod);
  assert.equal((await mod.req('/api/comments/moderate')).status, 401);
  assert.equal((await mod.req('/api/comments/moderate', { method: 'PATCH', json: { id: comments.approved, status: 'approved' } })).status, 401);
  assert.equal((await new Client().req('/api/comments/moderate')).status, 401);
});

test('user-supplied text is escaped in the admin interface', async () => {
  const reader = new Client();
  assert.ok(await reader.signIn(emails.other));
  const created = await reader.post('/api/comments', { slug: 'money-map', body: '<img src=x onerror="alert(1)"> synthetic xss probe' });
  assert.equal(created.status, 201);
  await contact({ email: 'xss@example.invalid', name: '<script>alert(2)</script>', problem: '<b onclick="x()">synthetic</b>' });
  const page = await admin.req('/admin/comments');
  assert.doesNotMatch(page.text, /<img src=x onerror/);
  assert.match(page.text, /&lt;img src=x onerror/);
  const id = one("SELECT id FROM briefs WHERE email = 'xss@example.invalid'").id;
  const detail = await admin.req(`/admin/enquiries/${id}`);
  assert.doesNotMatch(detail.text, /<script>alert\(2\)|<b onclick/);
});

test('server scripts: online backup verifies its copy, moderator provisioning is audited', () => {
  const target = path.join(data, 'backups', 'check-backup.db');
  const backup = spawnSync(process.execPath, ['scripts/backup-db.mjs', target], { env: { ...process.env, VEXA_DATA_DIR: data }, encoding: 'utf8' });
  assert.equal(backup.status, 0, backup.stderr);
  assert.match(backup.stdout, /verified/);
  const copy = new Database(target, { readonly: true });
  assert.equal(copy.prepare('SELECT COUNT(*) AS n FROM briefs').get().n, one('SELECT COUNT(*) AS n FROM briefs').n);
  copy.close();
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(target + suffix, { force: true });
  const moderator = spawnSync(process.execPath, ['scripts/provision-moderator.mjs', ids.lockout], { env: { ...process.env, VEXA_DATA_DIR: data }, encoding: 'utf8' });
  assert.equal(moderator.status, 0, moderator.stderr);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'user.grant_moderator' AND actor_label = 'server command' AND target_id = ?", ids.lockout).n, 1);
});

test('records survive an application restart', async () => {
  const counts = () => ({ briefs: one('SELECT COUNT(*) AS n FROM briefs').n, notes: one('SELECT COUNT(*) AS n FROM admin_notes').n, audit: one('SELECT COUNT(*) AS n FROM admin_audit').n, migrations: one('SELECT COUNT(*) AS n FROM schema_migrations').n });
  const beforeRestart = counts();
  await stopServer();
  await startServer();
  assert.deepEqual(counts(), beforeRestart);
  const again = new Client();
  assert.ok(await again.signIn(emails.admin));
  assert.match((await again.req('/admin/enquiries?q=findme')).text, /Acme Findable/);
  assert.equal(fs.readdirSync(path.join(data, 'backups')).filter((name) => name.startsWith('pre-migration-')).length, 1, 'no new snapshot when nothing is pending');
});

// ---------- two-step sign-in (TOTP) ----------
// An independent RFC 6238 implementation, so the server's codes are checked against the standard, not against itself.
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const b32decode = (text) => { let bits = 0, value = 0; const out = []; for (const c of text.replace(/[\s=]/g, '')) { value = (value << 5) | B32.indexOf(c); bits += 5; if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; } } return Buffer.from(out); };
const hotp = (key, counter, digits = 6) => { const msg = Buffer.alloc(8); msg.writeBigUInt64BE(BigInt(counter)); const d = createHmac('sha1', key).update(msg).digest(); const o = d[d.length - 1] & 15; return String((((d[o] & 127) << 24) | (d[o + 1] << 16) | (d[o + 2] << 8) | d[o + 3]) % 10 ** digits).padStart(digits, '0'); };
const nowStep = () => Math.floor(Date.now() / 30000);
const code = (secret, offset = 0) => hotp(b32decode(secret), nowStep() + offset);
const wrongCode = (secret) => { const valid = new Set([-1, 0, 1, 2].map((offset) => code(secret, offset))); for (let i = 0; ; i++) { const candidate = String((123456 + i * 7919) % 1000000).padStart(6, '0'); if (!valid.has(candidate)) return candidate; } };
const clearLimits = () => run('DELETE FROM account_limits');
let adminSecret, recoveryCodes, verifiedAdmin;

test('the test TOTP helper matches the RFC 6238 reference vectors', () => {
  assert.equal(hotp(Buffer.from('12345678901234567890'), Math.floor(59 / 30), 8), '94287082');
  assert.equal(hotp(Buffer.from('12345678901234567890'), Math.floor(1111111109 / 30), 8), '07081804');
});

test('with enrolment relaxed, two-step sign-in is optional until enrolled; enrolment confirms a code and shows recovery codes once', async () => {
  clearLimits();
  verifiedAdmin = new Client();
  assert.ok(await verifiedAdmin.signIn(emails.admin));
  assert.equal((await verifiedAdmin.req('/admin')).status, 200, 'optional before enrolment');
  assert.equal((await verifiedAdmin.req('/admin/security')).status, 200);
  assert.equal((await new Client().post('/api/admin/security/enrol', { action: 'start' })).status, 401, 'signed out');
  assert.equal((await verifiedAdmin.post('/api/admin/security/enrol', { action: 'start' }, { origin: 'https://evil.example' })).status, 403, 'foreign origin');
  assert.equal((await verifiedAdmin.post('/api/admin/security/enrol', { action: 'confirm', code: '123456' })).status, 409, 'nothing started');
  const started = await verifiedAdmin.post('/api/admin/security/enrol', { action: 'start' });
  assert.equal(started.status, 200);
  adminSecret = started.json.secret;
  assert.match(adminSecret, /^[A-Z2-7]{32}$/);
  assert.match(started.json.uri, new RegExp(`^otpauth://totp/VEXA%3Aadmin%40example\\.invalid\\?secret=${adminSecret}&issuer=VEXA&algorithm=SHA1&digits=6&period=30$`));
  const stored = one('SELECT totp_secret, totp_pending FROM readers WHERE id = ?', ids.admin);
  assert.equal(stored.totp_secret, null, 'not active until confirmed');
  assert.match(stored.totp_pending, /^v1\./);
  assert.ok(!stored.totp_pending.includes(adminSecret), 'stored encrypted');
  const wrong = await verifiedAdmin.post('/api/admin/security/enrol', { action: 'confirm', code: wrongCode(adminSecret) });
  assert.equal(wrong.status, 400);
  assert.equal(one('SELECT totp_secret FROM readers WHERE id = ?', ids.admin).totp_secret, null);
  const confirmed = await verifiedAdmin.post('/api/admin/security/enrol', { action: 'confirm', code: code(adminSecret) });
  assert.equal(confirmed.status, 200, confirmed.text);
  recoveryCodes = confirmed.json.recoveryCodes;
  assert.equal(recoveryCodes.length, 10);
  assert.equal(new Set(recoveryCodes).size, 10);
  for (const entry of recoveryCodes) assert.match(entry, /^[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/);
  const row = one('SELECT totp_secret, totp_pending, totp_enabled_at FROM readers WHERE id = ?', ids.admin);
  assert.match(row.totp_secret, /^v1\./);
  assert.equal(row.totp_pending, null);
  assert.ok(row.totp_enabled_at);
  const db = sql();
  const hashes = db.prepare('SELECT code_hash FROM staff_recovery_codes WHERE reader_id = ?').all(ids.admin).map((r) => r.code_hash);
  db.close();
  assert.equal(hashes.length, 10);
  for (const entry of recoveryCodes) assert.ok(!hashes.some((h) => h.includes(entry.replace('-', ''))), 'recovery codes are stored hashed');
  // The enrolling session counts as verified; admin work continues without another code.
  assert.equal((await verifiedAdmin.req('/admin')).status, 200);
  assert.equal((await verifiedAdmin.post('/api/admin/settings', { registrationOpen: true })).status, 200);
  const page = await verifiedAdmin.req('/admin/security');
  assert.match(page.text, /Recovery codes left/);
  assert.ok(!page.text.includes(adminSecret) && !recoveryCodes.some((entry) => page.text.includes(entry)), 'secret and codes are not shown again');
  for (const pathname of ['/admin/users', `/admin/users/${ids.admin}`, '/admin/audit', '/admin/settings']) assert.doesNotMatch((await verifiedAdmin.req(pathname)).text, /v1\.[A-Za-z0-9_-]{16}|totp_secret/, pathname);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'staff.totp_enrolled' AND actor_id = ?", ids.admin).n, 1);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'auth.second_factor_failed' AND actor_id = ?", ids.admin).n, 1);
  assert.equal(one('SELECT COUNT(*) AS n FROM admin_audit WHERE metadata LIKE ? OR metadata LIKE ?', `%${adminSecret}%`, `%${recoveryCodes[0]}%`).n, 0);
});

test('enrolment emails the staff member a notice without any code or key, and Settings shows the policy', async () => {
  const notice = mails.find((m) => m.to === emails.admin && m.purpose === 'staff-security');
  assert.ok(notice, 'security notice sent to the account address');
  assert.equal(notice.event, 'totp_enrolled');
  assert.deepEqual(Object.keys(notice).sort(), ['at', 'event', 'purpose', 'to']);
  const raw = JSON.stringify(notice);
  assert.ok(!raw.includes(adminSecret) && !recoveryCodes.some((entry) => raw.includes(entry)) && !raw.includes(TOTP_KEY), 'no secret material in the email');
  assert.match(one("SELECT metadata FROM admin_audit WHERE action = 'staff.totp_enrolled' AND actor_id = ?", ids.admin).metadata, /"notified":true/);
  const settings = await verifiedAdmin.req('/admin/settings');
  assert.equal(settings.status, 200);
  assert.match(settings.text, /Two-step sign-in policy/);
  assert.match(settings.text, /Relaxed \(STAFF_TOTP_REQUIRED=false\)/, 'this suite runs relaxed and the page says so');
  assert.match(settings.text, /Encryption key<\/dt><dd>Configured/);
  assert.match(settings.text, /\d+ of \d+ active staff accounts/);
  assert.match(settings.text, /30 a day/);
  assert.ok(!settings.text.includes(TOTP_KEY), 'the key itself is never shown');
});

test('once enrolled, a password-only session is refused by admin pages and APIs until it enters a code', async () => {
  clearLimits();
  const passwordOnly = new Client();
  assert.ok(await passwordOnly.signIn(emails.admin));
  const dashboard = await passwordOnly.req('/admin');
  assert.equal(dashboard.status, 307);
  assert.match(dashboard.location, /\/admin\/verify\?next=%2Fadmin$/);
  assert.match((await passwordOnly.req('/admin/users')).location, /\/admin\/verify\?next=%2Fadmin%2Fusers/);
  assert.match((await passwordOnly.req('/admin/security')).location, /\/admin\/verify/);
  assert.equal((await passwordOnly.req('/admin/verify')).status, 200);
  for (const [endpoint, body] of [['/api/admin/settings', { registrationOpen: false }], ['/api/admin/enquiries/1', { action: 'note', body: 'should not save' }], ['/api/admin/users/' + ids.other, { action: 'disable' }], ['/api/admin/leads/export', {}], ['/api/admin/comments/' + comments.approved, { action: 'remove' }]]) {
    const refused = await passwordOnly.post(endpoint, body);
    assert.equal(refused.status, 401, endpoint);
    assert.match(refused.json.error, /authenticator/);
  }
  assert.equal((await passwordOnly.req('/api/comments/moderate', { method: 'PATCH', json: { id: comments.approved, status: 'approved' } })).status, 401, 'the legacy moderation route too');
  // An enrolled account cannot replace its authenticator with the password alone.
  assert.equal((await passwordOnly.post('/api/admin/security/enrol', { action: 'start' })).status, 401);
  assert.equal(one('SELECT disabled_at FROM readers WHERE id = ?', ids.other).disabled_at, null);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_notes WHERE body = 'should not save'").n, 0);
  // Wrong code, then the code the enrolment already used (replay), then a fresh one.
  const failedBefore = one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'auth.second_factor_failed'").n;
  assert.equal((await passwordOnly.post('/api/admin/security/verify', { code: wrongCode(adminSecret) })).status, 400);
  const usedStep = one('SELECT totp_last_step AS s FROM readers WHERE id = ?', ids.admin).s;
  assert.equal((await passwordOnly.post('/api/admin/security/verify', { code: hotp(b32decode(adminSecret), usedStep) })).status, 400, 'a used code cannot be replayed');
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'auth.second_factor_failed'").n, failedBefore + 2);
  assert.equal((await passwordOnly.post('/api/admin/settings', { registrationOpen: true })).status, 401);
  const verified = await passwordOnly.post('/api/admin/security/verify', { code: code(adminSecret, 1) });
  assert.equal(verified.status, 200, verified.text);
  assert.equal(verified.json.method, 'totp');
  assert.equal((await passwordOnly.req('/admin')).status, 200);
  assert.equal((await passwordOnly.post('/api/admin/settings', { registrationOpen: true })).status, 200);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'auth.second_factor' AND actor_id = ?", ids.admin).n, 1);
  // The other, already verified browser is unaffected.
  assert.equal((await verifiedAdmin.post('/api/admin/settings', { registrationOpen: true })).status, 200);
});

test('recovery codes work once each, and a forged or expired session gains nothing', async () => {
  clearLimits();
  const lostPhone = new Client();
  assert.ok(await lostPhone.signIn(emails.admin));
  const used = await lostPhone.post('/api/admin/security/verify', { code: recoveryCodes[0].toLowerCase().replace('-', ' ') });
  assert.equal(used.status, 200, used.text);
  assert.equal(used.json.method, 'recovery');
  assert.equal(used.json.recoveryCodesLeft, 9);
  assert.equal((await lostPhone.req('/admin/enquiries')).status, 200);
  const again = new Client();
  assert.ok(await again.signIn(emails.admin));
  assert.equal((await again.post('/api/admin/security/verify', { code: recoveryCodes[0] })).status, 400, 'a recovery code works once');
  assert.equal((await again.post('/api/admin/security/verify', { code: recoveryCodes[1] })).status, 200);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'auth.second_factor' AND metadata LIKE '%recovery%'").n, 2);
  // Verification belongs to the session row: an old sign-in stays expired even after a code.
  run('UPDATE reader_sessions SET created_at = ? WHERE reader_id = ?', Date.now() - 13 * 3600000, ids.admin);
  assert.equal((await again.post('/api/admin/settings', { registrationOpen: true })).status, 401);
  const forged = new Client();
  for (const [name, value] of lostPhone.cookies) forged.cookies.set(name, name.endsWith('session') ? value.slice(0, -4) + 'AAAA' : value);
  assert.equal((await forged.post('/api/admin/security/verify', { code: code(adminSecret) })).status, 401);
});

test('code attempts are rate-limited per account and the lockout is audited', async () => {
  clearLimits();
  const mod = new Client();
  assert.ok(await mod.signIn(emails.mod));
  const started = await mod.post('/api/admin/security/enrol', { action: 'start' });
  assert.equal(started.status, 200);
  for (let i = 0; i < 6; i++) assert.equal((await mod.post('/api/admin/security/enrol', { action: 'confirm', code: wrongCode(started.json.secret) })).status, 400, `attempt ${i + 1}`);
  const limited = await mod.post('/api/admin/security/enrol', { action: 'confirm', code: code(started.json.secret) });
  assert.equal(limited.status, 429, 'even the right code waits out the limit');
  assert.equal((await mod.post('/api/admin/security/enrol', { action: 'confirm', code: code(started.json.secret) })).status, 429);
  assert.equal(one('SELECT totp_secret FROM readers WHERE id = ?', ids.mod).totp_secret, null);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'auth.second_factor_limited' AND actor_id = ?", ids.mod).n, 1, 'recorded once per window');
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'auth.second_factor_failed' AND actor_id = ?", ids.mod).n, 6);
  assert.equal((await mod.req('/admin/comments')).status, 200, 'still optional for the moderator while enrolment is relaxed');
});

// Waits, if needed, until a time step newer than the last accepted one is inside the server's drift window.
async function freshCode(secret, readerId) {
  for (;;) {
    const last = one('SELECT totp_last_step AS s FROM readers WHERE id = ?', readerId).s ?? -1;
    const step = Math.max(last + 1, nowStep() - 1);
    if (step <= nowStep() + 1) return hotp(b32decode(secret), step);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
async function restartWith(changes) {
  await stopServer();
  env = { ...env, ...changes };
  for (const [name, value] of Object.entries(changes)) if (value === undefined) delete env[name];
  await startServer();
}

test('a daily cap stops slow code guessing that stays under the 15-minute limit', async () => {
  clearLimits();
  const mod = new Client();
  assert.ok(await mod.signIn(emails.mod));
  const started = await mod.post('/api/admin/security/enrol', { action: 'start' });
  assert.equal(started.status, 200);
  const fifteenMinuteKey = createHash('sha256').update(`second-factor:${ids.mod}`).digest('hex');
  // Five rounds of six wrong codes, each round below the 15-minute limit (simulated by clearing only that counter).
  for (let round = 0; round < 5; round++) {
    for (let i = 0; i < 6; i++) assert.equal((await mod.post('/api/admin/security/enrol', { action: 'confirm', code: wrongCode(started.json.secret) })).status, 400, `round ${round + 1}, attempt ${i + 1}`);
    run('DELETE FROM account_limits WHERE key = ?', fifteenMinuteKey);
  }
  const capped = await mod.post('/api/admin/security/enrol', { action: 'confirm', code: code(started.json.secret) });
  assert.equal(capped.status, 429, 'the 31st attempt in a day is refused, even with the right code');
  assert.match(capped.json.error, /today/);
  assert.equal(one('SELECT totp_secret FROM readers WHERE id = ?', ids.mod).totp_secret, null);
  assert.equal(one(`SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'auth.second_factor_limited' AND actor_id = ? AND metadata LIKE '%"window":"day"%'`, ids.mod).n, 1);
  clearLimits();
});

test('revoking sessions also removes their two-step verification', async () => {
  clearLimits();
  const browser = new Client();
  assert.ok(await browser.signIn(emails.admin));
  assert.equal((await browser.post('/api/admin/security/verify', { code: await freshCode(adminSecret, ids.admin) })).status, 200);
  assert.equal((await browser.req('/admin/users')).status, 200);
  assert.equal((await browser.post(`/api/admin/users/${ids.admin}`, { action: 'revoke-sessions' })).status, 200);
  assert.equal((await browser.post('/api/admin/settings', { registrationOpen: true })).status, 401);
  assert.equal(one('SELECT COUNT(*) AS n FROM reader_sessions WHERE reader_id = ? AND second_factor_at IS NOT NULL', ids.admin).n, 0);
});

test('authenticator keys need a stable STAFF_TOTP_KEY and survive a planned key rotation', async () => {
  const sealed = one('SELECT totp_secret FROM readers WHERE id = ?', ids.admin).totp_secret;
  const newKey = randomBytes(32).toString('base64url');
  try {
    // A changed key without the old one cannot read existing keys: a clear refusal, never a bypass.
    await restartWith({ STAFF_TOTP_KEY: newKey });
    clearLimits();
    const browser = new Client();
    assert.ok(await browser.signIn(emails.admin));
    const unreadable = await browser.post('/api/admin/security/verify', { code: await freshCode(adminSecret, ids.admin) });
    assert.equal(unreadable.status, 503);
    for (const secret of [TOTP_KEY, newKey, adminSecret]) assert.ok(!unreadable.text.includes(secret), 'no key material in the response');
    assert.equal((await browser.post('/api/admin/settings', { registrationOpen: true })).status, 401);
    // With the old key as STAFF_TOTP_KEY_PREVIOUS the code works, and the stored key is re-sealed with the new one.
    await restartWith({ STAFF_TOTP_KEY: newKey, STAFF_TOTP_KEY_PREVIOUS: TOTP_KEY });
    clearLimits();
    assert.ok(await browser.signIn(emails.admin));
    assert.equal((await browser.post('/api/admin/security/verify', { code: await freshCode(adminSecret, ids.admin) })).status, 200);
    const resealed = one('SELECT totp_secret FROM readers WHERE id = ?', ids.admin).totp_secret;
    assert.notEqual(resealed, sealed);
    assert.ok(!resealed.includes(adminSecret));
    // Rotation finished: only the new key is configured and the account keeps working.
    await restartWith({ STAFF_TOTP_KEY: newKey, STAFF_TOTP_KEY_PREVIOUS: undefined });
    clearLimits();
    assert.ok(await browser.signIn(emails.admin));
    assert.equal((await browser.post('/api/admin/security/verify', { code: await freshCode(adminSecret, ids.admin) })).status, 200);
    // A key shorter than 32 characters is refused rather than weakly used.
    await restartWith({ STAFF_TOTP_KEY: 'too-short-key' });
    clearLimits();
    const mod = new Client();
    assert.ok(await mod.signIn(emails.mod));
    assert.equal((await mod.post('/api/admin/security/enrol', { action: 'start' })).status, 503);
  } finally {
    // The rest of the suite runs on the new key, which now protects the stored secret.
    await restartWith({ STAFF_TOTP_KEY: newKey, STAFF_TOTP_KEY_PREVIOUS: undefined });
  }
});

test('the server reset command removes the second factor and ends every session of that account', async () => {
  const reset = (...args) => spawnSync(process.execPath, ['scripts/reset-staff-totp.mjs', ...args], { env: { ...process.env, VEXA_DATA_DIR: data }, encoding: 'utf8' });
  assert.equal(reset().status, 2);
  assert.equal(reset('--email', 'nobody@example.invalid').status, 1);
  const unchanged = reset('--email', emails.user);
  assert.equal(unchanged.status, 0);
  assert.match(unchanged.stdout, /No change/);
  const done = reset('--email', emails.admin);
  assert.equal(done.status, 0, done.stderr);
  assert.doesNotMatch(done.stdout, /v1\.|[A-Z2-7]{32}/);
  const row = one('SELECT totp_secret, totp_pending, totp_enabled_at, totp_last_step FROM readers WHERE id = ?', ids.admin);
  assert.deepEqual([row.totp_secret, row.totp_pending, row.totp_enabled_at, row.totp_last_step], [null, null, null, null]);
  assert.equal(one('SELECT COUNT(*) AS n FROM staff_recovery_codes WHERE reader_id = ?', ids.admin).n, 0);
  assert.equal(one('SELECT COUNT(*) AS n FROM reader_sessions WHERE reader_id = ?', ids.admin).n, 0);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'staff.totp_reset' AND target_id = ? AND actor_label = 'server command'", ids.admin).n, 1);
  assert.equal((await verifiedAdmin.post('/api/admin/settings', { registrationOpen: true })).status, 401, 'old sessions are gone');
  clearLimits();
  admin = new Client();
  assert.ok(await admin.signIn(emails.admin));
  assert.equal((await admin.req('/admin')).status, 200, 'password alone works again until re-enrolment');
});

test('by default every staff account must enrol before any admin page, API or the legacy moderation queue', async () => {
  await restartWith({ STAFF_TOTP_REQUIRED: undefined });
  clearLimits();
  const other = new Client();
  assert.ok(await other.signIn(emails.other));
  assert.equal((await other.req('/admin')).status, 404, 'not staff: nothing to enrol for');
  run('UPDATE readers SET moderator = 1 WHERE id = ?', ids.other);
  assert.ok(await other.signIn(emails.other));
  const page = await other.req('/admin/comments');
  assert.equal(page.status, 307);
  assert.match(page.location, /\/admin\/security\?next=%2Fadmin%2Fcomments/);
  assert.match((await other.req('/admin')).location, /\/admin\/security/);
  assert.match((await other.req('/account/moderation')).location, /\/admin\/comments/);
  const legacy = await other.req('/api/comments/moderate');
  assert.equal(legacy.status, 403);
  assert.match(legacy.json.error, /two-step/);
  assert.equal((await other.req('/api/comments/moderate', { method: 'PATCH', json: { id: comments.approved, status: 'approved' } })).status, 403);
  const refused = await other.post(`/api/admin/comments/${comments.approved}`, { action: 'remove' });
  assert.equal(refused.status, 403);
  assert.match(refused.json.error, /two-step/);
  const setup = await other.req('/admin/security?next=%2Fadmin%2Fcomments');
  assert.equal(setup.status, 200);
  assert.match(setup.text, /required for staff accounts/);
  const started = await other.post('/api/admin/security/enrol', { action: 'start' });
  assert.equal((await other.post('/api/admin/security/enrol', { action: 'confirm', code: code(started.json.secret) })).status, 200);
  assert.equal((await other.req('/admin/comments')).status, 200);
  assert.equal((await other.req('/api/comments/moderate')).status, 200);
  assert.equal(one("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'staff.totp_enrolled' AND actor_id = ?", ids.other).n, 1);
  // The administrator, reset in the previous test, is held at enrolment too.
  clearLimits();
  const adminAgain = new Client();
  assert.ok(await adminAgain.signIn(emails.admin));
  assert.match((await adminAgain.req('/admin/users')).location, /\/admin\/security/);
  assert.equal((await adminAgain.post('/api/admin/users/' + ids.user, { action: 'disable' })).status, 403);
  assert.equal(one('SELECT disabled_at FROM readers WHERE id = ?', ids.user).disabled_at, null);
});

test('the server lead export leaves out WhatsApp numbers without consent', () => {
  const exported = spawnSync(process.execPath, ['scripts/export-leads.mjs'], { env: { ...process.env, VEXA_DATA_DIR: data }, encoding: 'utf8' });
  assert.equal(exported.status, 0, exported.stderr);
  assert.match(exported.stdout, /\+919800000001/, 'consented number is exported');
  assert.doesNotMatch(exported.stdout, /\+919800000002/, 'number without WhatsApp consent is not');
  assert.match(exported.stdout, /lead2@example\.invalid/, 'the lead itself is still exported');
  assert.doesNotMatch(exported.stdout, /scrypt|totp|password/i);
});
