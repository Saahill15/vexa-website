# Admin panel: initial architecture audit

Audit date: 17 October 2026, against `main` at `ac1888f`. Read from source, not from documentation. No production server, database or `.env` was accessed; anything that depends on production configuration is marked as unverified.

## How the website works today

| Area | Implementation in source |
| --- | --- |
| Framework | Next.js 15.5 App Router, React 18, TypeScript, standalone output in Docker behind Traefik |
| Database | One SQLite file, `vexa.db`, in `VEXA_DATA_DIR` (`/app/data`, Docker volume `site_site_data`), opened by `better-sqlite3` in `lib/db.ts` with WAL journalling |
| Schema management | `CREATE TABLE IF NOT EXISTS` on first connection plus one ad-hoc `ALTER TABLE` check. No migration versioning |
| Accounts | `readers` table. Email/password (scrypt) and optional Google Identity Services (signed ID token). A Google identity is never linked automatically to an existing password account |
| Sessions | NextAuth JWT cookie (`__Host-vexa-public-session`), bound to a row in `reader_sessions`. Every request re-checks that row, so deleting it revokes the session |
| Request security | `mutationGuard` (exact `Origin` match against `NEXTAUTH_URL` and JSON content type), 16 KB bounded JSON bodies, SQLite-backed rate limits (`account_limits`), security headers and CSP in `next.config.mjs` |
| Articles | Four TypeScript modules in `content/learn/`, listed in `lib/learn.ts`. Published means "included in the `ARTICLES` array". No database storage, no draft state |
| Comments | `reader_comments` with status `pending`/`approved`/`rejected`. Every new or edited comment returns to `pending` |
| Moderation | `readers.moderator = 1`, assigned only by `scripts/provision-moderator.mjs` on the server. `/account/moderation` lists pending comments; `/api/comments/moderate` approves or rejects |
| Administration | None. No administrator role, no audit log, no account disable, no enquiry workflow |

## Answers to the audit questions

1. **Where does the contact form save submissions?** `components/ContactForm.tsx` and `components/TeamProgrammeForm.tsx` both POST to `/api/contact`, which calls `insertBrief()` and writes a row to the `briefs` table.
2. **Is the enquiry saved before success is shown?** Yes for the normal path: `insertBrief` is synchronous and the route returns `{ok:true}` only afterwards. But see 4 and 13.
3. **Are enquiries stored in `briefs`?** Yes. `role` holds the audience type (`brand`, `organisation`, `other`); `interest` holds the chosen starting points.
4. **When is `contact-submissions.jsonl` used?** Only when the database insert throws. The route then appends the entry to `VEXA_DATA_DIR/contact-submissions.jsonl` and still returns success. The append is not flushed to disk, the records have no identifier, and **nothing in the application or the export script ever reads that file**. A fallback-saved enquiry is invisible to staff.
5. **Is the webhook configured and reachable?** Cannot be verified from source; it depends on the production `.env`. In code, the webhook is optional, awaited with a 5 second timeout, and **any HTTP response, including 4xx/5xx, is treated as delivered**. Network errors are logged as one line with no record against the enquiry. Delivery failures are not observable.
6. **Leads vs enquiries.** `leads` is a separate table filled by `/api/lead` from `components/learn/WaitlistForm.tsx` (used on `/room`, the members' room waiting list). One row per email (upsert), with self-described role, optional WhatsApp number, WhatsApp consent, source slug and UTM source. Consent to store the details is required by the API but its value is not stored (only WhatsApp consent is). Leads are waiting-list sign-ups, not business enquiries.
7. **Accounts and sessions.** `readers` and `reader_sessions` in the same SQLite file.
8. **Articles.** Hard-coded TypeScript, rendered by `app/learn/[slug]/page.tsx`; URLs are `/learn/<slug>`.
9. **Comments.** Submitted by signed-in readers with a complete profile; stored as `pending`; approved/rejected by moderators; authors can edit (back to `pending`) or delete. **Author deletion is a hard `DELETE`.** Moderation records neither who decided nor when.
10. **Existing admin/moderator functionality.** Moderator flag and pending-comment queue only.
11. **Administrator identity.** There is none. Moderators are identified by the `moderator` column, set only through the server-side script.
12. **API routes.** `account/{continue,email,google-nonce,profile,register}`, `auth/[...nextauth]`, `comments`, `comments/[id]`, `comments/moderate`, `contact`, `lead`.
13. **Broken, incomplete or misleading success states.**
    - Fallback-saved enquiries report success but are never surfaced (finding 4).
    - Webhook failures with an HTTP error status are silently treated as success (finding 5).
    - If both the database and the fallback file fail, the route throws and Next.js returns a bare 500 (the form shows a generic error, so not a false success, but untidy).
    - **Rate limits keyed by IP collapse into one global bucket when `VEXA_TRUST_PROXY` is not `1`** (`clientAddress()` returns `"unknown"`). `.env.example` defaults it to `0`. If production runs that way, the contact limit of 10 per hour applies to all visitors combined: the eleventh genuine enquiry in an hour, site-wide, is refused. Production value unverified.
14. **Security or privacy problems to address first.**
    - No audit trail for moderation; no record of who changed what.
    - The privacy policy says "A comment removed through your account is hidden from readers; limited records may remain for review and security." The implementation permanently deletes the row. Not false, but it implies retention that does not happen. Flagged for the owner to reword; the admin "remove" action added here is a genuine soft removal.
    - `scripts/export-leads.mjs` exports every column, including WhatsApp numbers whose owners did not consent to WhatsApp contact. Server-side only, but broader than necessary.
    - No way to disable an account or revoke its sessions short of editing the database by hand.
    - No pre-migration backup step inside the application; the owner release workflow does take a `db.backup()` before syncing.

## Risks considered for the admin panel

- A 30-day reader session is too long a window for privileged actions. Admin access should require a recent sign-in.
- Granting administrator rights from the browser would let one stolen admin session create more admins. Administrator provisioning stays a server-side command.
- The root layout renders the public header and footer on every route; the admin area needs its own chrome without restructuring the public site.
- Moving articles into the database would be a disproportionate rewrite. Git-reviewed content plus a database-held visibility switch fits the current architecture.
- Vvaluate (`/valuate` redirect) is a separate service and is out of scope; nothing here touches it.
