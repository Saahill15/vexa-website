# Website architecture

Current stack: Node 22, Next.js 15.5.27 App Router, React 18, TypeScript/TSX and Tailwind CSS. Next renders pages and serves its own API routes. `app/globals.css` and `tailwind.config.ts` hold shared presentation tokens; `components/PageMotion.tsx` controls page motion. Keep keyboard navigation and reduced-motion behaviour working.

Public routes include `/`, `/services`, `/brands`, `/organisations`, `/about`, `/learn`, `/contact` and legal pages. `/valuate` forwards to the separate product. Articles have a public introduction and an account checkpoint. Account, profile and moderated comments are implemented through `lib/auth.ts`, `lib/db.ts` and `app/api/`.

NextAuth supplies sessions; SQLite stores accounts, profiles, comments and enquiries. Google identity is optional and configured separately from email/password accounts. Email verification/recovery uses the existing private transactional mail service. The website account does not grant access to OS or Valuate accounts.

In production, Docker runs the standalone Next output behind Traefik HTTPS. The Compose project is `site`, source is `/opt/vexa/site`, and the container is `vexa-site`. Docker volume `site_site_data` is mounted at `/app/data`; the SQLite file is `vexa.db`. The `.env` on that server is runtime configuration, not source. Neither live data nor filled environment files belong in a clone.

Security controls include server-side account/ownership checks, same-origin mutation checks, password hashing, expiring sessions, private profile fields, moderation, validated inputs, rate limits and response security headers. See the actual implementations and account checks before changing these boundaries. Presentation-only work needs none of the production account or infrastructure access.

Product and design references are under `docs/product/` and `docs/design/`. Older references are historical, not current release instructions. The source and this deployment guide take precedence for paths and runtime facts.

The staff admin area is `/admin` (enquiries, leads, accounts, article visibility, comment moderation, audit log). Roles, migrations, provisioning and operations are in [docs/admin/ADMIN.md](admin/ADMIN.md); the pre-implementation audit is [docs/admin/AUDIT.md](admin/AUDIT.md). Schema changes are versioned in `lib/migrations.ts` and applied at start-up after an automatic snapshot.
