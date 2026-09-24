# VEXA brand colours

The VEXA brand stays: the logo and its orange lead. A peacock feather set is added as the signature element, a nod to Lord Krishna. The site now sits on warm charcoal, following the owner's reference reel.

Tokens live in `tailwind.config.ts` (under `vx`) and as CSS variables in `app/globals.css`.

## The reference, measured

The owner's reference is a gaming room lit in deep green, burnt orange and warm grey on near black. Measured from the reel:

* Field: warm charcoal, #050403 to #100E0A (about 60 percent of pixels) and #231F16 to #323728 (about 27 percent).
* Ambient light: green, #397441 to #6F8C68.
* Payoff: orange, #A04A1F to #CB7537, held back.
* Only about 5 percent of pixels are saturated.

## Rules

1. Charcoal carries about 85 percent of every screen. Saturated colour stays under 10 percent. Prefer warm charcoal to cold black.
2. Peacock teal is the one ambient accent: edge glows, cove lines, dividers and hover halos. It plays the part of the green light in the reference.
3. Peacock blue goes on borders and edges only, never as a large fill.
4. The logo orange and feather gold are held back for calls to action and small marks.
5. Glow sits on the edges of shapes and never fills a surface. Never glow on text.
6. Grey is the neutral between colours.
7. The feather eye appears at most twice on a page.
8. No rainbow gradients, no glassmorphism, no neon glow on body text.
9. Every text pairing must reach WCAG AA: 4.5:1 for body text, 3:1 for large text.

## Fields: warm charcoal

| Token | Hex | Use |
| --- | --- | --- |
| `vx.charcoal.950` | #070605 | Deepest field: the "logo on a jersey" section, the proof card, the footer. Text on orange buttons. |
| `vx.charcoal.900` | #100E0A | Page background (`--vx-bg`), header, mobile menu. |
| `vx.charcoal.800` | #1A1711 | Cards and form inputs (`--vx-surface`). |
| `vx.charcoal.700` | #231F16 | Second card tone (the teams and creators door). |
| `vx.charcoal.600` | #323728 | Grey neutral for borders and dividers (`--vx-border`). |

## Text and warm greys

| Token | Hex | Use | Contrast on #100E0A / #1A1711 / #231F16 |
| --- | --- | --- | --- |
| `vx.cream.50` | #FAF8F6 | Headings and main text. | 18.2 / 16.9 / 15.5 |
| `vx.neutral.200` | #E4DDD5 | Body text on the deepest fields. | 14.3 / 13.3 / 12.2 |
| `vx.neutral.400` | #A79C90 | Muted text and small print. | 7.2 / 6.6 / 6.1 |
| `vx.band.lowball-dark` | #F08A80 | Form error text. | 7.9 / 7.4 / 6.8 |
| `vx.band.fair-dark` | #5CC48E | Form success text. | 8.9 / 8.3 / 7.6 |

## Logo

Final logo: an orange leaf shaped V (it doubles as a feather or a flame), EXA in a thin black high contrast serif, a rule, and "ESPORTS CONSULTANCY / estd 2025".

| File | Use |
| --- | --- |
| `public/brand/vexa-logo.png` | Light backgrounds (print, partner decks, any future light page). Transparent edges trimmed, 1132 x 590. |
| `public/brand/vexa-logo-light.png` | Dark backgrounds. Same file with the black letters, rule and tagline turned to near white (#FAF8F6); the orange V is untouched. Used in the header (36px tall on mobile, 44px from the md breakpoint) and the footer (48px tall). |

## Action: the logo orange

Sampled from the logo: #FF681F (RGB 255, 104, 31). It replaces the earlier #E45824 and #C94A1C.

| Token | Hex | Use | Contrast checks |
| --- | --- | --- | --- |
| `vx.accent.500` | #FF681F | Primary button fill with charcoal text, orange text links on charcoal, focus ring. | 6.7:1 on #100E0A. Charcoal text on it 7.0:1. White text on it 2.9:1, so never white on this shade. |
| `vx.accent.600` | #C23F00 | Button hover fill with white text. Orange text on any light background. | White on it 5.2:1. Only 3.7:1 on charcoal, so never text on dark fields. |
| `vx.accent.100` | #FDE7DC | Text selection tint. | Background only. |

## Peacock set

| Token | Hex | Use | Contrast checks |
| --- | --- | --- | --- |
| `vx.peacock.teal` | #0F7B6C | The ambient accent. Dividers (section edges, footer top rule), the edge glow round the closing call to action, the top rule on the teams and creators door, the feather eye. | 3.7:1 on charcoal: rules and marks only, never text. |
| `vx.peacock.teal-light` | #4FB3A2 | Teal for text: nav hover. | 7.6:1 on #100E0A. |
| `vx.peacock.blue` | #0B4F6C | Borders and edges only: the top rule on the brands door, the core of the feather eye. | 2.2:1 on charcoal: never text, never a large fill. |
| `vx.feather.gold` | #C9A227 | Small marks only: the short rule beside the hero feather eye, footer link hover. | 8.0:1 on charcoal. |

## Where the accents sit today

* Edge glow: the closing call to action is a charcoal card with a 1px teal border at 60 percent and a soft teal shadow outside the edge. The surface stays charcoal.
* Dividers: the "logo on a jersey" section and the footer have teal rules at 50 percent.
* Door cards: a 2px top edge, peacock blue for brands and peacock teal for teams and creators.
* Feather eye (`components/FeatherEye.tsx`): concentric leaf shapes in gold, teal and blue that follow the curve of the logo's V (a pointed tip leaning right and a full, rounded base), so it reads as an echo of the V rather than a second mark. Used beside the logo in the header and as the hero accent on the home page.

## Accessibility change

The earlier buttons put white text on #E45824 at 3.7:1. Primary buttons now use charcoal text on the logo orange (7.0:1) and switch to white on #C23F00 (5.2:1) on hover.
