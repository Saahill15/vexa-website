# VEXA brand colours

The site sits on warm paper with black editorial type, one orange action and a small peacock set. The dark charcoal theme is retired. This file follows `DESIGN.md` section 4, which is the source of truth; tokens live in `tailwind.config.ts` under `vx`.

## Proportions

* Neutral fields (paper and stone) carry about 85 percent of every screen.
* Ink type and rules carry about 10 percent.
* All colour together stays at or under 5 percent: orange about 3, the peacock set about 2.
* There are no dark sections, including the footer. No gradients, glows, shadows or blur.

## Tokens

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| `vx.paper` | #F7F4EE | Page field | ink on it 16.7:1 |
| `vx.stone` | #EDE7DC | Second field: costs, founder, footer, inputs at rest | ink 14.9:1 |
| `vx.white` | #FFFFFF | Focused form fields and the chosen option only | ink 18.4:1 |
| `vx.ink` | #17140F | Headings, body, primary rules | |
| `vx.ink.2` | #3A342C | Secondary body | 11.2:1 on paper |
| `vx.muted` | #655D52 | Captions, labels, input bottom border | 5.9:1 paper, 5.3:1 stone |
| `vx.hair` | #D9D0C1 | Decorative hairlines | n/a |
| `vx.accent.500` | #FF681F | The logo orange. Primary button fill, with ink text | ink on it 6.3:1 |
| `vx.accent.600` | #F25A10 | Primary button hover, with ink text | 5.5:1 |
| `vx.accent.deep` | #B83C00 | Orange text on light (active nav), the button's 1px border | 5.2:1 paper |
| `vx.peacock.blue` | #0B4F6C | Wayfinding: focus ring, link hover, process numerals, brands door rule | 8.1:1 paper |
| `vx.peacock.teal` | #0F7B6C | Evidence marks: teams door rule, feather ring. Never small text on stone | 4.7:1 paper |
| `vx.peacock.teal-deep` | #0B6559 | Teal as small text: "Network", form success | 6.3:1 paper |
| `vx.feather.gold` | #C9A227 | Marks only: feather ring, the one gold underline per page | never text |
| `vx.feather.gold-deep` | #8A6A10 | Status text "In progress" | 4.6:1 paper |
| `vx.error` | #B3261E | Form errors | 6.0:1 paper |

## Meaning

Orange means act. Blue means you are here, go there. Teal means this is evidenced. Gold means this is the one number to look at. Never put white text on orange (2.9:1).

## Logo and motif

* `public/brand/vexa-logo.png` (black EXA, orange V) is the site logo: 32px tall in the header on phones, 40px from `lg`, 40px in the footer. `vexa-logo-light.png` is kept for dark print backgrounds only.
* The peacock feather eye (`components/FeatherEye.tsx`) is the one motif, at most twice per page: the hero aside or the footer, plus the quill rule that closes the last section.
