# VEXA Website, Cursor Build Plan

**Start here instead.** The single master step by step plan the founder follows, covering this site and VEXA Valuate together in build order, is `VEXA Valuate/docs/v2/START_HERE.md`. This document is Cursor's detailed reference for the website's own prompts once START_HERE.md says it is this site's turn; it is not the entry point.

Last updated: 22 September 2026. Written for Cursor, running against Next.js 14 App Router, Tailwind, and next/font, static first. Read VEXA_BRAND_SYSTEM.md and SITE_PLAN.md before Prompt 1: every token, type choice, page, and line of copy in this plan is defined there, not repeated here. Apply the three skills at `../.claude/skills/` (taste, impeccable design, emil kowalski design) on every prompt that touches visual output, per `.cursor/rules/vexa-site.mdc`.

Each prompt below is a target with an acceptance test, not a constraint, per SYSTEM.md section 7. Log what was tried, what broke, and what came back in `BUILD_LOG.md` after every prompt, appending rather than overwriting, so the next session (human or model) starts from evidence instead of a fresh guess.

Deployment host is not decided in this document. It follows whatever `VEXA Valuate/docs/v2/GO_LIVE_RUNBOOK.md` settles on for valuate.vexadigital.in, since both sites should sit on the same host for one operational surface. Reference that runbook at deploy time rather than picking a host here.

No third party analytics, no session replay tooling, anywhere in this build. The contact form posts to a simple internal API route.

## Prompt 0: Project setup

**Target.** A Next.js 14 App Router project, Tailwind configured with the tokens in VEXA_BRAND_SYSTEM.md section 2.3, General Sans and Inter self hosted through `next/font/local` (download the static font files, do not link Google Fonts or any CDN at runtime), and the `.cursor/rules/vexa-site.mdc` file already in place read by Cursor on every prompt after this one.

**Do.**
1. `npx create-next-app@latest` with TypeScript, Tailwind, App Router, no `src/` directory unless the existing repo convention says otherwise.
2. Add the Tailwind `extend` block from VEXA_BRAND_SYSTEM.md section 2.3 to `tailwind.config.ts` exactly as written.
3. Add the CSS variable block from VEXA_BRAND_SYSTEM.md section 2.2 to `app/globals.css`.
4. Download General Sans (weights 500, 600, 700) and Inter (weights 400, 500) as static font files under `public/fonts/`, and wire both through `next/font/local` in `app/layout.tsx`, exposing `--font-general-sans` and `--font-inter` as the CSS variables the Tailwind config already expects.
5. Set up ESLint and Prettier with the repo's existing conventions if any exist; otherwise, defaults.

**Acceptance tests.**
- `npm run build` succeeds with zero errors.
- The rendered `<head>` has no `<link>` to `fonts.googleapis.com` or any other font CDN; view source to confirm.
- A throwaway test page renders one paragraph in each font role (display, body) and both render the correct self hosted face, confirmed visually, not just by class name.
- Lighthouse (see Prompt 8) is not run yet, but confirm no console errors on load.

Log what was tried, what broke, what came back in `BUILD_LOG.md`.

## Prompt 1: Layout shell, header, footer, navigation

**Target.** The persistent shell every page sits inside: header with the primary lockup (light pages) or secondary wordmark (dark or dense pages), primary navigation to the seven public pages from SITE_PLAN.md section 1, and a footer carrying the simplified mark, the legal page links, and the direct contact details from SITE_PLAN.md section 2.6.

**Do.**
1. Build `app/layout.tsx` with a `<Header>` and `<Footer>` wrapping `{children}`.
2. Header: VEXA LOGO.png used as the primary lockup asset (or an inline SVG rebuild of it, Claude's call, matching the existing artwork exactly, no redrawing the shapes differently) on the home page; the secondary wordmark (per VEXA_BRAND_SYSTEM.md section 4.2) on every other page, to keep the caption line from repeating on every page load. Nav links: Home, How We Work, Proof, About, Valuate, Contact. Mobile: a hamburger menu collapsing to a full screen overlay nav, not a cramped dropdown.
3. Footer: simplified V mark, links to the three legal pages, the phone and email from SITE_PLAN.md, and a one line copyright.
4. Apply the taste skill's design read step first: state the one line design read (page kind, audience, vibe, design system family) before writing any component code, per the taste skill section 0.B, and record that line at the top of `BUILD_LOG.md`'s entry for this prompt.

**Acceptance tests.**
- Header and footer render on every route without a hydration warning in the console.
- Mobile nav (390px) opens and closes cleanly, no overflow, no horizontal scroll.
- Every nav link resolves to a real route (even if the page underneath is still a placeholder at this point in the build).
- Logo asset is crisp at both 1x and 2x pixel density (test with browser zoom or a retina screenshot).

Screenshot QA at 390px and 1280px; log what was tried, what broke, what came back in `BUILD_LOG.md`.

## Prompt 2: Home page, `/`

**Target.** The full Home page from SITE_PLAN.md section 2.1: hero, why gaming is hard to buy into, what we actually do, how we are paid briefly, the Valuate strip, and the closing CTA, in that order, using the exact copy given there (do not paraphrase the doctrine derived lines; they are quoted precisely for a reason).

**Do.**
1. Build each section as its own component under `app/components/home/`.
2. Hero: split screen or left aligned layout per the taste skill's anti center bias rule (VEXA_BRAND_SYSTEM section on taste is inherited, not repeated; read the taste skill directly), General Sans headline at `text-4xl md:text-6xl tracking-tighter leading-none` or the project's chosen equivalent scale, one primary CTA button, one secondary text link, never two competing buttons.
3. "What we actually do" section: build as three distinct blocks with real content difference (business problem, gaming relevance, target driven execution), not a generic identical three card row; vary the visual treatment of at least one block so it does not read as a templated grid, per the taste skill's anti slop discipline.
4. Valuate strip: pull the Valuate sub mark and one real screenshot from the Valuate repo if available at build time (ask before fabricating a placeholder UI image); if the screenshot is not available yet, use a typographic tagline card instead (VEXA_BRAND_SYSTEM.md section 6, imagery category "tagline"), never a fake mocked up interface.
5. Wire the primary CTA button to `/contact` and the secondary link to `/how-we-work`.

**Acceptance tests.**
- Every line of copy on the page matches SITE_PLAN.md section 2.1 exactly, word for word, no dashes anywhere in the rendered text (grep the rendered HTML for em dash, en dash, and any hyphen not inside a class name, URL, or code token).
- No section uses a generic three equal card layout without a stated reason (per the taste skill).
- Page passes a manual read against SYSTEM.md section 8's writing rules: no repetition, no process narration in the visible copy.
- Screenshot QA at 390px and 1280px, no overflow, no orphaned single word lines in the headline at 1280px.

Log what was tried, what broke, what came back in `BUILD_LOG.md`.

## Prompt 3: How We Work, `/how-we-work`

**Target.** The full page from SITE_PLAN.md section 2.2: the real question, the order we work in (as a numbered sequence, not a diagram with framework names), how a target gets set, what we will tell you no on, what happens if a campaign is heading to miss its mark.

**Do.**
1. "The order we work in" renders as a numbered, sequential list (business problem through cost last), styled distinctly from a generic numbered feature list, for example a vertical rule connecting the numbers, since campaign-method.md's locked order is a genuine piece of method and deserves to look considered rather than templated.
2. Every other section is long form paragraph copy per SITE_PLAN.md, not broken into bullet fragments, per voice.md's instruction that reasoning belongs in paragraphs.
3. CTA at the end links to `/contact`.

**Acceptance tests.**
- The numbered sequence renders in the exact order given in SITE_PLAN.md and campaign-method.md (business problem, consumer behaviour, gaming relevance, commercial mechanism, activation, measurable outcome, business decision, cost last); a wrong order here is a factual error, not a style choice.
- No dashes anywhere in rendered text.
- Screenshot QA at 390px and 1280px.

Log what was tried, what broke, what came back in `BUILD_LOG.md`.

## Prompt 4: Proof, `/proof`

**Target.** The full page from SITE_PLAN.md section 2.3, with the honesty framing ("where we stand right now") given clear visual priority at the top of the page, not buried under a more flattering section.

**Do.**
1. "Where we stand right now" renders first, directly under the page header, in the same visual weight as the sections that follow (no smaller type, no muted colour used to downplay it), since burying this line visually would undercut the same honesty the copy states.
2. "In progress," "what our vendor network has delivered," and "the founder's own record" follow as clearly separated sections, each labelled plainly so a visitor can tell which kind of proof they are reading (VEXA's own work in progress, versus vendor network work, versus the founder's personal credential), matching credibility.md's insistence on keeping these three categories distinct.
3. Do not add a testimonial, a client logo, a number, or any visual implying scale that is not in the copy given in SITE_PLAN.md.

**Acceptance tests.**
- No element on the page implies a completed, named, VEXA branded case study exists (no "as seen in" strip, no client logo row, no fabricated stat).
- The three proof categories (in progress, vendor network, founder's personal record) are visually distinguishable from each other, confirmed by screenshot review.
- Screenshot QA at 390px and 1280px.

Log what was tried, what broke, what came back in `BUILD_LOG.md`.

## Prompt 5: About, `/about`; Valuate, `/valuate`; Contact, `/contact`

**Target.** The three remaining content pages from SITE_PLAN.md sections 2.4, 2.5, 2.6, built together since each is a single focused page rather than a multi section build.

**Do.**
1. About: renders the "who is behind VEXA," "how VEXA is structured," and "why the name" sections from SITE_PLAN.md, with the two flagged open questions (structure description, name story) left in the copy as written for now but marked with an HTML comment `<!-- CONFIRM WITH SODA: see SITE_PLAN.md open question 4 / 5 -->` immediately above each section, so a reviewer sees the flag directly in the source before this page goes live.
2. Valuate: renders "what Valuate is" and "why VEXA built it," with the sub mark and a real product screenshot if available (same rule as Prompt 2's Valuate strip); external link to valuate.vexadigital.in opens in a new tab with `rel="noopener"`.
3. Contact: renders the "no pitch on the first call" copy, the form (name, work email, company, business problem open text, how did you hear about VEXA optional), and the direct phone and email. The form posts to `app/api/contact/route.ts`.
4. Build `app/api/contact/route.ts` as a simple API route: validate the fields server side, then either append the submission to a local JSON or text log file (for a first, low cost version) or send it by email through a transactional mail provider already in use elsewhere in the founder's stack, Claude's call based on what is already configured; do not add a third party form vendor (Typeform, Formspree, or similar) since the founder's stated preference is no unnecessary external dependency for a form this small.

**Acceptance tests.**
- The two `CONFIRM WITH SODA` comments are present in the About page source, exactly where specified.
- Valuate's external link opens in a new tab and does not carry a `window.opener` reference (confirm `rel="noopener"` is present).
- Submitting the contact form with valid data returns a success state to the user and produces a durable record (a new line in the log file, or a sent email, confirmed by actually testing a submission, not just reading the code).
- Submitting the form with an empty required field is rejected client side and server side, with a clear inline error, not a silent failure.
- Screenshot QA at 390px and 1280px for all three pages.

Log what was tried, what broke, what came back in `BUILD_LOG.md`.

## Prompt 6: Legal pages

**Target.** The three legal page shells from SITE_PLAN.md section 2.7 (privacy, terms, grievance officer), built as real routes with the structural headings given there, and each page's substantive content clearly marked as pending Soda's or a lawyer's actual drafting rather than filled with generic boilerplate.

**Do.**
1. Build `app/legal/privacy/page.tsx`, `app/legal/terms/page.tsx`, `app/legal/grievance-officer/page.tsx`, each with the structural headings from SITE_PLAN.md section 2.7 and a single visible notice at the top of each page's body: "This page is a placeholder structure. Final legal content is pending review." Do not write generic internet boilerplate privacy or terms language into these pages; an unreviewed generic template creates false comfort and real legal risk, worse than an honest placeholder.
2. The grievance officer page's contact block (name, designation, email, address) stays empty with a clearly marked placeholder, since SITE_PLAN.md open question 6 states this information does not exist in the brain yet.

**Acceptance tests.**
- All three routes resolve and render without error.
- The pending review notice is visible on page load, not hidden behind a click.
- No generic legal boilerplate text appears anywhere on these three pages; a manual read confirms every sentence traces back to SITE_PLAN.md section 2.7's structure, not to an invented clause.

Log what was tried, what broke, what came back in `BUILD_LOG.md`.

## Prompt 7: Impeccable pass, full site polish

**Target.** Run the impeccable design skill's audit, critique, polish, animate, and harden modes across the whole site, once every page from Prompts 1 through 6 exists.

**Do.**
1. Audit: identify the highest impact issues in hierarchy, spacing, colour, type, interaction states, responsiveness, accessibility, across every page.
2. Polish: fix the top issues found, preserving the copy and structure already built.
3. Animate: add restrained motion only where the emil kowalski design skill's animation decision framework says it belongs (state indication, spatial consistency, feedback, preventing jarring change), using the custom easing curves and duration tokens from VEXA_BRAND_SYSTEM.md (`--vx-dur-fast`, `--vx-dur-base`, `--vx-dur-slow`, `--vx-ease-out`, `--vx-ease-in-out`, inherited from the Valuate v1 motion tokens, reused here so both sites feel like one system in motion, not only in colour). Respect `prefers-reduced-motion`.
4. Harden: fix any mobile overflow, text clipping, contrast failure, missing focus or hover or active state, or broken link found during the audit.

**Acceptance tests.**
- A markdown table (Before, After, Why) documenting every change made in this pass, per the emil kowalski design skill's required review format, saved into `BUILD_LOG.md` for this prompt.
- Every interactive element (button, link, form field) has a visible focus state, tested by tabbing through the whole page with a keyboard, not a mouse.
- Every colour pair actually carrying text passes WCAG AA, checked against the tokens in VEXA_BRAND_SYSTEM.md section 2.2 (an automated contrast checker run against the rendered CSS is acceptable).

Log what was tried, what broke, what came back in `BUILD_LOG.md`.

## Prompt 8: Screenshot QA, Lighthouse, deployment

**Target.** Full site QA pass at two breakpoints, a Lighthouse run against stated targets, and deployment to the host set in the Valuate go live runbook.

**Do.**
1. Screenshot every page (Home, How We Work, Proof, About, Valuate, Contact, the three legal pages) at 390px width (mobile) and 1280px width (desktop) using the Claude in Chrome browser tools, since Playwright MCP is not available per `04_SITE_BUILDS/README.md`. Fix any overflow, misalignment, or spacing inconsistency found.
2. Run Lighthouse against every page in the built (not dev server) version. Targets: performance 90 or above, accessibility 95 or above, best practices 95 or above, SEO 95 or above. A page that misses a target gets a specific, logged reason (a real product screenshot that is heavier than expected, a font file size, and so on), not a silent shrug.
3. Confirm no third party analytics or session replay script is present anywhere in the shipped bundle (grep the built output for known analytics or session replay script domains).
4. Deploy to the same host valuate.vexadigital.in uses. Read `VEXA Valuate/docs/v2/GO_LIVE_RUNBOOK.md` for the actual host and deployment steps rather than deciding a host here; that document is being written separately and owns this decision.

**Acceptance tests.**
- Screenshots for all eleven pages at both breakpoints exist in the build log or an attached QA folder, with no visible layout break in any of them.
- Lighthouse scores meet or exceed the four targets above, or each miss has a logged, specific reason.
- The live URL resolves, every internal link works, the contact form submits successfully against the deployed environment (not just localhost), and the Valuate external link opens the live valuate.vexadigital.in.

Log what was tried, what broke, what came back in `BUILD_LOG.md`.

## BUILD_LOG.md format

Each entry: the prompt number and target, the date, what was tried, what broke, what came back (the actual result, including a failure), and any open question raised for Soda that this plan did not already anticipate. Append only, never overwrite a previous entry, per SYSTEM.md's instruction that a lane logs what it tried, what it cost, and what came back so the next run starts from evidence.
