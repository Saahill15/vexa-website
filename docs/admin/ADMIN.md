# Website admin panel

The admin area at `/admin` manages the main VEXA website only: enquiries, waiting-list leads, reader accounts, article visibility, comment moderation and a few operational settings. It uses the existing NextAuth accounts and the existing SQLite database. Valuate (`valuate.vexadigital.in`) is a separate service and is not touched.

See [AUDIT.md](AUDIT.md) for what the code did before this work.

## Where public enquiries go

1. A visitor sends the form on `/contact` (or `/team-programme`). The browser POSTs to `/api/contact`.
2. The route validates the message and inserts it into the `briefs` table in `vexa.db`. **Only after that insert commits** does the visitor see "Message received".
3. If the database insert fails, the message is appended to `contact-submissions.jsonl` in the same data directory and flushed to disk; only then is success shown. If that also fails, the visitor sees "We could not save your message" (HTTP 503) and is asked to retry or email.
4. If `CONTACT_WEBHOOK_URL` is set, the saved message is then forwarded to it (same JSON as before). The outcome (delivered, failed with the HTTP status, timed out) is stored on the enquiry. A failed notification never removes the enquiry.

**To find and manage them:** sign in at `/admin/login`, open **Enquiries**. New messages are badged and counted in the sidebar. Open one to read it, set its status (new, in progress, waiting for response, resolved), assign it to an administrator, add private notes, resend a failed notification and see its history. If anything was saved to the fallback file, a yellow banner at the top of the list shows it with an **Import** button; importing is idempotent and never edits the file.

## Roles

| Role | How it is granted | Can do |
| --- | --- | --- |
| Administrator | Only `scripts/provision-admin.mjs` on the server | Everything in `/admin` |
| Moderator | An administrator (Users → Make moderator), or `scripts/provision-moderator.mjs` | Overview (pending count) and Comments. Cannot moderate their own comments |
| Reader | Registration | Nothing in `/admin` (pages return 404, APIs 403) |

Roles are read from the `readers` row on every request. No cookie, profile field or request body can grant one. Administrator rights cannot be granted, removed, disabled or deleted from the browser, so one stolen admin session cannot create more admins or lock out the owner.

Admin pages and APIs also require a sign-in **from the last 12 hours**. A 30-day reader session is not enough; the admin is sent to `/admin/login` to sign in again.

Every staff account must also use **two-step sign-in**: staff who have not set it up are sent to `/admin/security` and every admin API refuses them (403); staff who have set it up must enter a code from their authenticator app in each new sign-in session before any admin page or API works (401 until then). See below.

## Two-step sign-in (TOTP) for staff

Administrators and moderators use a six-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, Authy and similar; RFC 6238, SHA-1, 6 digits, 30 seconds) after their password or Google sign-in. It is implemented with `node:crypto` only (`lib/totp.ts`, `lib/second-factor.ts`).

**Required by default.** `STAFF_TOTP_REQUIRED` is `true` unless the owner sets it to `false`. `false` is a temporary rollout escape hatch: staff who have not enrolled may then use the admin area with a password only, but anyone who has enrolled must still pass the code. Leave it unset (or `true`) in production.

**Enrolment** (`/admin/security`, also in the sidebar as "Two-step sign-in"):

1. Choose **Set up two-step sign-in**. The page shows a key (in groups of four) and an `otpauth://` set-up link that opens the authenticator app on a phone. No QR code is drawn (it would need a new dependency); type the key into the app's "enter a key" option.
2. Enter the code the app shows. The key becomes active only after a correct code, and must be confirmed within 15 minutes. A notice is emailed to the account's address (see below).
3. Ten one-time **recovery codes** (`XXXXX-XXXXX`) are shown **once**. Save them somewhere other than the phone. The enrolling browser stays signed in; any other signed-in browsers of that account must enter a code.

**Signing in afterwards:** password at `/admin/login` (or Google at `/account`), then `/admin/verify` asks for the app code. "Use a recovery code" accepts one unused recovery code instead (case and the dash do not matter). A code that was already accepted, or an older one, cannot be used again.

**New phone or few recovery codes left:** on `/admin/security`, **Replace authenticator and recovery codes**. This needs a session that already passed the current code (a password alone cannot replace the authenticator). The old key keeps working until the new one is confirmed; then the old key and all old recovery codes stop working and other signed-in browsers must enter a code again.

**Lost phone:** sign in with the password, choose **Use a recovery code**, then replace the authenticator as above.

**Lost phone and recovery codes (server-side reset):** confirm the request with the person by another channel (call, in person), then on the server:

```sh
docker exec vexa-site node scripts/reset-staff-totp.mjs --email person@example.com
```

The command removes the key and recovery codes, **ends every session of that account** (so whoever holds a stolen one is signed out), and writes a `Two-step sign-in reset by server command` audit entry. It prints only the account id and the number of sessions ended. The person then signs in with their password and must enrol again before using the admin area. Locally: `VEXA_DATA_DIR=.local/data node scripts/reset-staff-totp.mjs --email you@example.com`.

**Encryption key (`STAFF_TOTP_KEY`).** Authenticator keys are stored encrypted with AES-256-GCM, bound to the account id, under a key derived (HKDF-SHA256) from `STAFF_TOTP_KEY`.

- In production it is **required** and must be at least 32 characters (`openssl rand -base64 32`). Without it, enrolment and code checks answer 503 and staff cannot use the admin area: the site fails closed, it never skips the second factor. Only local development and previews (`VEXA_PREVIEW=1`) fall back to a key derived from `NEXTAUTH_SECRET`.
- It is deliberately separate from `NEXTAUTH_SECRET`, so rotating the session secret does not affect stored keys.
- Keep it in the server `.env` only, and keep a copy with the database backups (for example in the owner's password manager). A database backup restored without its key has unreadable authenticator keys: every enrolled staff member would then need the reset command.
- **Rotation:** set the new value as `STAFF_TOTP_KEY` and the old one as `STAFF_TOTP_KEY_PREVIOUS`, restart, and let each staff member sign in with an app code once (each key is re-encrypted with the new key on that sign-in; `/admin/users/<id>` shows who is enrolled). Then remove `STAFF_TOTP_KEY_PREVIOUS` and restart. Anyone who has not signed in by then needs the reset command.
- Never paste either value into tickets, chat or logs. The application never prints or logs them.

**How sessions are protected:**

- Recovery codes are stored only as scrypt hashes and are marked used, not deleted; each works once.
- "Passed the second factor" is a column on the server-side session row (`reader_sessions.second_factor_at`), not a cookie or token claim. Revoking sessions, disabling the account, a password reset, removing a role or the server reset command delete the session rows, so verification goes with them. The 12-hour admin window still applies to verified sessions.
- Code attempts (enrolment confirmations and sign-in codes together) are limited to 6 per account per 15 minutes and 30 per account per day. Each wrong code is audited; reaching either limit is audited once per window. Codes, keys and recovery codes are never written to the audit log.
- **Security notice email.** When two-step sign-in is set up or replaced, the staff member's own address receives a notice through the existing account mail service (`ACCOUNT_MAIL_WEBHOOK_URL`), so an enrolment by someone else who has the password does not go unnoticed. The webhook receives `{to, purpose: "staff-security", event: "totp_enrolled" | "totp_replaced", at}`: no code, key or link. **Owner step:** add a branch for `purpose = staff-security` to the n8n mail flow (subject such as "Two-step sign-in was set up on your VEXA staff account", and "if this was not you, contact the site owner"). Until then the webhook may reject it; enrolment still succeeds and the audit entry records `notified: false`.
- **Settings → Two-step sign-in policy** shows whether enrolment is required or relaxed, whether the encryption key is configured (never its value), rotation in progress and how many active staff have enrolled.
- The original moderator queue applies the same rule: `/account/moderation` now forwards staff to `/admin/comments`, and `/api/comments/moderate` uses the same `staffApi` check.

## Pages

| Page | Purpose |
| --- | --- |
| `/admin/login` | Email/password sign-in for staff. Google-only staff sign in at `/account`, then open `/admin` |
| `/admin/verify` | Two-step code (or recovery code) after sign-in |
| `/admin/security` | Set up, or replace, two-step sign-in; recovery-code count; what to do after losing the phone |
| `/admin` | Overview: users and new registrations (7/30/90 days), enquiries (new/open/total), leads, published articles, pending comments, recent enquiries, recent audit activity, fallback and notification warnings |
| `/admin/enquiries` | Search (name, email, company), status and date filters, sort, pagination; fallback import |
| `/admin/enquiries/[id]` | Full message, status, owner, notes, notification status/resend, history |
| `/admin/leads` | Waiting-list sign-ups (`leads` table): search, role/source/consent/status filters, CSV export |
| `/admin/leads/[id]` | Details, consent, follow-up status, notes, history |
| `/admin/users` | Accounts: search by email or name, filter active/disabled/unverified/staff |
| `/admin/users/[id]` | Profile, sign-in methods, verification, active sessions, comments, activity; revoke sessions, disable/reactivate, moderator role, recovery emails, permanent deletion with typed confirmation |
| `/admin/articles` | All source articles with URL, date, comment counts and visibility; source problems (duplicate/invalid slug or date) |
| `/admin/articles/[slug]` | Preview and withdraw/restore an article |
| `/admin/comments` | Pending/approved/rejected/removed/all; search; filter by article; approve, reject, remove |
| `/admin/audit` | Append-only audit log with filters |
| `/admin/settings` | Enquiry delivery status, registration open/closed, mail/Google/proxy status, own session, server-side instructions |

### What leads are

`leads` are the members' room waiting list (`/room`, `components/learn/WaitlistForm.tsx`). They are not enquiries and are not copied into `briefs`. Exports include a WhatsApp number only where the person ticked WhatsApp consent, neutralise spreadsheet formulas, and are logged.

### Articles

Article text stays in `content/learn/*.ts` and is released through a reviewed pull request; moving it into a database CMS would be a large rewrite for four articles. The admin panel adds a database-held **withdraw/restore** switch: a withdrawn article returns 404 and leaves `/learn`, the sitemap and comment posting, without a release. The homepage feature links to `/learn/team-or-tournament` directly; withdrawing that article leaves that link pointing at a 404 until the homepage is edited.

### Comments

Every new or edited comment is `pending`. Approve/reject apply to pending comments; remove applies to approved comments and sets status `removed` (the row is kept and hidden from readers). The moderator and time are recorded. The original `/account/moderation` address now forwards staff to `/admin/comments` (readers still get 404), and its API uses the same audited code and checks.

The privacy policy (updated 17 October 2026) now matches this: a comment its author deletes, or that belongs to a deleted account, is permanently erased; a comment a moderator removes is hidden and kept with who removed it and when. The paragraph keeps its "counsel to confirm" marker.

## Audit log

Recorded: staff sign-ins (success, failure, refused because disabled; failures capped at 5 per account per 15 minutes), two-step codes accepted (with method: app or recovery code, and recovery codes left), wrong two-step codes, two-step rate-limit lockouts, two-step enrolment and replacement, server-side two-step resets, refused admin access by signed-in non-staff (capped), enquiry status/assignment/notes/notification resend/fallback import, lead status/notes/export, account disable/reactivate/session revocation/recovery emails/moderator changes/deletion, administrator grants and removals by the server command, comment decisions, article withdraw/restore, registration setting.

Each row has time, actor id and email, action, target and short scalar metadata. Keys containing words like password, token, secret, hash, session, cookie or link are dropped. Note bodies and messages are never logged (only their length). SQLite triggers reject `UPDATE` and `DELETE` on `admin_audit`.

## Database changes

All changes are additive. `lib/migrations.ts` applies numbered migrations once, records them in `schema_migrations`, and first writes a snapshot with `VACUUM INTO` to `<data dir>/backups/pre-migration-v<N>-<time>.db` when the database already held data. The website runs them at start-up (`instrumentation.ts`).

| Version | Change |
| --- | --- |
| 1 | `readers.admin`, `readers.disabled_at`, `reader_sessions.created_at` (older sessions have none and do not count as recent for admin work) |
| 2 | `briefs.status` (default `new`), `assigned_to`, `updated_at`, `submission_id` (unique when set), `origin`, `webhook_status`, `webhook_detail`, `webhook_at`; indexes |
| 3 | `leads.status` (default `new`), `leads.updated_at` |
| 4 | `reader_comments.moderated_by`, `moderated_at` |
| 5 | New tables `admin_notes`, `admin_audit` (+ append-only triggers), `site_settings`, `article_visibility` |
| 6 | Two-step sign-in: `readers.totp_secret` (encrypted), `totp_pending`, `totp_pending_at`, `totp_enabled_at`, `totp_last_step`; `reader_sessions.second_factor_at`; new table `staff_recovery_codes` (cascades with the account) |

No table or column is dropped or rewritten. Existing enquiries become status `new`.

## API routes

Added (all POST, same-origin JSON only, recent staff sign-in, two-step sign-in, role check, 120 requests/minute per staff member, `Cache-Control: no-store`):

| Route | Role | Actions |
| --- | --- | --- |
| `/api/admin/enquiries/[id]` | admin | `status`, `assign`, `note`, `retry-webhook` |
| `/api/admin/enquiries/import-fallback` | admin | import fallback-file submissions |
| `/api/admin/leads/[id]` | admin | `status`, `note` |
| `/api/admin/leads/export` | admin | CSV export (filters optional) |
| `/api/admin/users/[id]` | admin | `revoke-sessions`, `disable`, `reactivate`, `grant-moderator`, `revoke-moderator`, `send-reset`, `send-verification`, `delete` (needs `confirmEmail`) |
| `/api/admin/comments/[id]` | admin, moderator | `approve`, `reject`, `remove` |
| `/api/admin/articles/[slug]` | admin | `{hidden: true|false}` |
| `/api/admin/settings` | admin | `{registrationOpen: true|false}` |
| `/api/admin/security/enrol` | admin, moderator (own account only) | `start`, `confirm` (with `code`; returns recovery codes once). Works before two-step is done; replacing an existing key needs a verified session |
| `/api/admin/security/verify` | admin, moderator (own account only) | `{code}`: app code or recovery code; marks this session as verified |

Admin pages read the database on the server; there are no admin GET APIs to protect separately.

Modified:

- `/api/contact`: success only after durable storage; fsynced fallback with submission id; 503 when nothing could be saved; webhook result recorded and non-2xx treated as failure.
- Rate limits on `/api/contact`, `/api/lead`, `/api/comments`, `/api/account/register`, `/api/account/email`, `/api/account/google-nonce` and both sign-in providers: see "Rate limits without a trusted proxy" below. Registration also gained a per-email limit (3 an hour).
- `/api/comments/moderate`: now goes through the same `staffApi` check as `/admin` (recent staff sign-in, comment permission, same-origin JSON) and the same audited moderation path; moderators cannot decide on their own comments.
- `/api/comments`: refuses comments on withdrawn articles.
- `/api/account/register`: refused while registration is closed.
- Sign-in (`lib/auth.ts`): disabled accounts cannot sign in; Google cannot create new accounts while registration is closed; staff sign-ins are audited; a new sign-in replaces the browser's previous session row; the session exposes only the sign-in time.
- `/learn`, `/learn/[slug]`, `/sitemap.xml`: hide withdrawn articles (sitemap is now rendered per request).

## Rate limits without a trusted proxy

`lib/request-security.ts` reads `X-Real-IP` only when `VEXA_TRUST_PROXY=1`; otherwise every visitor's address is `"unknown"` and no forwarded header is ever consulted (a client can set those headers itself). Before this change, the per-address limits then became single site-wide limits: five registrations an hour, or thirty sign-in attempts in fifteen minutes, by anyone, blocked everyone.

`allowClient()` in `lib/accounts.ts` keeps the per-address limit when the address is trusted and otherwise applies one shared ceiling sized for all visitors together:

| Limit | Per trusted address | Shared, address unknown |
| --- | --- | --- |
| Password sign-in, failures only | 30 / 15 min | 600 / 15 min |
| Google sign-in | 30 / 15 min | 600 / 15 min |
| Google nonce | 60 / 15 min | 1,200 / 15 min |
| Registration | 5 / hour | 100 / hour |
| Account emails | 10 / hour | 100 / hour |
| Comments | 30 / 10 min | 300 / 10 min |
| Waiting list | 20 / min | 300 / min |
| Contact form | 10 / hour | 200 / hour |

Identity-keyed limits do the targeted work and do not depend on the address: 12 sign-in attempts per email per 15 minutes, 3 registrations and 3 account emails per email per hour, 5 comments per account per 10 minutes. Sign-in now counts only failed attempts against the address/shared budget, so ordinary traffic never uses it up.

Trade-off: a determined attacker could still exhaust a shared ceiling (for example 600 failed sign-ins in 15 minutes), briefly blocking others. The scrypt cost of each attempt slows that down, and the ceilings are far above this site's normal volume, but the real fix is per-client limits: set `VEXA_TRUST_PROXY=1` once the owner confirms Traefik overwrites `X-Real-IP` and the container has no directly published port.

## Provisioning the first administrator

There is no default account, password or sign-up route for staff.

1. Deploy this version (it migrates on start-up).
2. The person registers at `https://www.vexadigital.in/account` and verifies their email (or signs in with Google).
3. On the server:

   ```sh
   docker exec vexa-site node scripts/provision-admin.mjs --email person@example.com
   ```

   The command refuses unknown, unverified or disabled accounts, prints only the account id, and writes an audit entry.
4. They sign in at `/admin/login`.

Remove the role with `--revoke` (also ends their sessions). Moderators can be added in the UI or with `node scripts/provision-moderator.mjs <reader-uuid>`.

## Environment variables (names only)

Two-step sign-in adds `STAFF_TOTP_KEY` (required in production, 32+ characters), `STAFF_TOTP_KEY_PREVIOUS` (only during a key rotation) and `STAFF_TOTP_REQUIRED` (default `true`; leave it so). The admin area also uses: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `VEXA_DATA_DIR`, `VEXA_TRUST_PROXY`, `CONTACT_WEBHOOK_URL`, `CONTACT_WEBHOOK_TOKEN`, `ACCOUNT_MAIL_WEBHOOK_URL`, `ACCOUNT_MAIL_WEBHOOK_TOKEN`, `GOOGLE_IDENTITY_ENABLED`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Settings shows only whether each integration is configured, never a value.

## Local setup and tests

```sh
npm ci
npm run preview          # http://localhost:3310, local database in .local/data
```

To try the admin area locally, register an account in the preview, then:

```sh
VEXA_DATA_DIR=.local/data node scripts/provision-admin.mjs --email you@example.com
```

(Without mail configured the preview does not require email verification for sign-in, but the provisioning command does; mark the local test account verified with any SQLite tool, or use the automated tests.)

Automated checks:

```sh
npm run lint
npm run build
npm run test:admin       # builds into .next-admin-check, runs against a disposable database
```

`test:admin` seeds a database with the pre-migration schema, starts the production build with synthetic mail and webhook servers, and checks migrations, provisioning, permissions, session freshness and revocation, two-step sign-in (RFC 6238 vectors, enrolment, wrong and replayed codes, refusal of password-only sessions by every admin API and the legacy moderation route, mandatory enrolment by default, recovery codes used once, rate limiting and its audit entry, session revocation removing verification, key rotation and wrong or short keys, the server reset command), enquiry durability (including simulated database and disk failures), fallback import, search/filter/pagination, notes privacy, account actions, moderation visibility, article URLs and withdrawal, lead export, audit immutability and persistence across a restart.

### Verification record (17 October 2026, after TOTP integration, Windows 11, Node 24)

| Command | Outcome |
| --- | --- |
| `npm run lint` | No ESLint warnings or errors |
| `npm run build` | Compiled successfully; all `/admin` and `/api/admin` routes dynamic |
| `npm run test:admin` | 35 tests, 35 passed (25 admin and security, 10 two-step sign-in and lead-export) |
| `node scripts/check-accounts.mjs` (existing account probe) | 83 account checks passed (run with `STAFF_TOTP_REQUIRED=false`, since that probe covers reader accounts; staff two-step is covered by `test:admin`); then `check-preview.py` passed 25 checks and stopped at `/valuate`, which redirects to a local Valuate preview on port 3400 that was not running (separate repository, see README). The checks after it in that script (share image, invalid contact/lead bodies) did not run |

The admin UI was also checked by hand in a local production build: sign-in, overview, enquiry list and detail, status change, note, history and comments queue at desktop and narrow widths; the public pages still show their header and footer.

## Backup and rollback

Backups (run before every release that includes migrations, even though the app also snapshots automatically):

```sh
docker exec vexa-site node scripts/backup-db.mjs
```

This uses SQLite's online backup API (safe with WAL), writes `/app/data/backups/manual-<time>.db` in the data volume, and verifies it with `PRAGMA integrity_check`. Copy it off the server too:

```sh
docker cp vexa-site:/app/data/backups/<file>.db /opt/vexa/site-backups/
```

Application rollback: retag and start the previous image (the release workflow tags it `vexa-site:pre-github-<time>`). The added columns and tables are ignored by the old code, so **rolling back the application does not require restoring the database** and loses no data. **Security warning:** older code also ignores the security those columns carry. Rolling back to an image from before two-step sign-in lets staff into the admin area with a password only, and rolling back to an image from before the admin panel removes the admin area and its audit trail entirely. Treat such a rollback as an emergency measure: keep it short, tell staff, and redeploy the current version as soon as possible.

Database rollback (only if a migration itself caused damage): stop the container, keep a copy of the current `vexa.db`, `vexa.db-wal` and `vexa.db-shm`, replace `vexa.db` with the chosen backup, delete the old `-wal`/`-shm`, start the container. Anything written after the backup (enquiries, accounts, comments) is lost, so export those first.

## Deployment (owner only)

Not deployed by this change. When ready:

1. Review and merge the pull request.
2. On the server, take and copy a backup (above) and note the current image id. Add `STAFF_TOTP_KEY` (32+ random characters, `openssl rand -base64 32`) to `/opt/vexa/site/.env` and store a copy with the backups; without it no one can use the admin area.
3. Sync the reviewed source to `/opt/vexa/site` as described in `docs/DEPLOYMENT.md`, then build and start:

   ```sh
   cd /opt/vexa/site
   docker compose -p site -f docker-compose.site.yml build site
   docker compose -p site -f docker-compose.site.yml up -d --no-deps site
   docker logs vexa-site 2>&1 | grep -i "migrations applied"
   ```

4. Check: home page, `/contact` submission (then find it in `/admin/enquiries`), an article, `/sitemap.xml`, `/admin` returns the sign-in page when signed out.
5. Provision the administrator (above). On first sign-in they are taken to `/admin/security` to set up two-step sign-in.
6. Decide on `VEXA_TRUST_PROXY=1` once you confirm Traefik overwrites `X-Real-IP` and the container has no published port.

## Security limitations and open points

- Recovery after losing both the phone and the recovery codes depends on the owner verifying the person out of band before running the reset command.
- Losing `STAFF_TOTP_KEY` (or restoring a database without it) makes every enrolled authenticator unreadable; staff then need the reset command.
- The enrolment page shows the key and an `otpauth://` link but no QR code (no image library was added).
- TOTP is a shared-secret factor: it does not stop real-time phishing of a password and code together. Passkeys/WebAuthn would.
- The CSP still allows `'unsafe-inline'` scripts site-wide (pre-existing; not changed).
- While `VEXA_TRUST_PROXY` is off, IP-based limits fall back to shared ceilings that a determined attacker could exhaust (see above).
- Whether the production webhook is configured and reachable can only be seen in Settings after deployment.
- The updated privacy-policy wording keeps its counsel-review marker; counsel should confirm it.
- Spreadsheet-safe exports prefix cells that start with `=`, `+`, `-`, `@`, tab or carriage return with `'`, so WhatsApp numbers such as `+91...` appear with a leading apostrophe in a spreadsheet.
- Deleting an account does not delete enquiries or waiting-list rows with the same email; handle those manually for a full erasure request.
