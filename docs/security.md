# Security notes and production checklist

## Before going live (the site will refuse or misbehave without these)

| Setting | Why |
| --- | --- |
| `SITE_URL=https://…` (https, no trailing slash) | Links in password-reset and verification emails, the sitemap and robots.txt are built from it. In production the site refuses to build email links without it, so nobody can poison a reset link by sending a fake `Host` header. |
| `SESSION_SECRET` (48+ random characters) | Signs the login cookie. Without it a secret is generated into `VEXA_DATA_DIR/.session-secret`. |
| `RESEND_API_KEY`, Gmail OAuth values | Server-side only. Never prefix with `NEXT_PUBLIC_`. |
| `GMAIL_AUTH=oauth` | `delegation` is for a developer's own machine only. |
| `ADMIN_EMAILS` | Only addresses whose email is confirmed become admins. |
| HTTPS in front of the site | The login cookie is `Secure`; HSTS is sent in production. |
| Cloudflare (or another proxy) in front | Rate limits are per visitor address. Cloudflare sets `CF-Connecting-IP`, which visitors cannot fake. If the site were exposed directly, they could fake `X-Real-IP` and dodge the per-address limits (the per-account limits still hold). |
| `DATABASE_URL` (PostgreSQL) | Accounts, enquiries, comments and content live in the database. Back it up daily (for example `pg_dump`) and keep it on the server only, never exposed to the internet. The role should own only the `vexa` database. |

## What is in place

- **Headers** (`next.config.mjs`): Content-Security-Policy (own scripts plus Google sign-in only, no framing, forms post only to the site), HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy. Private pages and `/api` are `no-store` and `noindex`.
- **CORS**: no cross-origin access is granted anywhere (no `Access-Control-*` headers). Every state-changing request must come from the site's own origin (`sameOrigin`): a missing or foreign `Origin` is refused. Server actions are checked by Next as well.
- **Sessions**: a signed token (HMAC-SHA256, not a JWT, so no algorithm confusion) holding only the account id, issue time and expiry. It carries no role: admin status is read from the account on every request, so demoting, disabling or resetting the password takes effect immediately. Cookie is `HttpOnly`, `SameSite=Lax`, `Secure` in production. A token is accepted only from the cookie.
- **Admin area**: `middleware.ts` (edge runtime, so it works on Cloudflare) answers 404 to anyone without a genuine session cookie; every page, action and endpoint checks the admin role again on the server.
- **Passwords**: scrypt (32 MB cost for new hashes; older hashes still verify), constant-time compare, equal work for unknown emails. Deleting an account needs the password.
- **Rate limits** (stored in the database, so shared by every server or Worker): login 8 per address+account / 15 min, 40 per address / 15 min, 20 per account / hour; sign-up, forgot, reset, verify, Google, comments, contact, account changes all limited.
- **Input**: bodies are read with a hard size cap (20 KB, streamed), types are checked, text lengths are cut, emails validated. User text is rendered as text by React; mail HTML is sanitised and shown in a sandboxed frame.
- **No account enumeration**: login, forgot-password and sign-up answer the same whether or not an address has an account.
- **Mail**: attachments that can run on a computer are refused both ways; downloads are forced and sandboxed.

## Known limits

- The rate limiter is in memory: it resets on restart and is per server process. The data itself is in PostgreSQL, so several app servers can share it once the rate limiter moves to a shared store. Use a shared store (Redis) if you run several instances.
- The CSP allows inline scripts (Next's own bootstrap). Adding per-request nonces would remove that.
- Admin pages for a signed-in non-admin first send a loading shell (title only, no data) before the 404.
- There is no two-factor sign-in for admins yet; the admin accounts rely on strong, unique passwords or Google sign-in.
