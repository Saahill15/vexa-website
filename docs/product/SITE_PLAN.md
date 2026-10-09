# VEXA website: pages and visitor journeys

Updated 09 October 2026 from Soda’s direct rejection of the first-visit layout and novice product journey. D156 authorises the named live releases. The existing free reader-account and privacy requirements remain. The 08 October review is preserved below as historical evidence, not acceptance of the rejected layout.

## Purpose

VEXA develops brand partnerships in gaming and helps esports businesses prepare work a partner can buy. The website must explain both audiences in everyday language, introduce the people, make Valuate visible as the flagship product, and give interested readers a substantial publication worth joining.

A first visit should answer: who are these people, what can they do for me, what can I inspect, and how do I take the next step? Internal sales methods and decision codes do not belong in the public explanation.

## Navigation

Order: Services; Articles; About; Valuate; Contact. Account access is a smaller utility. Services opens clear brand-campaign and esports-advisory destinations, plus its overview. Their links lead to actual sections or pages, including useful overview links. Mobile uses the same grouping, with a keyboard accessible drawer. Existing routes remain stable.

| Destination | Reader’s question | Page sequence | Useful action |
| --- | --- | --- | --- |
| / | What is VEXA, and where should I start? | One clear company introduction with the existing gaming artwork; primary services action; two useful destinations, Articles and Valuate | Explore the appropriate audience page or product |
| /about | Who will I work with, and why this business? | Team introduction; precise founder experience; named people and responsibilities supported by records; reason for VEXA | Discuss a project |
| /brands | How would you help my brand work in gaming? | Brand problem and audience first; discovery, campaign proposal and coordinated delivery; relevant format examples and specific outputs | Start a brand enquiry |
| /organisations | How can my team or event prepare for partnerships? | Explain the commercial problem; distinct team and organiser situations; audience and content work; a deliverable commercial offer | Start an esports enquiry |
| /valuate | What does Valuate help me decide? | Stable redirect to the product landing page, avoiding a duplicate introduction | Understand the tool and try a fictional example or build a quote |
| /learn | What can I learn here? | Ordinary Articles heading; searchable/filterable list; consistent title, summary, author, date and reading time for each item | Start reading an article |
| /learn/[slug] | What am I missing, and how do I correct it? | Specific question; useful public introduction; clear free registration checkpoint; full researched explanation; sources; discussion; next relevant article | Sign in, finish reading and join the discussion |
| /contact | How do I explain my situation without filling a long form? | Choose reason; describe work; provide reply details, review and consent; accurate confirmation | Submit a short enquiry, with an email alternative |
| /account | How do I join or return to reading? | Email/password or configured Google; simple profile; return to the article’s continuation | Read and comment through a real account |
| /members/[id] | Who wrote this comment? | Chosen public name, self-described role and only explicitly shared workplace details | Understand the contributor without exposing email |
| /account/moderation | Which comments can be published? | Protected review queue for an explicitly authorised moderator | Approve or reject submitted comments |
| /legal/* | How are my details handled? | Accurate account, profile, comment and enquiry disclosures; business email | Read policies or contact the business |

Existing programme and room routes remain outside the main navigation. They must not imply an announced launch or paid offer. Public content must contain no personal phone number or personal Instagram link, including metadata and structured data.

## Main visitor journeys

**Brand:** home → Services → Brand campaigns → problem, audience and campaign-development explanation → contact with brand context already selected → a short enquiry saved with an honest next step.

**Esports owner or organiser:** home Services or relevant article → Esports advisory → appropriate team/event explanation → contact with esports context selected. Scope describes what VEXA can do, without a sponsorship guarantee.

**Reader:** social link or article index → roughly 300 to 500 words of useful context → free account checkpoint → email registration or configured Google → name and self-described role → return to the same article at the continuation → full explanation and sources → comment or another article. Registration is not newsletter consent. Closing the popup leaves the introduction readable and a clear continuation button available.

**Returning reader:** sign in → previously saved profile → article continuation. A signed-out request receives only the introduction; the full content must not sit hidden in the HTML or client payload. A historic lead cookie never counts as authentication.

**Creator using Valuate:** home or Valuate navigation → product landing: what, who, three steps and required inputs → public fictional example or free account → content, usual views/costs and brand requests → review provisional price, included work and open terms → edit, save or print. No export is required to start. Optional source connections and fee detail are secondary. A fictional example must stay labelled when printed/copied. Do not invent a fair-price benchmark or claim planned paid features are available.

## Article and community contract

The article is the deliverable. Remove the inventory input boxes and text-file worksheet downloads. Keep helpful worked examples as prose, comparison or illustration within the argument. Research each of the three current pieces individually. Link primary sources for platform definitions, public partnership examples and revenue models. Mark fictional numbers and distinguish original teaching from other organisations’ published facts.

Full articles are free with an account. Ask name and role after registration; job, industry and organisation are optional context. Email remains private. Explain what will be public before the reader saves their profile or comment. Comments attach to persistent reader identities, accept plain text, and enter a moderation queue. Readers can see, edit and remove their own pending comments. Approved comments show author profile links. No fabricated discussion or sample community counts.

Selected community authors are a future editorial role. Ordinary registration must not grant writing or publishing rights. An approved contributor flow requires a separate editorial commission and review; it is not claimed complete by adding a role field.

## Visual and motion contract

One expansive original gaming scene belongs to the page rather than an isolated image card. Its orange path, tactile objects and cream ground inform the surrounding composition. The first entrance can reveal the scene and heading; it must never impose a fake loading delay. Vary section scale and composition according to meaning. Avoid repeated boxed text, identical ruled rows and gratuitous decorative badges.

Interactive components change something useful: partner type changes a campaign explanation; product scope changes the demonstration; categories change the article list; contact progress changes the current question. Hover, focus, selected and success states must be visible. Motion uses transforms and opacity, with a short duration and a settled final state. Reduced-motion preferences stop nonessential transforms. Reading content and essential navigation remain available without JavaScript.

## Account and data dependencies

Use existing NextAuth and SQLite with additive account, session, profile and comment records. Passwords require a strong one-way hash; sessions require a configured secret, expiration and revocation. Mutations require same-origin checks, authentication and ownership as appropriate, validated lengths and rate limits. Google is enabled only with complete real client configuration. An unconfigured provider must not pretend to work or link accounts merely because their email strings match.

Local preview uses loopback, a separate database and no outbound contact webhook. A process-only preview secret is acceptable for testing; a production secret belongs in approved secure configuration. No real credentials belong in source, logs or this document. Google callback, email verification/recovery delivery, moderator provisioning, current legal review and public release must each be verified before calling the account system production ready.

## Acceptance evidence

The lead inspects the actual homepage and every principal page at desktop and phone widths. Check navigation grouping, anchors, back paths, focus, popup dismissal, reduced motion, content without JavaScript, legibility and full-page pacing. Check account registration, wrong password, onboarding return, sign out, unauthenticated content withholding, private profile fields, comment ownership and moderation. Submit invalid and valid local enquiries and inspect their saved records. Build/lint/types and bounded behavior tests complement these journeys; they do not prove design acceptance or market demand.

Current named public release and corrections are authorised by D156 and the 09 October direct correction. Reconcile the intended source delta with the live server, prepare source/database backups and image rollback, then verify the real domain. Other publishing, cold outreach and commercial commitments retain their own authority.


## Historical review status, 08 October 2026

The mapped journeys have been implemented locally. Browser checks cover desktop and phone navigation, the complete reader-account flow, a pending comment and public profile, search/filtering and the enquiry flow. The exact evidence and remaining release dependencies are in DESIGN.md. No public deployment or real Google sign-in is claimed.

## Acceptance checkpoint from the 09 October correction

Technical replay must cover homepage, service choice, mobile menu, article list/search/reader checkpoint and one creator quote with missing-input recovery. Preserve existing authenticated APIs, expiry recovery, ownership checks and saved drafts. Ask unassisted readers to identify who VEXA helps, what it does and how to use Valuate. Record the step where they hesitate. Their comprehension and the pricing model's real-world usefulness cannot be established by a build or AI review.
