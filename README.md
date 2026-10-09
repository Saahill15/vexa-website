# VEXA website

The public company website at https://www.vexadigital.in. This repository contains the current Next.js application, not the internal OS or Valuate product.

## Start locally

Use Node.js 22 and npm. No production credentials are needed for presentation work.

```sh
git clone https://github.com/vexadigitalin-prog/vexa-website.git
cd vexa-website
npm ci
npm run preview
```

Open http://localhost:3310. The preview uses a local SQLite database, displays a preview notice and disables outbound contact delivery and Google sign-in. To exercise the local Valuate link, run that repository's preview on port 3400 too.

## Where to work

| Folder or file | Purpose |
| --- | --- |
| `app/` | Next.js pages, layouts, global CSS and API routes |
| `components/` | Header, footer, motion and reusable presentation |
| `content/learn/` | Articles and their source references |
| `lib/` | Accounts, SQLite, validation and server helpers |
| `public/` | Images, brand assets and fonts |
| `scripts/` | Local preview and verification tools |
| `docs/` | Architecture, deployment, product and design references |
| `docs/archive/` | Historical plans and the retired static website |
| `.github/` | CI and owner-operated release workflow |

Sahil's current assignment is animations, spacing, alignment, responsive layout and footer improvements. Start with `app/about/page.tsx`, `app/globals.css`, `components/PageMotion.tsx`, `components/Footer.tsx` and `components/nav.ts`. Work on a branch and return screenshots and a pull request. Changes to words, team roles, authentication, APIs, database or deployment require a separate agreed scope.

Read [architecture](docs/ARCHITECTURE.md), [contributing](CONTRIBUTING.md) and [deployment](docs/DEPLOYMENT.md) for the rest of the system. GitHub stores source; the running service is on the existing VPS.
