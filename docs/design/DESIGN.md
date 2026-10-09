# VEXA website: composition and interaction

08 October 2026. Direction for Soda’s latest local website refinement. SITE_PLAN.md owns the routes and data journey. This document records visual choices and the actual reference study. Neither document claims user acceptance or commercial results.

## A gaming world that belongs to the page

Keep the original papercraft gaming artwork Soda liked, but place it at the scale of the opening scene. The cream ground can merge into the page; a quiet region behind the words protects legibility. The controller, player-facing screen, microphone and audience make the subject tangible. Preserve the original VEXA mark. No fabricated founder portrait, client campaign or partner-logo wall.

Carry its warm paper, orange path and teal shadows into subsequent layouts. Orange marks a consequential action or selected state. Charcoal provides readable text and a contrasting product moment. Peach and teal vary the page’s rhythm without turning every subject into an identical coloured rectangle. The palette comes from the existing mark and the approved direction of the artwork, not a universal colour-ratio formula.

Use self-hosted IBM Plex Sans consistently. Let content determine scale: concise primary heading, recognisable section hierarchy, body copy wide enough to breathe but narrow enough to read. Keep paragraphs around a comfortable reading measure; use 18px article text where the viewport permits it. Do not return to the difficult display face Soda rejected.

## Page rhythm

The home opening establishes the company within the artwork. Valuate follows early and occupies enough space to explain the actual product. A useful interactive demonstration shows how format and requested usage change the quote question without fabricating a monetary benchmark. A visitor can then explore creator, team and tournament partnerships in one composed scene, rather than scan four ruled rows. An editorial article feature changes the reading pace. Team and esports paths remain visible and purposeful.

Brands and esports pages need distinct stories. Their sections name work a visitor recognises, explain what is supplied and show a relevant example. Repeated presentation panels should not substitute for the explanation. Team and event work have different deliverables. The team page uses actual duties and people; the contact page makes beginning a conversation feel easy.

The blog index is a publication: featured piece, descriptive category, author/date/read time and a small usable filter. Article reading uses a calm content column. A sign-in dialog belongs at the continuation point after a substantial introduction, can be dismissed, and returns the registered reader to the same piece. Sources remain accessible so even the introduction’s claims can be checked.

## Interaction map

| Element | What the interaction changes | Motion and fallback |
| --- | --- | --- |
| Initial scene | Establishes the illustration and heading together | Short reveal that settles; no fake loading percentage or blocked wait |
| Audience navigation | Exposes descriptive links for the chosen audience | Brief panel entrance; click, keyboard and Escape; same groups on mobile |
| Campaign exploration | Changes the partner explanation and its visual focus | Selected state with a short transition; essential explanations available without script |
| Valuate demonstration | Shows the implications of format and usage scope | Immediate visible change; label illustrative workflow, no invented price |
| Article filter | Narrows the three actual articles | Clear selected category and count; retain an all-articles view |
| Registration checkpoint | Opens the account journey after useful reading | Once-per-visit popup on reaching checkpoint, dismissible; inline link remains |
| Contact | Progresses through reason, context and reply details | Preserve entered data when going back; visible focus and error recovery |
| Comments | Saves a contribution with truthful pending review state | Status tied to the author; no fabricated comments or fake instant publication |
| General controls | Confirms hover, focus, press and success | Consistent shape, contrast and restrained arrow/colour feedback |

Use transform and opacity for nonessential motion. Disable movement for reduced-motion preferences and preserve visible content in server-rendered HTML. Scrolling should remain under the visitor’s control. A loading indicator is appropriate only while something is actually waiting. Do not add continuous motion around reading text.

## Actual live interface study

These are bounded observations made in the browser on 08 October, with local screenshots saved. They are not whole-site performance or accessibility audits, and they do not establish conversion rates.

| Reference and portion inspected | Observed interface behavior | Decision for VEXA |
| --- | --- | --- |
| [Ear to the Ground](https://www.eartotheground.agency/), homepage opening and first work section | Full-width moving imagery establishes the subject beneath a short agency proposition. The next section changes scale to campaign images and keeps a simple contact action visible. | Integrate VEXA’s original artwork at scene scale, then change composition according to the next subject. Its client work is evidence for that agency only. |
| [BASIC/DEPT](https://www.basicagency.com/), homepage and [contact](https://www.basicagency.com/contact) | The page briefly reveals its mark, uses expansive reel media, then changes to generous editorial spacing. Contact pairs a large human image with plain contact categories. The observed menu interaction was inconclusive, so no menu behavior is inferred. | Use a brief opening entrance and a contact layout with one clear start. No borrowed awards, client work or forced loading screen. |
| [Fnatic partners](https://fnatic.com/partners), opening and Esports menu | Video occupies the partnership opening. The opened menu groups specific destinations in columns with short descriptions; contact and case studies are distinct. | Group audience jobs in two useful submenus. Keep account access secondary. The partner proofs and published figures are not VEXA’s. |
| [Mondaq](https://www.mondaq.com/), an article and login dialog | The article exposes authorship, date and reading content; login opens over the article with a registration alternative. This browser session did not establish an automatic reading-limit trigger or Google sign-in. | Apply Soda’s explicitly requested preview-to-account checkpoint and return-to-article flow. Do not claim every detail is copied from observed Mondaq behavior. |

This pass inspected actual rendered layouts and interactions. It did not watch every design reference reel or claim a complete design curriculum. The specific issue with VEXA was repetitive composition and weak integration. A divider or rounded shape alone cannot establish that a website was generated by AI.

## Supporting guidance

[NN/g on motion](https://www.nngroup.com/articles/animation-purpose-ux/) supports brief feedback and continuity during state changes. [NN/g on grouped menus](https://www.nngroup.com/articles/mega-menus-work-well/) supports exposing related destinations together. Apply these principles to the size of this site rather than copying a large site’s menu wholesale. [W3C on interaction animation](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) informs the reduced-motion treatment. These sources guide usability; they do not select VEXA’s exact colours, prove buyer fit or approve the design.

## Review evidence

Completed local review on 08 October 2026. The parent inspected the homepage, brand, esports, team, Valuate, article index, article, account and contact layouts at 1440px and 390px. No horizontal overflow was observed in the checked phone layouts. Live reference observations and screenshots cover Ear to the Ground, BASIC/DEPT, Fnatic and Mondaq as described above.

The browser checks exercised desktop keyboard menu opening and Escape recovery, mobile audience menus and real section links, Valuate format and usage explanations, partner selection, article category filtering and empty-search recovery. The mobile reader flow created a synthetic account, saved name and role, returned to the same article continuation, submitted a pending comment, opened its public profile with no email exposed and signed out. A separate desktop account check verified the checkpoint popup and Escape dismissal. The contact flow checked missing fields, invalid email and consent, back-navigation preservation, active-step focus and a saved synthetic enquiry. Database readback confirmed the reader, pending comment and enquiry. No external email was sent.

Reduced-motion emulation disabled the hero animation and transform. With JavaScript disabled, the mobile homepage remained readable and exposed all main navigation links. Browser console inspection found no errors in the reviewed interaction flow. These are bounded acceptance observations, not a formal accessibility audit or target-customer test.

The integrated optimized build, lint and types passed. The account worker's 57 isolated security checks passed, as did the parent's 40 preview checks and three production configuration cases: missing secrets, legacy lead secret only and a real account secret. Anonymous HTML and RSC do not include full article prose; a lead cookie cannot grant access. Evidence is preserved in the current task's work folder, with exact pre-edit source copies and a final change manifest.

Email/password works in the local preview. Website Google OAuth, verified-email and recovery delivery, stable production configuration, authorised moderator assignment and a reviewed release remain dependencies. Contributor publishing is future work. The public website has not changed.
