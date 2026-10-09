# Do not paste this into the VEXA Valuate chat

That chat is locked to branch valuate-v2-plan. The website folder has no git repo. Cursor will try to move the agent and die with "not a git repository". Open a new window on `04_SITE_BUILDS/vexa-website` instead. Brand files are already on disk at `01_VEXA/06_content/brand-assets/`, not in the Claude asset panel.

# Paste this whole file into a Cursor chat that has the VEXA website folder open

Folder: `/Users/kaustubh/Desktop/Workflow AI/04_SITE_BUILDS/vexa-website`

This is not Valuate Prompt 3. Do not add Prisma models, event logs, or engine changes. Do not start Valuate Prompts 3 through 10. Do not deploy. Do not touch n8n or Hetzner.

The current Valuate surfaces on this site are a typographic stand-in. Soda rejected that. The line "lowball · fair · premium" as a hero, the three coloured pills, and the note "Typographic card used until a live product screenshot" are the failure. Replace them with the real brand artwork and the already designed prototype gauge. Do not invent a third visual language.

## Read first

1. `/Users/kaustubh/Desktop/Workflow AI/00_BRAIN/foundation/VEXA_BRAND_SYSTEM.md` sections 2, 4, and 6
2. `SITE_PLAN.md` section 2.5 (Valuate page) and the home Valuate strip
3. `/Users/kaustubh/Desktop/VEXA Valuate/design/prototype/index.html` from the landing "A sample result" block through the result gauge (`.gauge-track`, `.lens-card`, Ask for). That file is the layout source. Do not restyle it into cards of your own.
4. `components/home/ValuateStrip.tsx` and `app/valuate/page.tsx` as they are now, so you can see what to throw out
5. `components/Header.tsx` for how the real logo is already loaded

## Brand assets, use the files

List `public/brand/` before you draw anything.

Already wired, keep using these image files. Do not redraw them as SVG, CSS, or a "similar" mark:

- `/brand/vexa-logo.png` primary lockup (home, and the Valuate page where the parent brand is introduced)
- `/brand/vexa-vmark.png` the simplified V (favicon already, and the product panel)

If a trail banner or stone texture file exists under `public/brand/` or anywhere in Workflow AI named like `vexa trail banner`, copy it into `public/brand/` and use it once, at low opacity, behind the dark product panel only. Never behind body text. If you cannot find the file, leave the panel flat ink `#14110F`. Do not generate a texture, a gradient blob, or a noise filter that pretends to be the banner.

Valuate's own mark is the gauge submark already in the prototype (`#vexa-submark`: two rounded bars, accent tile). Copy that SVG. Do not design a new Valuate logo. Place the real V mark beside it so the page reads as VEXA, and the gauge mark reads as Valuate. Same orange `E45824`. No second accent.

Fonts stay General Sans for display and Inter for body and every rupee figure (`tabular-nums`). They are already self hosted. No Google Fonts. No Fraunces. No Geist.

## What to build

### Home strip

`components/home/ValuateStrip.tsx` becomes a compact band, not a second homepage.

Left: the real V mark image, the word Valuate in General Sans, and the existing sentence from SITE_PLAN only if you fix one false claim. Valuate has a creator door and a brand door. Delete "Built for creators, not brands" and any line that says the tool is not for brands.

Right: a real product frame, not a text tile. A dark panel (`#14110F` / `#201B17`) holding the prototype sample result, scaled to the strip:

- Gaming, 500 followers, about 2,900 typical views
- Lens: "Your views support" ₹913 to ₹1,236
- Lens: "Where you are" (no follower price band, this profile is under 1,000 followers)
- The gauge track from the prototype (lowball, fair, premium zones) with one offer pin

Use `<Image>` for the logo files. The gauge can be the prototype's HTML structure ported into React. It is not a screenshot of a fake UI, and it is not a new illustration.

### `/valuate` page

Same product frame, larger, on the cream page. Open with the real primary lockup, then the product panel, then the existing "Why VEXA built it" paragraph and the external button to `https://valuate.vexadigital.in`.

The product panel must include:

- V mark image plus the prototype gauge submark
- "Ask for" as one figure, tabular, General Sans. On this sample the prototype's result screen uses the offer pin at ₹3,500 against the band. Keep the landing sample's lens copy (₹913 to ₹1,236 and Where you are) so you do not invent a second founder case. One number for "Ask for" may be the top of that views band (₹1,236) because the product rule is: the reply quotes one number, the band stays on the card. Do not also print ₹3,000 to ₹10,000.
- The gauge, the two lenses, and one plain sentence from the prototype: under 1,000 followers, barter and small fees are normal.

Kill the pill row that only repeats the words lowball, fair, premium. The gauge already says that.

### Valuate app, one shared lockup

Copy `vexa-vmark.png` into `/Users/kaustubh/Desktop/VEXA Valuate/public/brand/`. In `components/shell/Footer.tsx` only, add the real V mark image and the words "Built by VEXA" linking nowhere or to `https://vexadigital.in`. Do not redesign the Valuate app. Do not restyle DealWorkspace. Do not change `lib/pricing-engine.ts`.

## Taste bar

The page should feel like the printed letterhead sitting next to the dark prototype: cream paper, one orange, the real V, then the gauge as the only "interface."

These are failures, even if the build is green:

- A hero that is only the words lowball, fair, and premium
- Three equal feature cards, an icon row, or a lucide grid
- A purple, blue, or neon gradient, a glassmorphism blob, or a centred fake dashboard
- A redrawn V, a wordmark set in a font instead of the logo file on the Valuate page intro
- Stock photography, AI people, or esports neon
- Emoji
- A new colour that is not in VEXA_BRAND_SYSTEM.md

Copy stays clean English. No dashes as punctuation. Ranges use "to".

## Done check

1. `npm run build` in the website folder passes.
2. Home and `/valuate` render the real logo or V mark via `next/image`, visible in the DOM as those files, not an inline redraw.
3. Grep of `components/home/ValuateStrip.tsx` and `app/valuate/page.tsx` finds no "Typographic card" and no "not for brands".
4. The sample shows Where you are and does not show ₹3,000 to ₹10,000.
5. You looked at 390px and 1280px. The product panel does not overflow. The logo is not cropped into an unreadable slice.
6. Append `BUILD_LOG.md`: what you tried, what broke, what came back. Name the brand files you actually used.

Do not commit unless the build is green. If you commit, message:

`fix: Valuate on the site uses the real mark and the prototype gauge`

Push only the website repo if it already has a remote. Do not force. Do not commit `.env`. Leave the Valuate app change as a separate commit on `valuate-v2-plan` if you touched that footer: `chore: V mark on Valuate footer`. Do not commit `.claude/` or `docs/v2/PASTE_PROMPT_2.md`.

## Stop

Do not redesign Home, How We Work, Proof, About, or Contact. Do not run website Prompt 8. Do not deploy. Do not change pricing. If a brand file is missing, say which filename you looked for and stop that one asset. Do not draw a substitute logo.
