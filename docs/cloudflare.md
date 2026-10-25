# Deploying to Cloudflare

The site runs as a Cloudflare **Worker** (built with the OpenNext adapter), talks to **PostgreSQL through Hyperdrive**, and serves
static files from Cloudflare's network. Nothing is stored on the Worker itself.

```
visitor -> Cloudflare (WAF, HTTPS) -> Worker (the Next.js site) -> Hyperdrive -> your PostgreSQL
                                                   \-> Gmail API / Resend / Google sign-in
```

## 0. What you need

- A Cloudflare account, and `vexadigital.in` added to it (for the final domain).
- **A PostgreSQL database a Worker can reach.** `127.0.0.1` (your laptop or the old server) cannot be reached from Cloudflare. Pick one:
  - **A hosted Postgres** (Neon, Supabase, Railway, AWS RDS ...). Simplest. Use its "connection string". Choose a region near India.
  - **Your own server's Postgres**, exposed privately with a Cloudflare Tunnel (Hyperdrive supports it): https://developers.cloudflare.com/hyperdrive/configuration/connect-to-private-database/
- Node 22 and this repo on your computer (`npm install`).

## 1a. Using Supabase

1. supabase.com > New project. Pick the region closest to your visitors (Mumbai, `ap-south-1`) and a **strong database password** (save it).
2. Project > **Connect** (top bar) > tab **Session pooler** (or **Direct connection** if your plan has the IPv4 add-on). Copy the URI; it looks like
   `postgres://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`. Port **5432**.
   Do not use the "Transaction pooler" (port 6543): Hyperdrive already pools connections.
3. Put that URI in `.env.production` as `DATABASE_URL=...` and use it for the Hyperdrive step below.
4. The schema turns on row level security for every table, so Supabase's public REST API (and the project's anon key) cannot read your users or enquiries. Leave RLS on and do not add policies.
5. Supabase > Database > Backups: check daily backups are on (paid plans have point-in-time recovery).

## 1. Create the production database

```bash
# put the production connection string in .env.production (DATABASE_URL=postgres://...), then:
npm run db:schema:prod          # creates the tables (safe to run again)
npm run db:import-json:prod     # only if you still have old JSON data to bring over
```

To copy what is in your local database instead: `pg_dump --data-only --inserts <local-url> | psql <production-url>` (after the schema step).
Then make your admin: `npm run make-admin:prod -- you@example.com`.

## 2. Create the Hyperdrive connection

```bash
npx wrangler login
npx wrangler hyperdrive create vexa-db --connection-string="postgres://USER:PASSWORD@HOST:5432/DBNAME"
```

Copy the `id` it prints into [wrangler.jsonc](../wrangler.jsonc) (`hyperdrive[0].id`), replacing `REPLACE-WITH-YOUR-HYPERDRIVE-ID`.
Commit that change (the id is not a secret).

## 3. Settings and secrets

In the dashboard: **Workers & Pages > your Worker > Settings > Variables and Secrets**. (Deploys keep what you set there.)
Or from the terminal: `npx wrangler secret put NAME`.

| Name | Type | Value |
| --- | --- | --- |
| `SITE_URL` | text | `https://www.vexadigital.in` (the final address, https, no trailing slash). While testing, use the Worker's `https://....workers.dev` address. |
| `SESSION_SECRET` | **secret** | 48+ random characters: `openssl rand -base64 48`. Required, the site refuses to run without it. |
| `ADMIN_EMAILS` | text | Already set in `wrangler.jsonc` to `sahil@vexadigital.in` only. Other admins are made from Admin > Users. |
| `GOOGLE_CLIENT_ID` | text | Google sign-in client id (no secret needed). |
| `RESEND_API_KEY` | **secret** | Resend key for verification and reset emails. |
| `MAIL_FROM` | text | `Vexa Digital <no-reply@mail.vexadigital.in>` |
| `GMAIL_AUTH` | text | `oauth` |
| `GMAIL_OAUTH_CLIENT_ID` | text | from `.env.local` |
| `GMAIL_OAUTH_CLIENT_SECRET` | **secret** | from `.env.local` |
| `GMAIL_OAUTH_REFRESH_TOKEN` | **secret** | from `.env.local` |
| `CONTACT_WEBHOOK_URL` / `CONTACT_WEBHOOK_TOKEN` | text / secret | only if you use the n8n flow |

`DATABASE_URL` is **not** set on the Worker: it uses the Hyperdrive binding.

## 4. Deploy

The site is deployed by Cloudflare, from GitHub. Nothing is deployed from your computer.

- Every push to `main` starts a build on Cloudflare: `npx opennextjs-cloudflare build`, then `npx wrangler deploy`.
- Check the result under **Workers & Pages > vexa-website-staging > Deployments**. A failed build keeps the previous version live.
- Secrets and settings on the Worker are kept across deploys (`keep_vars` in `wrangler.jsonc`).
- To release, merge the change into `main`. Work happens on a branch and goes into `main` through a pull request.

## 5. Your domain

1. Workers & Pages > your Worker > Settings > **Domains & Routes** > Add > Custom domain > `www.vexadigital.in`.
2. Optionally redirect the bare domain `vexadigital.in` to `www` (Rules > Redirect Rules).
3. Set `SITE_URL` to the final address, and add it to your Google OAuth client's **Authorised JavaScript origins**
   (Google Cloud Console > Credentials).
4. **Email keeps working** only if the DNS records stay as they are: do not delete the MX records, and keep the SPF, DKIM
   (Google Workspace and Resend) and DMARC records. Records for mail must be "DNS only" (grey cloud), never proxied.

## 6. Protect it (recommended)

- **Cloudflare Access on `/admin/*`** (Zero Trust > Access > Applications > Self-hosted). It puts a second sign-in, with
  one-time codes or Google and optional MFA, in front of the admin area. This covers the missing two-factor step.
- **Rate limiting / WAF**: Security > WAF > Rate limiting rules: for example `/api/auth/*` at 20 requests per minute per IP.
  The site also limits itself in the database (login, sign-up, reset, comments, contact).
- **Bot Fight Mode** on, **SSL/TLS mode Full (strict)**, **Always Use HTTPS** on.
- Turn on Workers **observability** (already enabled in `wrangler.jsonc`) and watch Logs after the first deploy.

## 7. After the first deploy: check

- `/` and `/articles` load; `/sitemap.xml` and `/robots.txt` show your `SITE_URL`.
- `/admin` shows a plain "Not found" when you are signed out, and the panel when you are an admin.
- Sign up with a new email: the verification mail arrives, the link opens `SITE_URL/verify-email`, and the account is created.
- Forgot password: the mail's link points at `SITE_URL`.
- Admin > Inbox loads your mail and sending works.
- Response headers include `Content-Security-Policy` and `Strict-Transport-Security`.

## Run the Workers version on your computer

```bash
npm run preview     # builds and runs the site in the real Workers runtime on http://localhost:8787
```

It reads secrets from `.dev.vars` (copy `.dev.vars.example`) and uses your local database through
`CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=<local DATABASE_URL>`. `/sitemap.xml` needs an `https` `SITE_URL`.

## Things to know

- **Rate limits and sessions are shared**: they live in the database, so every Worker instance sees the same counts.
- **The site only logs mail errors**: if a message does not send, check Workers logs.
- **Worker size**: about 1.5 MB compressed, inside the free plan's 3 MB limit.
- **Images** are served unoptimised (no Cloudflare Images set up); the site only has a few small logos.
- **Revalidation**: pages that change are rendered on request, so no extra cache store is needed. If you later add statically cached pages that admin edits must refresh, add an R2 incremental cache (OpenNext docs).
- **Existing Worker**: your account already has a Worker called `vexa-website` (created 23 Oct). This repo deploys to `vexa-website-staging`; delete the empty one when you no longer need it, or set `name` to `vexa-website` to reuse it.
