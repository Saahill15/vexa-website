# VEXA site audit: what vexadigital.in says, how well it says it, what is missing

Audited: 23 to 24 September 2026. Scope: our own site only (www.vexadigital.in, which also serves on the bare domain vexadigital.in). Competitors and buyer signals are covered by other researchers.
Owner: Soda (Kaustubh), founder. Every quote below is under 15 words and verbatim from the live site.

# 0. Method and what could not be reached

What I did:
* Fetched all 9 URLs listed in the sitemap with WebFetch and with curl (raw HTML, status codes, headers): home, /how-we-work, /proof, /about, /valuate, /contact, /legal/privacy, /legal/terms, /legal/grievance-officer. All return 200. A random URL returns a proper 404 status with the site chrome and default Next.js text.
* Fetched /sitemap.xml and /robots.txt. Both exist and work.
* Downloaded the site CSS, every JavaScript chunk, and all five font files, and read them. Read the site's own component code for the header, the scroll reveal and the contact form.
* Opened the site in Chrome (Claude in Chrome tools were available). Watched the homepage load, scrolled the whole homepage at desktop width, checked hover states, viewed How We Work, Proof, About, Contact and Valuate at desktop width, and captured network requests on the homepage.
* Read all legal pages in full. Checked current law on DPDP commencement and the Online Gaming Act with web sources (listed in section 10).

What failed or is not verified:
* Mobile layout was NOT observed in a browser. The resize call reported success at 390 by 844, but the screenshots still came back at a desktop frame width (about 1479 px). During the session the shared Chrome tab also twice landed on unrelated third party sites (aogindia.com, ampverse.com) after I navigated to vexadigital.in pages. curl shows no redirect on any vexadigital.in page (200, zero redirects, no such strings in the HTML or scripts), so this is a browser session problem, not a site behaviour. I discarded those screens and used none of it. All mobile statements below are inferred from the Tailwind classes and component code, and are labelled "inferred".
* https://valuate.vexadigital.in is unreachable. curl through the proxy returned 502, WebFetch reported name not known, and Chrome showed its error page. A DNS over HTTPS lookup against Google returned status 3 (NXDOMAIN) for that hostname, with the authority being the domain's own nameserver (ns39.domaincontrol.com). The record does not exist. The tool that the homepage and Valuate page send people to is not live at that address.
* The contact form was not submitted (it would create a real lead record and I have no consent to send a test). I confirmed the endpoint exists: GET /api/contact returns 405 and OPTIONS returns Allow: OPTIONS, POST. Where submissions go, and whether anyone is notified, is not visible from the front end.
* JavaScript timing from the page (Chrome performance API) worked only in part. Some calls were blocked by the tool. Timing figures below are from one desktop session with a warm connection and one network capture, so treat them as indicative, not a lab test.
* Not run: Lighthouse, WebPageTest, a screen reader, a real phone. Recommended as a follow up.

# 1. Source of truth: what the site says VEXA is

One line the site gives itself (meta description and footer): "Sponsorship sales for gaming and youth rights holders." plus "Measured pilot campaigns for brands reaching gamers 16 to 28."

The business as the site defines it:
* Two sided intermediary.
  * Sell side: VEXA sells sponsorship and brand partnerships for "esports teams, events, creators and films". Paid by a fee plus a commission that "only lands when your partner actually closes".
  * Buy side: VEXA builds a measured pilot campaign for brands reaching gamers aged 16 to 28. The KPI, benchmark and success criteria are written down before spend. The brand pays one agreed fee covering "strategy, campaign design, choosing partners and reporting".
* Positioning: an honest, numbers first alternative to reach based pitching. The argument: gaming pitches lead with reach (views, community size, follower count), and none of that shows whether a KPI was met. Repeated promise: agree the number before the spend, report against it after, and say no when gaming is the wrong move.
* Method: an eight step order ending with "Cost last". Idea line: "You compete on moments."
* Proof position: openly says there is none of its own yet. "VEXA has not yet closed an independently branded campaign under its own name."
* Founder: Kaustubh (Soda), law graduate, three years of competitive BGMI as an in game leader.
* Free tool: VEXA Valuate, a deal fairness checker for creators and brands (currently a static picture, see section 3).
* Location and contact: 77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070. Phone +91 9958895505. partnerships@vexadigital.in.

Who it serves (as written): rights holders (team, event, creator business, film) and brands wanting gamers 16 to 28. The homepage headline leads with the rights holder side.

Where the site and the brief you gave me differ:
* Your brief: gaming and esports "commercial architecture" business, with creator, sponsorship and esports team deals and campaign architecture for brands. The words "commercial architecture" and "campaign architecture" appear nowhere on the site. The site uses "sponsorship sales" and "measured pilot campaigns". "Architecture" is your internal frame, not your public one.
* Your brief: trades as VEXA under Blue Wings Esports. "Blue Wings" appears zero times on the site. The site's legal entity is presented only as "VEXA Digital". There is no legal entity name, legal form, GSTIN, or registration number anywhere.
* The site adds "films" and "youth" as rights holder categories. Your brief is gaming and esports only. This widens the promise and blurs the niche.
* Your brief: audience 16 to 28. The site matches (16 to 28). Note the audience includes minors, which matters legally (section 8).

# 2. Site map, navigation and technical shape

Pages (9, all in the sitemap): Home, How We Work, Proof, About, Valuate, Contact, Privacy, Terms, Grievance officer.

Header navigation, same on every page: Home, How We Work, Proof, About, Valuate, Contact, then a pill button "Book a call" (to /contact). Sticky at the top, translucent cream with blur, about 65 px tall.
Footer: logo mark, one line description, phone (tel link), email (mailto link), address, then Privacy, Terms, Grievance officer, and "© 2026 VEXA Digital". No navigation links, no social links, no newsletter.
Mobile (inferred): below 1024 px the whole desktop nav is hidden, including the Book a call button. Only the logo and a hamburger show. The full screen menu has the links at about 30 px plus Book a call.

Stack: Next.js (App Router, server rendered, served with s-maxage of one year and x-nextjs-cache HIT), Tailwind CSS, next/image, next/font. Hosted from IP 167.233.116.200. www is a CNAME to the bare domain.

# 3. Page by page: structure, headlines, calls to action

## Home (/) about 516 words

Order of sections:
1. Hero. Eyebrow: "Brand partnerships for gaming". H1 (20 words): "We sell sponsorship for gaming and youth rights holders. We run measured pilot campaigns for brands who want their audience." Subhead speaks to rights holders first, then to brands "chasing gamers aged 16 to 28". CTAs: "Book a call" (filled orange pill) and "See how we work" (text link). Small aside at bottom right, labelled "How we work": "Commission only when you close. KPI agreed before a brand spends."
2. "Why gaming is hard to buy into". Two column: heading left, paragraph right. Says pitches lead with reach and "None of it says whether a KPI was met".
3. "What we actually do". Three cards numbered 01 to 03. 01 "Sponsorship and brand partnership sales" (white card). 02 "Measured pilot campaigns" (light grey card). 03 "One discipline, both ways" (dark ink card, the visual accent).
4. "How we are paid, briefly". One bordered box, two paragraphs: rights holder fee plus commission; brand fee as one number. "we open the full breakdown on the first real call".
5. Valuate promo. Eyebrow "VEXA Valuate, free tool". Heading: "Valuate checks a deal for a creator or a brand before anyone signs." Buttons "See Valuate" and "Open the tool" (opens the dead subdomain in a new tab). On the right a dark card that looks like a phone app: "Gaming, 500 followers, about 2,900 typical views", "Ask for ₹1,236", a Lowball / Fair / Premium bar with a marker "Offer ₹3,500", "Don't go below ₹913", "Your views support ₹913 to ₹1,236", "Most brands start paying cash at 1,000 to 5,000 followers". The whole card is one link to /valuate.
6. Closing CTA. "Tell us what you are trying to do. We will tell you honestly whether gaming can do it, and how we will count it." Button "Book a call".
7. Footer.

Book a call appears 3 times on the page body plus the header.

## How We Work (/how-we-work) about 421 words
Eyebrow "Method". H1 "How we work". Intro: a brand asks how to sell more, "That is not quite the right question." Then:
* "The order we work in": eight numbered steps, names only, no explanation under any: Business problem, Consumer behaviour, Gaming relevance, The commercial mechanism, The activation itself, The measured outcome, The business decision it supports, Cost last.
* "Two ways we work": rights holders (fee plus commission) and brands (pilot with agreed KPI).
* "How the KPI gets set": if a brand has a KPI, VEXA tests the plan against it; if not, VEXA proposes a benchmark and sizes the spend so it is "realistically reachable".
* "What we will tell you no on": two past cases (a brand whose product was not ready for the segment, and a rights holder whose property did not exist yet).
* "What happens if a campaign is off benchmark": tell you the day it is known, recommend against more spend, "take two days to bring you a fix".
CTA: "See what a first call looks like" (goes to /contact, which does not describe a call script, only a form).

## Proof (/proof) about 267 words
Eyebrow "Proof". H1 "Where we stand right now". Three cards, all honest, none evidential:
* In progress: "early discovery on a pilot with a gaming hardware brand", unnamed, "built to settle an argument gamers already have".
* Vendor network: proof "sits with their track record, not a campaign VEXA has run". No vendor is named.
* Founder record: authored campaign strategy for gaming organisations under NDA, and worked paid ground crew at "a national energy drink activation" inside a major esports network. Neither is a VEXA case study.
Closing line: "This is early, honestly." No CTA button on the page, only a sentence pointing to a talk.
There are no numbers, logos, names, dates or links on this page.

## About (/about) about 266 words
H1 "Why VEXA". Sections "Who is behind VEXA" (Kaustubh, Soda, law graduate, BGMI in game leader for three years, "the discipline of reading a deal exactly as written") and "Why the name" ("Very easy is never awesome."). CTA "Talk to us about your deal". No photo, no surname on this page, no LinkedIn, no team, no story of how the business started, no mention of Blue Wings Esports.

## Valuate (/valuate) about 210 words
Eyebrow "Free tool". H1 "VEXA Valuate". Intro says "Tell it the deal, and it shows one number to ask for". Below is the same static dark card as on the homepage, plus "Why VEXA built it" ("We sit on both sides of a brand deal"), and a button "Open Valuate" to the dead subdomain. There is nothing on this page a visitor can type into or click to get a number. No disclaimer, no method, no data source for "real views".

## Contact (/contact) about 165 words
Eyebrow "Contact". H1 "Book a call". Copy: "No pitch on the first call." and the promise of "three to four days understanding your business before we propose anything". Says the visitor should say whether they are a rights holder or a brand. Form fields: Name, Work email, Company, "What business problem are you trying to solve?", "How did you hear about VEXA? (optional)", button "Send". First four are required (enforced by script only, see section 5). Side panel "Direct contact": phone and email as links. There is no calendar or slot picker, so "Book a call" here means "send an enquiry".

## Legal pages
/legal/privacy (Privacy Policy, about 805 words), /legal/terms (Terms of Use, about 606 words), /legal/grievance-officer (about 156 words). Full analysis in section 8.

# 4. Trust signals inventory

Present:
* Named founder with a plausible story (law graduate, BGMI in game leader). Full name "Kaustubh Srivastava" appears only on the grievance page.
* Physical address, phone, email on every page footer.
* A written grievance route and dated legal pages.
* Explicit commitments: numbers agreed before spend, a two day fix if off benchmark, a three to four day discovery before any proposal, "we say so" when gaming is not right.
* Radical honesty on the Proof page. This is a real differentiator and also the biggest commercial risk on the site.

Absent:
* Case studies: none. Client logos: none. Testimonials: none. Named partners, teams, creators or events: none. Named hardware brand: withheld. Named vendor network: none.
* Any performance number from any campaign. The only figures on the site are the pricing example inside the Valuate mock.
* Team beyond the founder. No photo of anyone. No advisors.
* Social profiles: no LinkedIn, Instagram, YouTube, X or Discord links anywhere, on a site selling to gaming rights holders and creators who will check social presence first.
* Press, awards, certifications, memberships, esports federation or league relationships.
* Business identity: legal entity, GSTIN, PAN, registration number, Blue Wings Esports link.
* Sample deliverables: no example one page campaign brief, KPI sheet, or report.
* Price signals: no starting fee, no commission range, not even a band.
* Analytics and any measurement of the site itself (section 7).

# 5. Forms, contact details, conversion path

Contact form (client component, posts JSON to /api/contact):
* Fields: name (text, autocomplete name), email (type email, autocomplete email), company (autocomplete organization), problem (textarea, 5 rows), source (optional). No phone field, no role, no budget, no timeline, no "I am a rights holder or a brand" selector despite the copy asking for it.
* Validation: the form has noValidate, so the browser will not check anything. A script checks that the four required fields are non empty and shows a red message under each field. It does not check that the email is a valid address on the client. Required fields are not marked as required visually or with aria attributes, and error paragraphs are not linked to their fields (no aria describedby, no aria invalid). Only the final status message has role="status".
* Messages: success "Thanks. We will get back to you." (no time frame). Network error tells the person to email partnerships@vexadigital.in.
* No consent checkbox, no link to the privacy policy at the point of collection, no note on where data goes, no CAPTCHA or honeypot visible in the client code, no visible confirmation email.
* Input text is 14 px, which makes iOS Safari zoom the page when a field is focused (inferred from the class, not tested on a phone).
* Not tested end to end (section 0).

Other contact routes: phone +91 9958895505 (tap to call), partnerships@vexadigital.in (mailto), postal address. No WhatsApp, no scheduling link.

Conversion path today: any page, then "Book a call", then a five field form, then silence with no stated response time. Nothing between "curious" and "send a business problem to a stranger". There is no lighter step (a downloadable one page, a working Valuate, a sample KPI sheet).

# 6. Visual system

Palette (from the site's own CSS variables):
* Background cream `#faf8f6`; secondary cream `#f2eeea`; white `#ffffff` for alternate sections and the footer; hairline borders `#e4ddd5`.
* Ink (text, dark card) `#14110f`; other inks `#2a2521`, `#55483d`; muted grey brown `#6e645a` (body copy), `#a79c90` (labels, footer copyright).
* Accent orange: `#e45824` (buttons, focus ring) and `#c94a1c` (eyebrows, active nav, button hover); tint `#fde7dc`.
* Status colours for Valuate bands: lowball red `#b3261e` on `#fbeae9`; fair green `#1f7a4d` on `#e7f5ec`; premium amber `#9a5b00` on `#fbf0dc`.
* Dark card border `#3a322b`. The palette is warm, calm and editorial. It reads as a boutique consultancy or fintech, not as gaming or esports. There is no neon, no dark theme, no gradient, no gaming cue. That fits a marketing manager audience and may be deliberate. It also means nothing on the page signals "gaming" beyond the words.

Typography:
* Headings and wordmark: General Sans (weights 500, 600, 700 loaded; headings use 600). Body: Inter (400 and 500).
* H1 60 px on screens 768 px and wider, 36 px below (inferred), tight tracking (minus 3 px at 60 px) and line height 1.0. H2 30 px / 36. H3 20 px / 28. Body 16 / 24. Eyebrows 12 px, medium, uppercase, 0.2em tracking, in accent `#c94a1c`.
* Hierarchy is clean and consistent. The 20 word H1 at 60 px runs to five lines at desktop and fills most of the first screen.

Hero treatment: purely typographic, left aligned, on flat cream. The right side of the hero is empty at desktop apart from a small bottom aligned aside. No image, video, pattern, gradient or illustration.

Imagery: there is effectively none. The only image file is the logo mark. The only graphic is the Valuate mock card built in HTML and CSS. No photography of players, events, creators or products anywhere.

Logo and icons: an orange V mark (`/brand/vexa-vmark.png`, PNG 335 by 318 px, about 84 KB, not square, with a thin pale outline visible around the shape) plus the wordmark "VEXA" set in text. The same PNG is used as the favicon (`icon.png`), plus a multi size `favicon.ico`. No SVG logo, no apple touch icon, no web manifest. Iconography otherwise: one tiny inline SVG in the Valuate mock and a CSS hamburger. No icon set, no illustrations.

Layout and spacing: container max width 1152 px with 20 px side padding on phones and 32 px from 768 px. Sections use 56 to 96 px vertical padding. Sections alternate white and cream with hairline borders. Cards are rounded (about 16 px), buttons are pills. On inner pages the text column is narrow (about 600 to 700 px) and centred. On the Contact page the form card starts to the left of the heading column, so the intro text and the form do not align on a shared left edge (seen at desktop width).

Components: filled orange pill CTA (14 px, white text), plain text link CTA, dark feature card, bordered card, the Valuate mock.

# 7. Motion and loading

Loading animation: none. There is no preloader, splash, spinner or skeleton. The page is server rendered and paints text fast. Observed at first paint: the hero text appears already fading in (about 20 to 30 percent opacity) and the header logo mark is absent, then both settle within about half a second. The logo mark is lazy loaded (`loading="lazy"` on the header and footer images), so on first paint the header shows the word "VEXA" with a blank gap and the mark pops in a moment later.

Animation:
* One reusable "Reveal" component (homepage only): content starts at opacity 0 and 12 px lower, then fades and slides up to place over 400 ms with an ease out curve, once, when 1 percent of it enters view. A 1.5 second fallback timer forces it visible. It respects prefers reduced motion. It wraps 5 blocks on the homepage, including the hero. Inner pages have no reveal at all.
* Because the server HTML ships those five blocks at opacity 0, a visitor or crawler that does not run JavaScript sees a blank looking hero until scripts run. Text is in the HTML for search engines, but a social preview or screenshot bot may capture an empty hero.
* Hover and focus: nav links go from muted grey to near black; the orange button darkens to `#c94a1c` and shrinks to 97 percent on press; inputs get an orange border and 2 px outline; a global focus ring of 2 px orange with 3 px offset. The mobile menu icon animates into an X in 250 ms. No CSS keyframes exist in the stylesheet at all.
* Libraries: none. No GSAP, Lottie, Lenis or locomotive scroll, Framer Motion, AOS, Three.js, Swiper. No smooth scroll. No parallax. No video. Custom timing tokens exist (150, 250, 400 ms; ease out and ease in out curves).
* Reduced motion: honoured in both CSS (transitions cut to 0.01 ms) and JS (reveal skipped).
* Net effect: calm, professional, and completely unlike the energy of gaming. It is safe. It gives the first impression no brand memory.

# 8. Mobile behaviour (inferred, not observed)

* Single column below 1024 px. Cards stack. The three card grid becomes a stack. Gutters 20 px.
* H1 drops to 36 px with line height 1.0. At about 20 words this is still a tall block on a 390 px screen (roughly 8 to 9 lines), pushing the first CTA below the first screen on many phones.
* The header shows only logo and hamburger. The "Book a call" pill is hidden until the menu is opened (it is inside the desktop nav that is hidden below 1024 px). Tablets in portrait also get the hamburger.
* The mobile menu is a full screen dialog with aria modal, Escape to close, and scroll lock. Focus is not moved into it or trapped by the code I read.
* The Valuate mock and its bar are full width; should work but was not seen.
* Tap targets: hamburger 40 by 40 px; nav and CTAs generally above 40 px high; footer links are small text links.
* Phone and email are real tel and mailto links, good for mobile.
* Form fields 14 px (iOS focus zoom risk).
Please test on a real phone: the hero length, the missing header CTA, form zoom, and tablet portrait.

# 9. Accessibility, speed, SEO

## Accessibility

Good:
* Skip to content link, lang="en", one H1 per page with a sensible H1 to H2 to H3 order, landmarks (header, nav with aria label, main, footer), visible focus ring, reduced motion support, decorative images marked alt empty, external link with rel noopener, mobile menu with aria expanded and aria controls.

Problems:
* Contrast (computed from the CSS tokens against the cream `#faf8f6`):
  * White text on the orange button `#e45824`: 3.67 to 1. Fails WCAG AA for normal text (needs 4.5). This is the main "Book a call" button in the header and on every page. On hover it becomes `#c94a1c`, which passes at 4.69.
  * Footer copyright and the small "HOW WE WORK" hero aside label in `#a79c90`: 2.54 to 1. Fails.
  * Eyebrow labels and active nav in `#c94a1c` at 12 px: 4.42 to 1. Just under 4.5 for small text.
  * Muted body `#6e645a`: 5.46 to 1 on cream, 5.01 on the grey card. Passes.
  * Dark card text and the orange number on the dark card: pass (5.12 and above).
* The Valuate mock is wrapped in one link whose accessible name is the whole mock's text read out as a paragraph, and the link is a picture of a tool, not a tool.
* Form: no required marking, no aria linking of error text to fields, errors appear only after submit, no live announcement for field level errors.
* "Open the tool" and "Open Valuate" open a new tab with no warning.
* Hero reveal blanking without JavaScript (see section 7).
* Header logo mark has alt empty next to the visible word, which is acceptable.

## Speed

* Server response 146 ms, DOM content loaded 254 ms, load 280 ms, first contentful paint 484 ms in my desktop session (indicative only).
* Homepage made 23 requests, all to vexadigital.in itself. Zero third party requests: no analytics, no tag manager, no chat, no embeds, no ad pixels, no fonts from Google.
* Heavy point: five TTF font files preloaded on every page, about 1.0 MB uncompressed in total. General Sans weights are about 65 KB each (three of them). The two Inter files are about 412 KB and 417 KB each, which points to unsubsetted fonts. Use woff2 and subset, and consider dropping a weight.
* JavaScript: about 340 KB uncompressed across the main chunks (React and Next runtime); CSS 22 KB; logo served resized through next/image.
* Cached aggressively at the edge (s-maxage of one year, cache HIT). No security headers seen in the response (no HSTS, CSP, X Frame Options or Referrer Policy), and x-powered-by: Next.js is exposed.

## SEO basics

* Titles: Home "VEXA Digital, Brand Partnerships for Gaming in India"; inner pages use "Page name · VEXA" (for example "Proof, What VEXA Has Actually Done · VEXA"). Lengths 19 to 52 characters, unique. Inconsistent pattern between home and inner pages.
* Meta descriptions: present and unique on every page (78 to 152 characters). About (95) and the legal pages (78 to 83) are short. Home is good at 135.
* Open Graph and Twitter tags: present but identical on every page (og:title is always the homepage title, og:url is always "https://vexadigital.in"). No og:image and no twitter image, twitter:card is "summary". A link shared to Proof or Contact will show the homepage title and no picture.
* Canonical tags: none on any page. Both https://www.vexadigital.in and https://vexadigital.in return the same 200 page (http redirects to https on each host, but neither host redirects to the other). The sitemap and og:url use the bare domain. This is a duplicate content setup that should be consolidated to one host with a canonical tag.
* Structured data: none (no Organization, WebSite, ProfessionalService, Person, or FAQ schema).
* Sitemap: 9 URLs, valid, all with the same lastmod (2026 09 22, build time). robots.txt allows everything and points to the sitemap.
* Headings: one H1 per page, logical. Home H1 is a two sentence pitch, not a keyword phrase.
* Content depth: 165 to 516 words per marketing page, no blog or insight pages, no pages aimed at search terms a buyer would type (esports sponsorship India, gaming influencer campaigns, brand partnerships for esports teams). No image alt text opportunities because there are no images.
* Favicon set OK; no apple touch icon; no manifest; default 404 page.

# 10. Legal and trust pages

Status against your checklist:
* Privacy Policy: exists (/legal/privacy, effective 23 September 2026).
* Terms and Conditions: exists as "Terms of Use" (/legal/terms, effective 23 September 2026).
* Refund or Cancellation policy: missing.
* Disclaimer: no standalone page. A short "No professional advice" clause sits in the Terms.
* Cookie notice or banner: missing (no cookies or trackers observed, see below).
* Grievance Officer disclosure: exists (/legal/grievance-officer).
* Contact page: exists (/contact).
The three legal pages are linked in the footer of every page. The Grievance Officer link is in the footer only.

## What each existing page says

Privacy Policy (10 sections): who we are ("a gaming and esports brand campaign business operating in India"); what we collect (name, email, phone, company, message, through the form and direct contact; no payment or government IDs); why (respond, assess partnership, schedule calls; no unrelated marketing without consent; no sale of data); how long ("as long as needed", plus a right to ask for earlier deletion by email); sharing (service providers such as email, hosting, scheduling, under confidentiality; legal disclosure); cookies and analytics ("may use" essential cookies and standard analytics); security (cites the IT Act 2000 and the 2011 SPDI Rules); rights as a data principal (access, correction, erasure, withdraw consent, nominate) under the DPDP Act 2023; grievance (generic mailbox, points to the officer page); changes.
Assessment: a sensible, honest first version, better than most small agency sites. It names the right statutes and rights.

Terms of Use (9 sections): what the site is (informational and lead generation, no user accounts); acceptable use; intellectual property in the VEXA name, logo, design and content; no professional advice; third party links; limitation of liability ("as is", excludes what cannot lawfully be excluded); governing law India with exclusive jurisdiction of Delhi courts; changes; contact.
Assessment: adequate for a brochure site. It does not cover services or Valuate.

Grievance Officer page: names Kaustubh Srivastava, Founder, VEXA Digital, with email and the 77A, LGF address. States that complaints are acknowledged within 24 hours and resolved within 15 days, citing the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021 and the DPDP Act 2023.
Assessment: matches your known fact and is good practice. It is the strongest trust page on the site.

## Gaps, and what each page should contain

Legal entity and business identity (site wide, missing):
* Full legal name of the entity that contracts and holds data (Blue Wings Esports if that is the entity, with "trading as VEXA"), legal form (proprietorship, LLP or company), registered office, GSTIN, PAN or Udyam or LLPIN or CIN as applicable. Companies registered under the Companies Act 2013 must show name, registered office, CIN and contact details on business publications; procurement teams at brands ask for GSTIN and PAN at vendor onboarding whatever the structure. Today "VEXA Digital" is used in the copyright line and all legal documents, and Blue Wings is never mentioned. The legal documents therefore do not identify who the data fiduciary actually is. Confirm what "VEXA Digital" is legally, and make every page consistent.
* The word "Digital" in "VEXA Digital" and the domain vexadigital.in is not explained anywhere, while the brand everywhere else is VEXA.

Privacy Policy gaps (Digital Personal Data Protection Act 2023 and the DPDP Rules 2025, notified 13 November 2025). Timeline as I found it: Rules on definitions and the Data Protection Board are in force; consent manager rules start 13 November 2026; the main duties (notice, consent, security, breach intimation, children, data principal rights) start 13 May 2027. A reported January 2026 proposal to shorten this was not confirmed as an amendment. You have about eight months, so build to that now.
* Notice at the point of collection: the contact form has no line and no link to the policy next to Send, and no tick box. The notice should list the exact data collected (including the optional "how did you hear"), the specific purpose, a working link to withdraw consent and to exercise rights, and how to complain to the Data Protection Board. Rule 3 of the DPDP Rules describes a standalone, plain language, itemised notice. A contact form enquiry can also rest on the Act's "voluntarily provided for a specified purpose" ground, but the notice is still the safe route.
* Lawful basis: the policy talks about consent but does not say whether an enquiry is processed on consent or on voluntary provision for a specified purpose. State it.
* Accuracy: the policy says the site "may use" analytics and cookies. The homepage makes zero third party requests and I saw no analytics code. Either say plainly that the site sets no non essential cookies, or add analytics with a cookie notice and consent. As written the policy describes a site you do not run.
* Server logs and device data: not mentioned (IP address, browser, pages). The DPDP Rules expect logs to be kept for a year for security.
* Retention: replace "as long as needed" with actual periods (for example, unconverted enquiries kept 24 months from last contact, client records for the length of the contract plus statutory periods) and the deletion process.
* Processors and location: name the categories and, ideally, the names and countries of hosting, email and form handling providers, and state that data may be stored outside India if so. The Act permits transfer except to countries the government restricts.
* Data breach: no statement. The Act requires informing the Board and affected people.
* Children: no statement. The site is B2B, but the campaign business targets 16 to 28. Under the Act anyone under 18 is a child: verifiable parental consent, and no tracking, behavioural monitoring or targeted advertising directed at children. A brand legal team will ask how VEXA handles 16 and 17 year olds in a campaign. Add a short statement that this site is not for under 18s, and put the rule into the campaign method on How We Work.
* Grievance and escalation: the policy gives the generic mailbox rather than the named officer, and does not mention the right to approach the Data Protection Board after the grievance route. The DPDP Rules set a maximum of 90 days for grievance response; the officer page promises 15, which is stricter and fine.
* A named contact who can answer privacy questions (the Rules ask for a published contact for this). partnerships@ is the sales inbox. Consider a separate privacy@ address.
* Version history and a plain summary at the top would help, but are optional.

Terms of Use gaps:
* No terms for services. That is normal if engagements are by contract, but say so ("services are governed by a written agreement") and link to a short public summary of how an engagement starts, runs and ends.
* No Valuate terms. When the tool goes live it needs its own disclaimer: outputs are estimates, not advice or guarantees; what data and method produce the band ("a band from real views"); no liability for deals struck on it; what data the tool collects. The Terms currently say there are no user accounts, which will need review if Valuate ships.
* "Third party links" refers to "partner, media, or social platforms" but there are no such links on the site.
* Optional for B2B: a dispute clause (mediation or arbitration under the Arbitration and Conciliation Act 1996, seat Delhi) alongside the Delhi courts clause.

Refund or Cancellation policy (missing): not a legal requirement for a B2B services firm with no online sales. The Consumer Protection Act 2019 and the E Commerce Rules 2020 are aimed at consumer purchases and platforms, so they mostly do not bite here. But the site states commercial terms and then defers them to a call. What buyers and rights holders do need to see, on /how-we-work or a short "Engagement terms" page: what the fee covers, when the commission becomes payable ("when a partner actually closes" is undefined: signature, first invoice, cash received?), any tail period after you leave, cancellation or termination rights and notice, what happens to a pilot that misses benchmark (is the fee refundable, partly or not), payment schedule, GST on fees, confidentiality and non solicitation.

Disclaimer (no standalone): put in one place that results and KPIs are targets not guarantees; that Valuate is an estimate; that any future case study or testimonial is a specific result; that VEXA is not a law, tax or financial adviser (a law graduate founder makes this one worth saying explicitly).

Cookie notice: not needed today if no cookies or trackers are set (none observed). Needed the day analytics, a pixel, a chat widget or an embedded scheduler is added, with consent for non essential ones. Decide now, so the policy and the site agree.

Grievance Officer page gaps (small):
* It cites the IT Rules 2021 intermediary code. VEXA is probably not an intermediary for this site, so the citation is over inclusive though harmless. The SPDI Rules 2011 (rule 5(9)) are the more relevant hook: publish the officer's name and contact details and redress within one month. Consider citing both and keeping the shorter promise.
* Add: how to complain (subject line, what to include), an escalation line to the Data Protection Board of India, and a phone or office hours if you want it to feel real.
* Same mailbox is used for sales enquiries and grievances; separate it to avoid missing a complaint.

Contact page gaps: no consent line, no response time, no entity name or registered office, no hours, and "Book a call" leads to a form, so the label overpromises.

Sector specific legal points the site is silent on (flag, not required for a brochure site):
* Online gaming law: the Promotion and Regulation of Online Gaming Act 2025 bans online money games and their advertising and promotion, with penalties up to two years and a fine of up to 50 lakh rupees. The Online Gaming Rules 2026 came into force on 1 May 2026 (per the PIB note). Esports and online social games are recognised and can register. Rights holders and brands will want a plain statement that VEXA does not sell or run promotion for online money games.
* Influencer disclosure: the CCPA Guidelines for Prevention of Misleading Advertisements and Endorsements 2022 and ASCI influencer rules require clear disclosure of paid relationships. A creator facing business should say it builds disclosure into campaigns.
* Trademark: the site claims rights in the VEXA name. No TM or registration mark is shown; a class 35 and 41 filing and search is worth checking, and "VEXA" is a name others use.

Sources for the law points: dpdprules.org timeline page (DPDP Rules notified 13 November 2025, G.S.R. 846(E), phased commencement); PIB press release on the Promotion and Regulation of Online Gaming Rules 2026 (pib.gov.in, PRID 2256973). I am not giving legal advice, and you should verify the commencement dates against the Gazette before relying on them.

# 11. Written content diagnosis, section by section

Reader model: a busy brand marketing manager (or a founder or business head of a team, event or creator company) with 45 seconds, three tabs open, and a boss to answer to.
Site wide numbers: the marketing pages say "we, our, us, VEXA" roughly 24 times on the homepage against about 15 uses of "you, your". Proof is 18 to 2, About 9 to 1. The voice is confident and plain, with almost no filler, which is a strength. But it is written from VEXA's principles outward, and it never shows a picture of the reader's problem.

## Header and navigation
Does: seven items with one CTA.
Manager thinks: "Proof" and "How We Work" are what I want, fine. "Valuate" means nothing to me. The order (Home, How We Work, Proof, About, Valuate, Contact) is a company tour, not a buyer path.
Issues: "Valuate" is a brand word without a meaning; there is no "For brands" and "For rights holders" split even though the site has two audiences; Contact and Book a call go to the same place.

## Homepage hero
Does: states two jobs in one 20 word H1, then explains in the subhead.
Manager thinks: "We sell sponsorship for gaming and youth rights holders." So this is for someone who owns a team. Am I in the right place? Then "brands who want their audience". Whose audience? (Ambiguous "their": the rights holder's or the gamers'.) I do not know what "rights holder" means without thinking, and "youth" is a surprise in a gaming pitch.
Vague or jargon: "youth rights holders", "measured pilot campaigns", "want their audience". Self centred: opens with "We sell" and "We run". Unproven: the promise "KPI agreed before you spend" is credible, but nothing shows it has ever been done.
Strength: "Commission only when you close. KPI agreed before a brand spends." is the sharpest thing on the page. It is small, grey at the bottom right of the hero and sits in a low contrast label style. It deserves the headline slot.
Weakness for the brand buyer: the H1 leads with the sell side. The brand marketing manager is the person you most want and gets the second sentence.

## "Why gaming is hard to buy into"
Does: names the enemy, the reach number. "None of it says whether a KPI was met."
Manager thinks: yes, that is true. First real moment of resonance. Then: but you have no numbers yourself.
Issues: it is generic. No example, no rupee, no statistic, no story of a deal that went wrong. It makes a claim about "either side of a deal" without evidence.

## "What we actually do" (three cards)
Does: two service cards and a third card that is a principle, not a service ("One discipline, both ways").
Manager thinks: card 01 is not for me, card 02 is. Card 03 is a slogan. What do I get? What is a "pilot"? How big, how long, how much?
Issues: the label "Measured pilot campaigns" has no scope: no duration, budget range, example KPI (sign ups, installs, footfall, sales), platform or deliverable. "Fee plus commission, so we earn when you close." is a good line.

## "How we are paid, briefly"
Does: describes the models and defers the numbers to "the first real call".
Manager thinks: no number. Is it lakhs or crores? Will this be a waste of my time? The closing phrase "a number you can defend upward" speaks directly to how managers work and is the best copy on the page.
Issues: heavy, dense paragraph for a box called "briefly". No range. "Closes" is undefined. No clarification of who pays the commission (the brand, the rights holder, or out of the deal).

## Valuate promo
Does: offers a free tool, shows a dark app style card.
Manager thinks: I am a brand, this looks like it is for creators; "500 followers, 2,900 views" is a micro creator, not my world. The example is confusing: it says "Ask for ₹1,236" and "Offer ₹3,500" at once, and the marker sits in "Premium", so is the offer good or bad? The message the card should send (this offer is far above fair) is not obvious to a first reader.
Issues: "Open the tool" leads to a dead address. The tool is a picture. "a band from real views" claims data that is not sourced. The 500 follower example undercuts the premium brand deal audience.

## Closing CTA
Does: "Tell us what you are trying to do. We will tell you honestly whether gaming can do it, and how we will count it."
Manager thinks: this is the voice I want. It is direct and safe to answer, and it promises a possible "no", which is a trust move.
Issues: the button is the same "Book a call" that leads to a form, not a call. It carries no promise of reply time. Third repeat of the same CTA with no lighter alternative.

## How We Work
Does: a numbered path of eight steps as bare labels, then two ways of working, then sections on KPI setting, saying no, and off benchmark handling.
Manager thinks: the eight list items are jargon without meaning ("The commercial mechanism", "The activation itself", "Gaming relevance"). The last two sections are excellent and specific: "the day we know" and "two days to bring you a fix" are concrete and testable promises.
Issues: the intro claim "you compete on moments" is asserted, never explained or shown. "Cost last" is a bold idea with no explanation of why. The "no" examples ("We have told a brand...") imply past client work while the Proof page says there is no closed campaign, which a sceptical reader will notice. No sample KPI, no timeline, no deliverables list, no measurement tools named (how will you count?). The closing CTA, "See what a first call looks like", leads to a page that does not describe a call.

## Proof
Does: says plainly that there is no VEXA delivered work.
Manager thinks: respect for honesty, then rejection: "I cannot take a brand budget to my boss on the strength of this." The three cards are all "trust me later". The page never says what a risk free first step is.
Issues: unnamed pilot, unnamed vendor network, unnamed founder credits ("a major esports network", "a national energy drink activation"). The vendors are described as "vetted" but who vets them and how is not shown. For a rights holder audience the missing proof is different (which brands have you spoken to, which deals in progress?). There is no button, no next step, no offer like a paid discovery or small pilot on reduced terms. Honesty is the brand, but the page ends on "This is early, honestly." without turning it into an offer.

## About
Does: founder story and the name.
Manager thinks: a law graduate who played BGMI is an unusual and credible mix for reading deals. But: is this one person? Where is the face? "Who builds the work" (in the meta description) is never answered.
Issues: no photo or LinkedIn; no surname on the page; no team, no vendor names; "Why the name" gives the phrase "Very easy is never awesome." but the letters V E X A are not mapped, so readers cannot decode it; it also reads as a clever aside rather than a reason to hire. The name story is the most memorable copy on the site and it is buried on the third click.

## Valuate page
Does: repeats the mock and adds a two line reason.
Manager thinks: where do I type? Nothing works. Feels like an unfinished product, which weakens the credibility of a firm whose promise is measurement.
Issues: "Tell it the deal" instructs an action that is not possible; no method, no data source, no disclaimer, no example for a brand, no sample size, no update date. Button goes to a nonexistent hostname.

## Contact
Does: sets expectations ("No pitch on the first call", three to four days of understanding first) and offers a form.
Manager thinks: the promise is respectful and different. But "three to four days" before any proposal may feel slow when I have a campaign window. "Book a call" then a text form is a mismatch.
Issues: the first line says "first call" but the page has no way to book one; no response time; no privacy line; no "I am a brand or a rights holder" choice although the copy asks for it; "Work email" and "Company" as required fields will deter creators and small teams (a creator has no company).

## Legal pages
Do: clear, short, plain English. Better than boilerplate.
Issues: covered in section 10. Copy is fine; the substance gaps are entity identity, notice at collection, and mismatch between policy and site.

# 12. What is missing, ranked

Highest impact for winning business:
1. A named, checkable proof asset. Even one: a named pilot brand with permission, a named rights holder mandate, a written sample KPI sheet, or a paid discovery offer that removes risk. Right now the honest Proof page is a sales objection.
2. A working Valuate (or removal). The subdomain does not resolve, so two CTAs lead to an error page and the free tool is a screenshot.
3. A homepage headline written for the brand buyer first, or a clear two door split ("I sell sponsorship" and "I buy reach"). Put the strongest line ("Commission only when you close. KPI agreed before a brand spends.") in the hero.
4. Price signal: a starting fee, a commission range, or a band, plus a definition of "closes".
5. Visible people and presence: photo of Soda, LinkedIn, Instagram, YouTube or Discord links, vendor and creator names with permission.
6. A real booking step (calendar) or an honest label ("Send an enquiry") plus a stated reply time.
7. Explanations for the eight step method, one line each, and one worked example end to end (business problem to decision).
8. Any visual that says "gaming" and shows work: event photos, creator content, a dashboard shot of a KPI report.

Legal and trust must fix items:
1. Show the legal entity (Blue Wings Esports and VEXA trade name, legal form, GSTIN, registration) and use it consistently in the footer, Privacy, Terms and Contact.
2. Notice and consent line at the form, linking the Privacy Policy, ahead of the DPDP main duties on 13 May 2027.
3. Make the Privacy Policy match the site (analytics and cookies statements), add retention periods, processors and location, breach, children, escalation to the Board, and a privacy contact.
4. Add a short engagement terms or cancellation section, and a Valuate disclaimer.
5. Add a statement on online money games and influencer disclosure.

Technical and SEO must fix items:
1. Consolidate www and bare domain (redirect plus canonical tags); fix og:url and add per page OG titles, an og:image, and twitter:card summary_large_image.
2. Add Organization and Person schema.
3. Fix the 3.67 to 1 white on orange button contrast and the 2.54 to 1 grey labels.
4. Load the logo eagerly (priority) to remove the pop in; subset fonts and use woff2.
5. Add analytics (privacy respecting, with a decision on consent) so the site can be measured; today nothing is measured.
6. Test the contact form end to end, add spam protection, and add a confirmation email.
7. Add a persistent mobile CTA in the header or a sticky bar; enlarge form fields to 16 px.
8. Add the missing SEO pages (services by audience, a Valuate explainer, an insights page).

# 13. Quick reference: facts and their sources on the site

* Tagline: "Brand partnerships for gaming" (hero eyebrow).
* Audience age band: 16 to 28.
* Fee models: rights holder, fee plus commission on close; brand, one agreed fee.
* Commitments: KPI before spend; report against it; say when gaming is wrong; day of knowledge and two day fix if off benchmark; three to four days discovery before a proposal; grievance acknowledged in 24 hours and resolved in 15 days.
* Proof: none delivered under VEXA; one pilot in early discovery with an unnamed gaming hardware brand.
* Founder: Kaustubh (Soda) Srivastava, law graduate, three years competitive BGMI.
* Contact: +91 9958895505, partnerships@vexadigital.in, 77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070.
* Legal pages: /legal/privacy, /legal/terms, /legal/grievance-officer (all effective 23 September 2026 where dated).
* Broken: https://valuate.vexadigital.in (no DNS record).
* Missing entirely: Blue Wings Esports, GSTIN and legal identity, case studies, logos, testimonials, social links, pricing range, cookie notice, refund or cancellation or engagement terms, standalone disclaimer, structured data, OG image, canonical tags.
