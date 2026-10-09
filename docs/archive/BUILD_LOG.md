# VEXA Website BUILD_LOG

Append only. Each entry: prompt, date, what was tried, what broke, what came back.

---

## Prompt 0: Project setup
**Date:** 22 September 2026

**Design read (carried into Prompt 1):** Light informational brand site for Indian brand buyers; vibe is precise, itemised, advocate-grade restraint; system family is shared VEXA ink/cream + E45824 with General Sans display and Inter body.

**Tried:** Scaffolded Next.js 14 App Router + Tailwind in a temp folder, rsynced into `04_SITE_BUILDS/vexa-website`. Wired CSS variables and Tailwind `vx` tokens from VEXA_BRAND_SYSTEM.md. Self-hosted General Sans (500/600/700) and Inter (400/500) under `public/fonts/` via `next/font/local`. Moved lockup assets to `public/brand/`.

**Broke:** `create-next-app` refused a non-empty directory; used temp app then rsync. Logo files initially landed in site root; moved to `public/brand/`.

**Came back:** Config, globals, layout fonts, and brand assets in place. Default create-next-app home page still present until Prompt 2.

---

## Prompt 1: Layout shell
**Date:** 22 September 2026

**Tried:** Built `Header` (home uses primary lockup; other routes use V mark + wordmark), full-screen mobile overlay nav, `Footer` with legal links and public phone/email, `ButtonLink`, `PageIntro`. Root layout wraps Header / main / Footer.

**Broke:** Nothing blocking.

**Came back:** Shell components compiled. Routes still pending for later prompts.

---

## Prompt 2: Home
**Date:** 22 September 2026

**Tried:** Replaced default `app/page.tsx` with SITE_PLAN.md section 2.1 sections as `components/home/*`: Hero, WhyHard, WhatWeDo (three unequal visual treatments, not identical cards), HowPaid, ValuateStrip (typographic tagline card; no product screenshot available in Valuate repo), ClosingCta. Copy taken from SITE_PLAN word for word. No fee rupee figures (open question 1).

**Broke:** No Valuate UI screenshot on disk; used typographic card per brand system imagery rules.

**Came back:** Home route written.

---

## Prompt 3: How We Work
**Date:** 22 September 2026

**Tried:** Built `/how-we-work` with numbered vertical-rule sequence in SITE_PLAN / campaign-method order, long-form paragraphs for target setting, no answers, and miss handling. CTA to `/contact`. Infinix and Piyush kept unnamed (open question 3).

**Came back:** Page written.

---

## Prompt 4: Proof
**Date:** 22 September 2026

**Tried:** Built `/proof` with honesty framing first at full visual weight, then three distinguishable categories (in progress, vendor network, founder record). No logos, testimonials, or invented stats. TP Link line kept as "in progress" pending open question 2.

**Came back:** Page written.

---

## Prompt 5: About, Valuate, Contact
**Date:** 22 September 2026

**Tried:**
- About: who is behind + name story. Lead hold: Advocates Act / enrolment / structure section omitted from public render (HTML comment left for reviewers). Name story marked `CONFIRM WITH SODA: open question 5`. Softened bio away from enrolment language.
- Valuate: copy from SITE_PLAN, external link with `rel="noopener noreferrer"`, typographic product card.
- Contact: form + direct phone/email. API `app/api/contact/route.ts` validates and appends JSONL under `data/contact-submissions.jsonl`. `/data/` gitignored.

**Came back:** Three pages + API route written.

---

## Prompt 6: Legal shells
**Date:** 22 September 2026

**Tried:** Privacy, Terms, Grievance Officer routes with structural headings only, visible pending-review notice, no boilerplate clauses. Grievance contact fields marked [Pending] (open question 6).

**Came back:** Three legal routes written.

---

## Build verify
**Date:** 22 September 2026

**Tried:** `npm run build` after Prompts 2 through 6.

**Came back:** Succeeded. All eleven routes generated (Home, How We Work, Proof, About, Valuate, Contact, three legal, api/contact, _not-found). Zero type/lint errors. No Google Fonts CDN in layout (self-hosted only).

**Still open for Soda (SITE_PLAN):** fee figure, TP Link status, naming Infinix/Piyush, Advocates structure (held off public), name story confirm, grievance officer identity, Valuate account layer vs Terms.

**Not done this pass:** Prompt 7 impeccable polish, Prompt 8 Lighthouse/screenshots/deploy (needs GO_LIVE_RUNBOOK host decision).

---

## Prompt 7: Impeccable pass, full site polish
**Date:** 22 September 2026

**Tried:** Audit across shell, home, Valuate, contact, and legal routes. Polish focus rings, selection colour, skip link, OG metadata, sitemap/robots, Reveal motion on home sections, mobile nav body lock + Escape, Valuate gauge chips, contact form focus that previously used `outline-none`.

**Broke:** Nothing blocking. `accent-600` (#C94A1C) on cream-50 measures ~4.42:1 (0.08 under body AA). Brand system claims text-safe AA; left token unchanged and logged. White on accent-500 buttons is ~3.67:1 (passes large text / UI 3:1, not body 4.5:1).

**Came back:** Build green after polish. Prompt 8 still pending (screenshots, Lighthouse, deploy per GO_LIVE_RUNBOOK).

### Before / After / Why

| Before | After | Why |
|---|---|---|
| No skip link; `<main>` had no id | `SkipToContent` + `main#main` | Keyboard users reach content without tabbing the whole header |
| No Open Graph / Twitter metadata | OG + Twitter summary on root layout | Share previews resolve to the SITE_PLAN titles instead of empty cards |
| `robots.txt` had a typo (`::User-Agent`) | Valid `User-agent` + sitemap URL | Crawlers read the file; sitemap is discoverable |
| No `app/sitemap.ts` wired into polish | Sitemap lists all nine public content/legal routes | SEO harden from CURSOR_BUILD_PLAN Prompt 7 |
| Global focus only; buttons/links uneven | Explicit `focus-visible` rings on Header, Footer, ButtonLink, ContactForm, Valuate links | Prompt 7 acceptance: every interactive control shows focus under keyboard |
| Contact inputs used `outline-none` | Border + outline on `focus-visible` | Previous class fought the global focus rule |
| Mobile nav left body scrollable; no Escape | Body overflow lock + Escape close + route change close | Prevents background scroll and trapped overlays |
| Home sections static | `Reveal` on Hero through ClosingCta with reduced-motion short-circuit | Restrained scroll reveal using brand duration/easing tokens |
| Hero was a single column only | Desktop aside: "Target first. Cost last…" | Spatial hierarchy without inventing buyer claims; doctrine language only |
| Valuate strip external link weak focus | Cream link + card with visible focus | Dark strip contrast and keyboard parity |
| `/valuate` CTA was a plain `<a>` | `ButtonLink` with `external` + gauge chips from brand band tokens | Align product page with master ButtonLink and Valuate semantic colours |
| No `::selection` style | Accent-100 selection on ink text | Brand orange reads in selection without neon glow |
| Primary buttons had hover only | `active:scale-[0.97]` on press | Emil Kowalski press feedback; disabled for reduced motion via global CSS |

**Still open for Soda:** same SITE_PLAN holds (fee, TP Link, naming, Advocates structure, name story, grievance identity). Optional: darken `accent-600` ~0.08 contrast to clear body AA on cream-50, or reserve accent text for white surfaces only.

---

## Valuate brand integration
**Date:** 22 September 2026

**Tried:** Replaced the text tile on the home strip and `/valuate` with the real lockup and the prototype sample. Files used: `01_VEXA/06_content/brand-assets/VEXA LOGO.png` (already at `public/brand/vexa-logo.png`), `vexa_vmark_only.png` (already at `public/brand/vexa-vmark.png`), `vexa trail banner.png` copied to `public/brand/vexa-trail-banner.png`. Gauge submark copied from the prototype SVG. Sample numbers are the prototype landing case: ask ₹1,236, floor ₹913, views ₹913 to ₹1,236, Where you are, offer pin ₹3,500. No follower band.

**Broke:** The Valuate chat cannot be shifted onto this folder. This folder has no git repo, and that chat is pinned to `valuate-v2-plan`, so Cursor dies with "not a git repository" before it reads any logo.

**Came back:** Home strip and `/valuate` render the logo file and the V mark file. The black lockup sits on cream. The orange V sits on the dark product panel. The Claude.ai asset named `vexa-lockup-primary.png` is not on this Mac.

---

## Visual QA fix pass (Claude, 22 Sep 2026 night)

**Tried:** built the site in a clean container, ran it, screenshotted Home and /valuate at 1280px and 390px, checked console errors and horizontal overflow.

**Broke and fixed:**
- Logo tiny everywhere: `public/brand/vexa-logo.png` was a 2000x2000 canvas with wide transparent padding. Cropped to the artwork (1172x630).
- Header lockup unreadable at 40px (thin EXA, micro caption). Header now uses the orange V plus VEXA wordmark on every page.
- Valuate sample card: the trail banner texture carried its own text ("Structural Audit") that bled through the numbers. Removed texture and duplicate V mark; title "VEXA Valuate".
- Home Valuate strip: second logo above the heading replaced with a "VEXA Valuate, free tool" eyebrow.
- /valuate had no visible title. Now a real "VEXA Valuate" heading.
- Closing CTA rendered blank (scroll Reveal never fired near page bottom). Reveal now threshold 0.01 plus 1.5s fallback.
- "How we are paid" card was half width. Now full width.
- Public email was Gmail. Now partnerships@vexadigital.in (footer, contact page, form error).

**Came back:** lint clean, build passes, no console errors, no horizontal overflow at 390px or 1280px.

**Not done:** deployment (VEXA Valuate/docs/v2/GO_LIVE_RUNBOOK.md, Hetzner). Phone number shown publicly: Soda to confirm.
