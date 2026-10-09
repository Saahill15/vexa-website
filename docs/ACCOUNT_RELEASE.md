# Reader accounts: release contract

Reader accounts belong only to this public website. Public readers receive no team OS identity, token or permissions. Email/password credentials, Google subjects, profile records, sessions, comments and moderation are stored in the website's own durable SQLite volume. Google OAuth uses a website-specific client. Valuate uses separate identities, Google client, database and session secret.

Production cookies are unique `__Host-vexa-public-*` names, Secure, HttpOnly, SameSite=Lax, Path=/, with no Domain attribute. Local cookies use `vexa-public-*`. The legacy lead cookie only remembers an enquiry address and cannot authenticate an account or unlock an article. Full article prose is checked on the server, including direct RSC requests; an incomplete profile cannot unlock it. Names and roles remain self-reported. Staff privileges never come from registration or profile input.

## Production configuration

Required website-only names: `NEXTAUTH_URL=https://www.vexadigital.in`, `NEXTAUTH_SECRET` with at least32 random characters, and `VEXA_DATA_DIR=/app/data` backed by the protected website volume. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` enable Google only when complete; exact callback `https://www.vexadigital.in/api/auth/callback/google`. Do not reuse OS or Valuate OAuth clients or secrets. Google returns a verified email and subject; an email collision cannot take over an existing password account.

Password registration requires configured `ACCOUNT_MAIL_WEBHOOK_URL` and `ACCOUNT_MAIL_WEBHOOK_TOKEN` in production. Email/password sign-in requires inbox verification. Expiring single-use verification links last24 hours; reset links last30 minutes. Only SHA256 token hashes are stored. GET visits do not consume a token, so email scanners cannot perform verification or password changes. Token consumption is an explicit same-origin POST. Reset replaces the salted scrypt hash, verifies the inbox and revokes every existing website session. Expired and replayed links fail closed. `/account/forgot` and `/account/resend` use generic eligible-account responses.

The private transactional relay accepts bearer-protected JSON `{to,purpose,link}` at `/account-email`, where purpose is `verify` or `reset`. It renders fixed templates and validates exact canonical website/Valuate links. The app waits20 seconds and rejects relay redirects. Mail delivery configuration, Gmail acceptance and actual inbox delivery must be checked separately; mocked local acceptance is not proof of either. The existing Google grant belongs only in the isolated private relay, never in any public app container. No paid email provider or arbitrary email sending is introduced.

Set `VEXA_TRUST_PROXY=1` only after proving the single ingress overwrites `X-Real-IP` and the app cannot be reached directly. The website ignores untrusted `X-Forwarded-For` and `CF-Connecting-IP`; the default0 uses a shared unknown-address bucket. Persistent SQLite limits apply to signup, sign-in, recovery, profiles, comments, briefs and legacy lead saving. JSON and NextAuth POST bodies are bounded to16KB; mutations require the configured canonical origin. The website exposes no upload route. Parent should also enforce a small ingress body limit.

## Container and proxy

Docker runs as uid1000 (`node`). Migrate an existing root-owned website volume to uid1000/gid1000 before release. The database is0600, new data directories0700. Never share the volume with OS or Valuate. `.dockerignore` excludes all `.next*`, env, data and local artifacts. Runtime headers include CSP, no embedding, MIME sniffing protection, HTTPS HSTS, conservative browser permissions and private/no-store account/API responses. CSP permits inline scripts needed for Next hydration; user prose is rendered as escaped React text. Recovery pages use no-referrer. Proxy and relay must not log recovery-link bodies or credentials.

## Moderator

After an authorised human creates and verifies their reader account, an operator explicitly selects that existing reader UUID and runs `VEXA_DATA_DIR=<website-volume> node scripts/provision-moderator.mjs <reader-uuid>`. This does not create credentials, select by email or choose a default administrator. Moderation changes are observed on the next request. Comments remain pending until that human approves them; edited approved comments return to pending. Parent owns live moderator assignment and routine.

## Local checks

`node scripts/check-accounts.mjs` starts only an isolated loopback server3323, random process secret, temporary `vexa-account-test-*` database and synthetic mail sink. It runs83 account/security cases plus40 preview behavior cases, then stops its servers. It never resets ordinary preview or production data. `VEXA_BUILD_DIR=.next-launch-check npm run build` checks the separate production build. `VEXA_PRODUCTION_BUILD_DIR=.next-launch-check python3 scripts/check-production-access.py` checks four isolated production configuration modes, including missing delivery and real Secure/host-only cookie emission after a synthetic inbox confirmation. No real Google provider exchange or actual transactional mail is claimed by these tests.

## Dependency and public discovery checks

Next15.5.27 and NextAuth4.24.15 are used. Runtime dependency audit reports0 advisories after patched PostCSS/source-map overrides. Nine advisories remain in build-only ESLint/Tailwind transitive tooling, which receives only controlled source input; they are not in the deployed standalone runtime. All images are local and optimisation is disabled. Canonicals and sitemap point to www; real article dates are used instead of synthetic rebuild modification dates. Accounts, profiles and APIs are excluded from public discovery; article structured data accurately declares the registration restriction and contains only the public summary. Paid plans remain closed and public proof claims were not added.

Official sources: https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4 ; https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36 ; https://github.com/nextauthjs/next-auth/security/advisories/GHSA-x445-f3h2-j279 ; https://nextjs.org/docs/app/guides/upgrading/version-15 .
