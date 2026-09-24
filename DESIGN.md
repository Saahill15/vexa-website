# VEXA website redesign: design spec

Prepared 24 September 2026 for the Next.js 14 and Tailwind rebuild. The approved copy in `live-site/COPY.md` stays word for word. This file changes only how it looks and behaves.

Evidence base: the four research files in `site-update/`, 46 live sites captured with Playwright and Chromium (desktop 1440 wide, plus phone captures at 390 wide for seven of them; files in this folder, `*-fold.jpg`, `*-full.jpg`, `*-m-full.jpg`, contact sheets `c1.jpg` to `c13.jpg` and `cm.jpg`), and the doctrine sources listed in section 14. Capture limits: the session proxy slowed stylesheets and fonts, so several captures show unstyled or partly revealed pages. Blocked or failed: a16z Games, Collins, Ampverse, Carta, NerdWallet, Hashtag Esports, Tagbin, ARKA, Collective Artists, Redscout, Teneo, Koto, and SPORTFIVE (Cloudflare block). McKinsey and 100 Thieves loaded without content. Where a site was not seen, the earlier `competitor-research.md` observation is used and marked "per research".

## 1. Direction

VEXA should look like a small, serious advisory house that happens to know gaming: warm paper, black editorial type, a single orange action, and a peacock eye used like a signet ring. The page reads as a well set report, not a launch trailer. This fits both audiences. The brand manager who does not understand gaming needs a guide who looks as steady as their law firm or strategy adviser, and every trust first adviser we captured (Brunswick, Bain, BCG, Redseer, AZB, Basecamp, Stratechery) sits on a light field with one restrained accent. The team, creator or organiser needs to be taken seriously, and being presented with the same care as a brand is the respect they want. The gaming cue comes from content (real photos of real teams, rupee figures, the Valuate tool), not from neon.

**Light, decided.** Evidence: (a) NN/g reports a positive polarity (dark text on light) advantage for reading at every age, growing as text gets smaller; this site is text heavy by design. (b) The Indian category is dark: NODWIN, Skyesports, AOG, Revox, S8UL and Maverik all load on black or near black, three of them behind spinners or hidden content in our captures. Dark is category noise; light is the visible difference. (c) The owner rejects "dark glory". (d) Fogg's study of 2,684 people found "design look" was the most cited credibility factor (46.1 percent of comments). There are no dark sections on the site, including the footer.

Why the first light version still felt generic: one sans at one weight, centred narrow columns, rounded cards, no signature, no photography. This spec fixes those, not the field colour.

## 2. Anti AI rules (never do)

- [ ] No dark hero, no gradient hero, no mesh or aurora background, no purple or indigo anywhere.
- [ ] No glow, bloom, neon edge, glassmorphism, frosted panels or backdrop blur.
- [ ] No bento grid, no row of three or four identical icon cards, no cards inside cards.
- [ ] No centred page layouts. Only the legal counsel note and the form success state may centre.
- [ ] No stock photos, stock 3D, AI illustration, isometric art, mascots or abstract blobs.
- [ ] No emoji, no icon set used as decoration. Icons appear only where they carry function (menu, arrow, external link, chevron).
- [ ] No gradient text, no count up numbers, no marquee ticker, no typewriter or cycling hero words.
- [ ] No "trusted by" row without real, permitted logos. No placeholder figures such as "[N]" or "xx M".
- [ ] No preloader, no scroll jacking, no parallax, no custom cursor.
- [ ] No pill everything: buttons are rectangles with a 2px radius; cards have no radius beyond 2px.
- [ ] No uniform corner radius, uniform shadow and uniform grey card surface. Shadows are not used at all.
- [ ] No Inter, no single weight typography.
- [ ] No pass or fail language, no "baseline" or "floor" in any label, tooltip or empty state.
- [ ] No mention of Soda's tools, automation or internal method in any interface text.

## 3. Type

Both faces are on Google Fonts under the SIL Open Font License and load through `next/font/google`.

```ts
// app/fonts.ts
import { Bodoni_Moda, IBM_Plex_Sans } from "next/font/google";
export const display = Bodoni_Moda({ subsets: ["latin"], axes: ["opsz"], weight: "variable", style: ["normal", "italic"], variable: "--font-display", display: "swap" });
export const text = IBM_Plex_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-text", display: "swap" });
```

- **Display: Bodoni Moda.** A Didone with an optical size axis (6 to 96). At large sizes its hairlines and heavy stems match the thin, high contrast EXA of the logo. Use weight 400 for H1 and H2, 500 for figures, italic 400 for the one quote per page. Checked: its Latin subset has no ₹ glyph, so rupee amounts are always set in Plex Sans.
- **Text: IBM Plex Sans** at 400, 500 and 600. Engineered, calm, and not the default sans of AI builds. Checked: its figures are tabular by default (all digits 600 units wide) and it has the ₹ glyph. IBM Plex Sans Devanagari exists if a Hindi page is ever added.

| Token | Font, weight | Size mobile to desktop (clamp) | Line height | Tracking | Measure |
|---|---|---|---|---|---|
| display.xl (H1) | Bodoni 400, opsz auto | 36px to 64px `clamp(2.25rem,1.4rem+3.6vw,4rem)` | 1.04 | -0.01em | max 24ch |
| display.l (H2) | Bodoni 400 | 28px to 44px | 1.1 | -0.005em | max 28ch |
| figure | Bodoni 500, lining | 44px to 72px | 1.0 | 0 | n/a |
| quote | Bodoni italic 400 | 24px to 34px | 1.25 | 0 | max 32ch |
| h3 | Plex 600 | 19px to 21px | 1.3 | -0.005em | max 40ch |
| lead | Plex 400 | 18px to 21px | 1.55 | 0 | max 56ch |
| body | Plex 400 | 17px | 1.65 | 0 | 60 to 68ch (`max-w-[38rem]`) |
| small | Plex 400 | 14px | 1.5 | 0.005em | max 60ch |
| label | Plex 600, uppercase | 12px | 1.3 | 0.08em | n/a |

Numerals: Plex tabular lining everywhere (defaults). Big proof figures in Bodoni with `font-variant-numeric: lining-nums tabular-nums`. Indian grouping for rupees (₹2,40,000) via `Intl.NumberFormat("en-IN")`. Set `text-wrap: balance` on H1 to H3 and `text-wrap: pretty` on body.

## 4. Colour

Neutral fields carry about 85 percent of every screen, ink type and rules about 10 percent, and all colour together stays at or under 5 percent (orange about 3, the peacock set about 2).

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `paper` | #F7F4EE | Page field (about 70 percent) | ink on it 16.7:1 |
| `stone` | #EDE7DC | Second field: alternate sections, footer, inputs at rest (about 15 percent) | ink 14.9:1 |
| `white` | #FFFFFF | Form fields when focused, photo mats only | ink 18.4:1 |
| `ink` | #17140F | Headings, body, primary rules | see left |
| `ink.2` | #3A342C | Secondary body | 11.2:1 on paper |
| `muted` | #655D52 | Captions, meta, labels | 5.9:1 paper, 5.3:1 stone |
| `hair` | #D9D0C1 | Hairlines and dividers (decorative) | n/a |
| `orange` | #FF681F | Action: primary button fill, the logo V | ink text on it 6.3:1 |
| `orange.deep` | #B83C00 | Orange text on light (active nav, the button's 1px border) | 5.2:1 paper, 4.6:1 stone |
| `peacock.blue` | #0B4F6C | Wayfinding: focus ring, link hover underline, process numerals, brands door rule, feather heart | 8.1:1 paper |
| `peacock.teal` | #0F7B6C | Evidence: source and status markers, teams door rule, feather ring | 4.7:1 paper (large text or marks only on stone) |
| `peacock.teal.deep` | #0B6559 | Teal as small text: "Source", form success | 6.3:1 paper |
| `feather.gold` | #C9A227 | Marks only: feather outer ring, the 2px underline under one highlighted figure per page | 2.2:1, never text |
| `feather.gold.deep` | #8A6A10 | Status text "Sample", "In progress" | 4.6:1 paper |
| `error` | #B3261E | Form errors | 6.0:1 paper |

Meaning, so the accents never become decoration: orange means "act", blue means "you are here, go there", teal means "this is evidenced", gold means "this is the one number to look at". The primary button is orange with ink text and a 1px `orange.deep` border so its edge reaches 5.2:1 on paper (WCAG 1.4.11). Never white text on orange (2.9:1). Replace the `vx.charcoal` tokens; keep the token names `vx.*` for the rest.

## 5. Grid and spacing

Mobile first. Tailwind defaults for breakpoints: base (under 640), `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Container max 1280px content.

| Range | Columns | Gutter | Side margin |
|---|---|---|---|
| base | 4 | 16px | 16px |
| md | 8 | 24px | 32px |
| lg and up | 12 | 24px | 48px (64px at xl) |

The asymmetric editorial grid: from `lg`, every section uses a **rail** of columns 1 to 3 and a **text** span of columns 4 to 10, leaving 11 and 12 open or used for a margin note. The rail holds the section index (label plus a small number in `peacock.blue`) and stays `sticky top-24` while the section scrolls. Wide elements (photo, ledger, doors) may run columns 4 to 12. Nothing spans 1 to 12 except the header and footer. On phones the rail becomes a label above the heading.

Spacing scale (4px base): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Section padding 64px mobile, 96px md, 128px lg. Between H2 and first paragraph 24px. Sections are separated by a full width 1px `hair` rule, never by background colour swaps except `stone` for costs, founder and footer.

## 6. Components

### Header
Sticky, `paper` at 96 percent opacity with no blur, 64px tall (72px lg), bottom 1px `hair` after 8px of scroll. Logo `vexa-logo.png` (the black EXA version) 32px tall mobile, 40px lg, loaded eagerly with width and height set so it never pops in. Nav (lg): five items only, following Hick's law: For brands, For teams and creators, How it works, Proof, About. Costs and Valuate move to the footer and to in page links. Right: primary button "Book a call". Active item: `orange.deep` text plus 2px underline. Phone: logo, "Book a call" as a compact text button, and a menu button opening a full screen `paper` sheet with the items at 28px Bodoni.

```
DESKTOP
+==========================================================================+
| [V EXA logo]      For brands  For teams and creators  How it works      |
|                   Proof  About                        [ Book a call ]    |
+==========================================================================+
PHONE
+================================+
| [V EXA]      Book a call  [≡]  |
+================================+
```

### Hero (home)
Rail: label "Brand partnerships for gaming". Text span: H1 display.xl, lead below. Then the **audience switch** (section 8) and two actions: primary "Book a call", secondary text link "See how we work" with arrow. Columns 11 and 12 on lg hold the aside "How we work" as a small ledger with two lines ("Commission only when you close.", "KPI agreed before a brand spends.") separated by a hairline, topped by the feather eye at 40px. Below, the bullet row from the copy becomes a single line of three labels divided by thin rules. No image in the home hero.

```
DESKTOP
|rail        |text (cols 4 to 10)                          |11 to 12      |
|BRAND       |We sell sponsorship for gaming and youth     |  (feather)   |
|PARTNERSHIPS|rights holders. We run measured pilot        | HOW WE WORK  |
|FOR GAMING  |campaigns for brands who want their audience.| Commission   |
|            |                                             | only when... |
|            |If you run a team, an event... (lead)        | ============ |
|            |I am:  ( A brand ) ( A team, event, creator )| KPI agreed   |
|            |[ Book a call ]   See how we work >          | before...    |
|            |Commission only | KPI agreed | No vanity     |              |
PHONE
| BRAND PARTNERSHIPS FOR GAMING |
| We sell sponsorship for       |
| gaming and youth rights ...   |
| lead text                     |
| I am: [A brand][A team ...]   |
| [ Book a call ]               |
| See how we work >             |
| ............................. |
| HOW WE WORK  aside lines      |
```

### Audience doors ("What we actually do")
Two doors, not three cards: the three copy blocks map as door one (block 01), door two (block 02), and block 03 as a full width sentence beneath both. Each door: 2px top rule (blue for brands, teal for teams and creators), label, H3, body, a text link to its anchor path. No fill, no radius, no shadow. Doors sit columns 4 to 12, split 4 and 5 columns so they are not symmetric (the door matching the active audience takes the wider slot).

```
DESKTOP
|rail |==== blue 2px ============|  |==== teal 2px ================|
|02   |FOR BRANDS                |  |FOR TEAMS, EVENTS, CREATORS   |
|WHAT |Measured pilot campaigns  |  |Sponsorship and brand         |
|WE DO|body...                   |  |partnership sales  body...    |
|     |How a pilot works >       |  |How we sell for you >         |
|     |One discipline, both ways. body sentence across both          |
PHONE: doors stack, active audience first, 48px apart.
```

### Process (accordion)
Used on How it works for "The order we work in" (eight steps) and summarised on home as a plain numbered list of the eight names linking to the full page. Each row: numeral in Bodoni 500 `peacock.blue`, step name in Plex 600, chevron. Built on native `<details>` and `<summary>` so it works without JavaScript. One "Open all" text button above. Rows divided by `hair` rules. Opened row shows the explanation text if and when Soda supplies it; until then the row is a plain list item without a chevron (never an empty panel).

```
| 01  Business problem                                  v |
|=========================================================|
| 02  Consumer behaviour                                v |
| ...                                                     |
| 08  Cost last                                         v |
```

### Proof ledger
A table like ledger, not cards. Each row: status label left (`In progress` in gold deep, `Network` in teal deep, `Founder record` in blue), heading, one paragraph, and a right column for date and source when they exist. When VEXA has a finished case, the row expands into the case format taken from Fourth Floor and ARKA per research: Challenge, Approach, Result, with the result sentence carrying the numbers and each figure marked with a teal source note. One gold underline under the single most important figure.

```
DESKTOP
|STATUS          |WHAT                                      |DATE / SOURCE |
|IN PROGRESS     |Early discovery on a pilot with a gaming  |Sep 2026      |
|                |hardware brand. body...                   |              |
|================|==========================================|==============|
|NETWORK         |Vendor network  body...                   |              |
|FOUNDER RECORD  |body...                                   |              |
PHONE: status label on top, heading, body, meta line.
```

### Costs ("How we are paid, briefly")
Section on `stone`. Two columns in the text span, Stripe pricing and Basecamp pattern: left "Rights holders" (fee plus commission, commission only on close), right "Brands" (one agreed fee). Each column has a slot for a "from ₹" figure that stays hidden until `COSTS_CONFIRMED` is true in `lib/costs.ts`. Beneath, the promise line about the line by line breakdown, then a link "Ask for the breakdown on a first call".

```
|rail  |RIGHTS HOLDERS              |BRANDS                        |
|COSTS |Fee plus commission.        |One agreed fee.               |
|      |body...                     |body...                       |
|      |[from ₹ hidden until set]   |[from ₹ hidden until set]     |
|      |Either way, we open the full breakdown ... (full width)     |
```

### Founder
On `stone`. Photo slot columns 4 to 7 (4:5 portrait, Soda to supply; until then a `paper` box with a 1px `hair` border and the caption "Photo of Soda to come", never an avatar illustration). Text columns 8 to 12: name, role line, the copy's paragraphs, then the one Bodoni italic quote per page ("Very easy is never awesome.") and a LinkedIn text link. Soda is described as founder; never as an advocate.

```
|rail   |[ portrait 4:5     ]|KAUSTUBH (SODA), FOUNDER         |
|ABOUT  |[ caption below    ]|body...                          |
|       |                    |"Very easy is never awesome."    |
PHONE: portrait full width, then text.
```

### Contact form (brief builder)
See section 8 for behaviour. Layout: form in columns 4 to 9, direct contact aside in 10 to 12 (email, phone, Blue Wings Esports, Delhi). Inputs: `stone` fill, 1px `muted` bottom border (5.9:1), 48px tall, label above in Plex 500 15px, helper text 14px `muted`. Focus: fill turns white and a 2px `peacock.blue` outline. Error: `error` text under the field with an icon and `aria-describedby`. Submit is the orange button, full width on phones.

```
DESKTOP
|rail    |STEP 1 OF 3  Who are you?                  |DIRECT CONTACT  |
|CONTACT |( A brand ) ( A team, event, creator, film)|partnerships@...|
|        |STEP 2  What do you want to do?  [chips]   |phone           |
|        |STEP 3  Name / Work email / Company        |Blue Wings      |
|        |        What business problem...           |Esports, Delhi  |
|        |[ Send ]   Reply promise line              |                |
PHONE: aside moves below the form.
```

### Footer
`stone`, 1px `ink` top rule. Left: logo 40px and the entity line (VEXA trades under Blue Wings Esports, Delhi). Middle: two short link groups (Work with us: For brands, For teams and creators, Costs, Valuate; Company: How it works, Proof, About, Contact). Right: email in Plex 500, the feather eye at 24px with a gold 1px rule. Bottom line: © year, Privacy, Terms, Grievance Officer.

```
|[V EXA]            WORK WITH US      COMPANY        partnerships@...  |
|VEXA trades under  For brands        How it works   (feather) ======  |
|Blue Wings Esports For teams...      Proof                            |
|Delhi              Costs, Valuate    About, Contact                   |
|======================================================================|
|© 2026   Privacy   Terms   Grievance Officer                          |
```

### Legal page layout
Rail becomes a sticky table of contents (lg) listing H2s; phones get a collapsible "On this page". Text span holds the document at body size with a 68ch measure, H2 in Plex 600 22px (not Bodoni, legal should feel plain), numbered clauses. Top: title, "Last updated" date, and a note box with a 2px `peacock.blue` left rule: "Drafted as points for counsel to confirm" until counsel signs off. Grievance Officer details sit in a bordered block with name, email and response window, flagged for counsel.

```
|ON THIS PAGE   |Privacy Policy                         |
|1 Who we are   |Last updated 24 Sep 2026               |
|2 What we...   || Drafted as points for counsel ...    |
|3 ...          |1. Who we are  body...                 |
```

## 7. Page by page

Each segment names what it borrows, from where, and why it fits VEXA.

### / (home)
1. Header. Borrows the five item nav and single constant action from Redseer, which keeps "Talk to Us" as the only coloured element in its header on phone and desktop. Fits: one action, less choice.
2. Hero with audience switch. Borrows Bain's "answer two questions" and Redseer's "I want to" selector: a question in the first screen that routes the visitor. Fits: VEXA's two audiences need to self sort in one tap.
3. Why gaming is hard to buy into. Rail and text split from Brunswick's statement block (large serif, generous paper, nothing else). Fits: this paragraph is the diagnosis a cautious buyer needs to agree with.
4. What we actually do (doors). Two routes from Passionfroot's For Brands and For Creators split and Revox's "For creators" and "For brands" footer columns. Fits: two real products, two doors.
5. Where we stand (three row proof ledger from /proof, compact). Borrows ESL FACEIT's "Short facts about the impact" with a footnoted source, and CAM's awards set as text with source and year. Fits: honest status beats an empty logo wall.
6. Process preview (eight names, link). Borrows Wise's three step "how to send" row, cut to a numbered list. Fits: shows the method's order without disclosing internal tools.
7. Costs. Borrows Basecamp pricing ("Just clear, fixed prices" plus FAQ) and Stripe's Standard versus Custom pairing. Fits: NN/g found price the most wanted B2B information, and hidden costs read as evasive.
8. Valuate strip. Borrows Wise's live calculator placed beside plain copy. Fits: the tool is the teams and creators audience's first useful action.
9. Closing call to action. A single Bodoni line and the orange button on `paper`, from Wolff Olins' one statement sections. Fits: ends on a promise, not a banner.
10. Footer.

Conversion path, brands: switch to "A brand" > brands door > Costs > "Book a call" (contact preset to brand). Teams and creators: switch > teams door > Valuate strip > Costs > "Book a call" (preset to rights holder).

### /how-we-work
Intro (PageIntro, rail label "Method"); Two ways we work (doors, compact); The order we work in (accordion; ARKA's six step accordion per research); How the KPI gets set (two columns "If you have a KPI" and "If you do not", Stripe's paired card logic without cards); What we will tell you no on (two short cases set as Bodoni italic pull lines, from Stratechery's ethics statement idea: saying no in public builds trust); What happens if a campaign is off benchmark (a ruled box with two figures "the day we know" and "two days", the figures in Bodoni with a gold underline on "two days"; BCG's number first impact rows); CTA "See what a first call looks like". Path: both audiences end at /contact.

### /proof
Intro "Where we stand right now"; proof ledger, full version (BCG impact rows and ESL FACEIT footnotes); "This is early, honestly." as a Bodoni line; add the primary button "Book a call" beneath it (the audit found no action on this page). Future cases slot into the ledger using the Challenge, Approach, Result format. Photography of real work, with permission recorded, appears here first (Team Liquid's dated team photo "Five times in a row" shows how a real photo plus a dated claim carries proof).

### /about
Intro "Why VEXA"; Founder component (ARKA founder page per research; AZB's named co founder quote with title; Basecamp's "direct access to our CEO"); Why the name (the Bodoni italic quote, alone on `paper`); Entity panel: VEXA Digital, trade name of Blue Wings Esports, Delhi, email (Mercury's plain disclosure strip about what the company is and is not). CTA "Talk to us about your deal".

### /valuate
Intro; the sample card, restyled to `paper` with ink type, bands shown as three labelled segments (the band tokens re used from the old palette in their light forms) and a gold deep "Sample" label; Why VEXA built it; button "Open Valuate" shown only when the subdomain responds, otherwise a disabled state reading "Opening soon" with a link to contact; disclaimer line in `small`. Borrows Wise's calculator (inputs left, answer large right) and warns by counterexample from Influencer Marketing Hub's calculator, whose estimates carry no visible method. Path: teams and creators to /contact.

### /contact
Intro (both copy paragraphs); brief builder (Bain and Redseer question first; Razorpay's threshold routing "Is your monthly revenue more than ₹5,00,000? Contact sales" as the model for budget bands, only once Soda confirms bands); direct contact aside; reply promise. Path end for both.

### /legal/privacy, /legal/terms, /legal/grievance-officer
Legal layout above. Stratechery's plain Terms and Privacy blocks and Brunswick's accessible footer set show the tone. Every statutory point (DPDP Act 2023, IT Act, grievance timelines) stays as drafted points flagged for counsel.

## 8. Interactivity that earns its place

1. **Audience switch.** A two option radio group ("A brand", "A team, event, creator or film") in the hero. Selecting sets `?for=brands` or `?for=holders` (shallow route change) and stores the choice in `localStorage` inside try and catch. Effects: the matching door moves first and wider, the Valuate strip rises above Costs for holders, the closing button label stays "Book a call" but carries the audience into `/contact?for=...` which preselects step 1. With no choice, both doors render equally. Without JavaScript, each option is a link to its anchor. Check: a tester reaches the right door in one tap on a 390px screen.
2. **Brief builder** on /contact. Three short steps on one page, all visible on desktop, stepped on phones: who you are; what you want (chips: sell sponsorship, find brand partners, test gaming with a pilot, check a deal, not sure); your details and the business problem. Optional budget band appears only when `COSTS_CONFIRMED` is true. No estimator until Soda confirms real ranges; a question led builder is the honest fallback.
3. **Process accordion** as specified, native elements.
4. **Inline validation.** Validate on blur and on submit, never on each keystroke. Messages say what to do ("Enter a work email, for example name@company.in"). On success, replace the form with a centred note restating what happens next and the reply promise. The reply time must be confirmed by Soda before launch; the copy's "three to four days understanding your business" describes the proposal, not the reply.

Rejected as gimmicks: preloader, cycling words, count ups, hover lift cards, parallax, chat widget.

## 9. Imagery policy

- Typography does the work above the fold on every page.
- Real photos only, supplied by Soda with written permission and a caption naming who, what and when: Soda portrait, events he worked, partner teams. Until supplied, show a labelled `paper` placeholder, never stock.
- Treatment: full colour, no filters, no vignettes, 2px radius, 4:5 portraits and 3:2 scenes, caption in `small` `muted` beneath.
- Diagrams: line only, 1.5px `ink` strokes, labels in Plex, one accent colour per diagram by the colour meanings above.
- Logo: keep `vexa-logo.png`; commission an SVG trace so the header renders crisp.

**The peacock feather eye**, one motif, at most twice per page (hero aside or footer, plus one section at most):

```svg
<svg viewBox="0 0 64 96" width="40" height="60" aria-hidden="true">
  <path d="M32 95 V10" stroke="#17140F" stroke-width="1" fill="none"/>
  <path d="M32 6 C13 22 9 50 32 88 C55 50 51 22 32 6 Z" stroke="#0F7B6C" stroke-width="1" fill="none"/>
  <ellipse cx="32" cy="36" rx="14" ry="17" fill="none" stroke="#C9A227" stroke-width="1.5"/>
  <ellipse cx="32" cy="37" rx="10" ry="12.5" fill="#0F7B6C"/>
  <ellipse cx="32" cy="39" rx="5.5" ry="7" fill="#0B4F6C"/>
</svg>
```

Sizes: 40px wide in the hero aside, 24px in the footer, 16px as the end mark of a "quill rule" (a 1px `hair` line with the eye at its right end) used once per page to close the final section. Replace the existing `FeatherEye.tsx` geometry with this; keep the component name.

## 10. Motion

Content is fully visible at rest; no element ships at opacity 0. One moment per page: the quill rule draws from left (stroke dash offset, 600ms, ease out) when it enters view. Everything else uses the existing tokens: 150ms for colour and underline changes, 250ms for the accordion and menu sheet. Buttons darken on hover (orange to #F25A10 with ink text, 5.5:1) and move 1px down on press. Under `prefers-reduced-motion: reduce`, all motion is removed. Remove `Reveal.tsx` from the hero.

## 11. Accessibility (WCAG 2.2 AA)

- All text pairings in section 4 meet 4.5:1; large text 3:1. Teal #0F7B6C is never used for small text on `stone`.
- Focus: 2px `peacock.blue` outline, 2px offset, on every interactive element (8.1:1 on paper).
- Targets at least 44 by 44px; chips 44px tall.
- Skip link kept; landmarks `header`, `nav`, `main`, `footer`; one H1 per page; heading levels in order.
- Audience switch is a `radiogroup` with arrow key support; the accordion uses native `details`.
- Form: visible labels, `aria-invalid`, errors linked with `aria-describedby`, error summary on submit with focus moved to it.
- Base text 17px, zoom to 200 percent without horizontal scroll, and layout holds at 320px wide.
- Link text is underlined in body copy; colour is never the only signal.

## 12. Samples by outcome (7 each)

| Outcome | Seven samples studied |
|---|---|
| Trust first consultancy | Brunswick, Bain, BCG, Redseer, FGS Global, AZB, NN/g |
| Editorial serif typography | Brunswick (Petit Serif 72px), BCG (Henderson serif 300 86px), Bain (Tiempos text), Redseer (Cambon), Wolff Olins, Stripe Press (Ivar), Mercury (Arcadia display) |
| Light field, restrained accent | Brunswick (#F6F6EF with navy), Redseer (white with one red action), Bain, Basecamp pricing, Stratechery, NN/g, Mercury pricing |
| Clear two audience routing | Passionfroot (For Brands, For Creators), Revox (creators and brands columns), Razorpay ("Looking for a product?" chips), Redseer ("What would you like us to solve for you?"), Bain (two questions), Wise (Personal, Business), AOG (brands and agencies pages, per research) |
| Proof presentation | BCG (figure first impact rows), ESL FACEIT (dated facts with footnote), CAM (awards as text with source), Fourth Floor (awards under hero), Gamesight (four big figures), NN/g (named client line), Team Liquid (real dated team photo) |
| Pricing transparency | Basecamp, Stripe pricing (Standard and Custom), Razorpay pricing (headline rate and threshold), Mercury pricing, Wise (fee inside the calculator), Stratechery (published speaking fee range), AOG (starting ranges, per research) |
| Founder led credibility | Stratechery (author and ethics statement), 37signals, Basecamp (CEO email), AZB (named co founder quote), ARKA (founder page, per research), NN/g (named founders), Lumikai (People in main nav) |
| Interactive tools | Wise (fee calculator), Bain (two question router), Redseer (solve for selector), Razorpay (product chips), Basecamp (plan selector), Stripe pricing (tabs), Influencer Marketing Hub (calculator, counterexample) |

## 13. Industries, top three, what we take

| Industry | Top 3 studied | What VEXA takes |
|---|---|---|
| Management consulting | BCG, Bain, McKinsey (loaded blank), plus Redseer for India | Serif authority, figure first proof rows, a routing question in the first screen |
| Strategic advisory and communications | Brunswick, FGS Global, Teneo (blocked) | Warm paper field, very large serif, one accent, plain accessible footer |
| Law and professional services (India) | Cyril Amarchand Mangaldas, AZB, Khaitan | Awards and results as dated text, named partner quotes, legal pages presented plainly |
| Sports and athlete partnership agencies | Wasserman (The Team), Octagon, IMG, plus Two Circles | Restraint and one idea per section; avoid their full bleed red and black takeovers |
| Influencer and creator management | Whalar, Viral Nation, Billion Dollar Boy, plus Passionfroot | Brands and creators split in the nav; avoid yellow and orange takeover fields and "OS for the AI era" language |
| Esports organisations | Team Liquid, Fnatic, 100 Thieves, plus S8UL and Orangutan | Real team photography with a dated claim; avoid dark fields, spinners and merch style grids |
| Esports and gaming marketing agencies | NODWIN, Fourth Floor, Gamesight, plus AOG, Skyesports, Maverik | Award and figure strips placed under the hero; the category's dark look is what VEXA steps away from |
| B2B fintech and pricing led software | Stripe, Mercury, Razorpay, plus Wise and Basecamp | Visible prices, Standard versus Custom pairing, threshold routing, up front disclosure strip |
| Gaming venture and studios | Lumikai, Makers Fund, BITKRAFT, a16z Games (blocked) | People in the main nav and thesis pages; avoid Lumikai's illustrated hero, which reads as art, not advice |

## 14. Real references: the one thing taken from each

| Site | The one thing |
|---|---|
| Brunswick | Paper field with a single dark serif and one accent |
| BCG | Proof as figure first rows with a named client story |
| Bain | Two question router in the first screen |
| Redseer | "I want to" selector and one constant header action |
| AZB | Named co founder quote with title |
| Cyril Amarchand Mangaldas | Awards as text with source and year |
| Stripe pricing | Standard and Custom side by side |
| Basecamp pricing | "A stable, well run company is part of the deal" plus pricing FAQ |
| Razorpay | Threshold routing to a human for larger budgets |
| Mercury | Plain disclosure of what the company is and is not |
| Wise | Calculator beside plain copy, result set large |
| Stratechery | Ethics and conflict statement written by the founder |
| Passionfroot | For Brands and For Creators split |
| ESL FACEIT Group | Dated facts with a footnoted source |
| Team Liquid | Real team photo with a dated achievement |
| Wolff Olins | One statement sections with serif and underlined keywords |
| NN/g | "Evidence over opinions" stance; also the doctrine below |

Doctrine: Stanford Web Credibility Guidelines (credibility.stanford.edu/guidelines): verifiable claims, a real organisation, easy contact, restraint with promotion, no errors. Fogg et al., "How do users evaluate the credibility of Web sites?", DUX 2003: design look cited in 46.1 percent of comments. Lindgaard et al., Behaviour and Information Technology 25(2), 2006: visual appeal judged in about 50ms, so the first screen must be complete at rest. NN/g: "The Layer Cake Pattern of Scanning" (headings carry the page, hence the rail labels), "F Shaped Pattern" (left edge matters, hence left aligned rail), "Trustworthiness in Web Design: 4 Credibility Factors" (design quality, up front disclosure, current content, links out), "Pricing information gives B2B sites a competitive advantage", "Dark Mode vs. Light Mode". Hick's law (lawsofux.com/hicks-law): five nav items and two audience choices. Cialdini, Influence and Pre Suasion, applied ethically: authority through named founder and dated facts, social proof only when real and permitted, reciprocity through the free Valuate tool, unity through "we work both sides", commitment through the agreed KPI; scarcity only if a real limit exists. AI template tells: DEV Community "The Purple Gradient Problem" and SmoothUI "AI Design Slop" (purple gradients, Inter, identical icon cards, glassmorphism, gradient numbers, same radius everywhere).

## 15. Build checks

- [ ] Home first screen at 390 by 844 shows H1, audience switch and "Book a call" with no scroll.
- [ ] Colour audit: saturated pixels under 5 percent of any full page capture.
- [ ] Lighthouse accessibility 100 and axe zero violations on all 9 routes.
- [ ] No text below 4.5:1 in a contrast scan; no hex outside section 4 in the codebase.
- [ ] Page renders complete with JavaScript disabled.
- [ ] Grep of built HTML finds no "baseline", "floor", "pass", "fail", em dash or en dash.
