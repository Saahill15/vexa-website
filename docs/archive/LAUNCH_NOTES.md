# Launch notes

Branch `claude/copy-rewrite`, 24 September 2026. Every visible "[Soda to confirm: ...]" and "[For counsel to confirm: ...]" placeholder was removed for launch. No number, client, price, date or testimonial was invented. Each removal is listed below with what Soda can add later. Entity, GSTIN, Udyam and every `data-counsel` and `data-segment` attribute are kept.

## Placeholders removed (61 bracketed placeholders: 59 "Soda to confirm" and 2 "For counsel to confirm")

| Segment | What was removed | What Soda can add later |
| --- | --- | --- |
| HOME-01/02 | "We reply within [reply time]" | Reply time in working days (add to the hero, closing, form success line) |
| HOME-04 | "[one real scene from a deal]" paragraph | One anonymised deal scene |
| HOME-04 | "India has 555 million gamers, according to Lumikai [report title and year]" | Restore the figure once the report title and year are confirmed |
| HOME-05 | Pilot length and starting fee ("Pilots run [..] and start from [..]") | Typical pilot length and starting fee |
| HOME-05 | Fee amount and commission range for teams and creators | Fee and commission range |
| HOME-06 | Brand starting band, payment schedule | Set `COSTS_CONFIRMED` and the `from` figures in `lib/costs.ts`; a "From ₹" line then renders |
| HOME-06 | Team fee, commission range, who pays, what "close" means | Same as above, plus the close definition |
| HOME-07, VAL-01 | "[Valuate is free, and these are its inputs and outputs at launch]" | Confirmation (the copy already states both) |
| HOME-09, HOW-07, PROOF-05, ABOUT-04, CONTACT-01, CONTACT-02 | Reply time | Reply time |
| HOW-02 | Timing for Brief, Partners and price, Negotiation | Typical time for each step (`lib/process.ts`) |
| HOW-02 | "[For counsel to confirm: who signs for Blue Wings]" and "[the payment schedule]" | Signatory (counsel) and payment schedule |
| HOW-02 | Update format and frequency in "Campaign and report" (sentence rewritten to the final report) | How often updates are sent, and in what form |
| HOW-03 | What campaigns do today about age gates, giveaways, sign ups and targeting | That paragraph |
| HOW-05 | "[these were discovery conversations]" (the copy already says so) | Nothing needed |
| PROOF-02 | Next step and date; "Last updated" date | Next step, date, and a monthly last updated line (use the ledger `meta` field in `lib/proof.tsx`) |
| PROOF-03 | Three partner names or how partners are checked | Permitted partner names |
| PROOF-04 | Years and nameable brands for both founder items | Years and names, if permitted |
| PROOF-05 | Pilot size and starting price | Pilot size and price |
| ABOUT-02 | Photo, full name use, profile link; dated timeline; Pratham's role, background and photo | Portrait (4:5), LinkedIn link, timeline, Pratham's line |
| ABOUT-03 | How V, E, X and A map to the words | The mapping |
| VAL-03 | Data source, sample size and update date | Those facts |
| VAL-04 | Launch date | Set `VALUATE_LIVE` and `VALUATE_URL` in `app/valuate/page.tsx`; until then the page shows "Opening soon" |
| CONTACT-01 | Whether a fast track exists | The fast track, if any |
| CONTACT-02 | Budget bands label | Set `budgetBands` in `lib/costs.ts` with `COSTS_CONFIRMED`; the field then appears |
| CONTACT-03 | Hours when calls are answered | Call hours |
| FOOTER-01 | Social profiles | Profile links |
| GRIEV-02 | Separate grievance mailbox; phone hours | Mailbox and hours (counsel) |
| TERMS-06 | Which outside links exist | The list |
| TERMS-09, PRIV-11 | Change log line "[date of this revision]. Rewritten in plain English..." | Add the line back with the publication date |
| PRIV-03 | What the host logs, and for how long | Log detail |
| PRIV-05 | Retention periods (three bullets) replaced by one counsel flagged point: kept only as long as needed or as the law requires; deletion confirmation days replaced by "We confirm by email" | Periods and days (counsel) |
| PRIV-06 | Provider names and countries; whether data is stored outside India | Providers and storage locations (counsel) |
| PRIV-07 | "[still true at publication]" (true: the site sets no cookies; the audience choice is kept in localStorage, not a cookie) | Nothing, unless analytics are added |
| PRIV-08 | Main security measures | The measures |
| PRIV-09 | Reply time for rights requests | Days (counsel) |
| PRIV-10 | Separate privacy mailbox | Mailbox |

Other launch decisions:

* The reply promise now reads "Soda reads every brief himself and replies by email." Add the reply time when confirmed.
* The Valuate sample card (`ValuateSample.tsx`) was deleted: it showed illustrative figures that are not confirmed.
* The founder portrait slot is not rendered until a real photo exists, to avoid a visible "to come" box.
* Legal pages carry the note "Drafted as points for counsel to confirm." Remove it from `components/LegalLayout.tsx` when counsel signs off.

## Contact form delivery

`POST /api/contact` validates the brief and appends it to `data/contact-submissions.jsonl`. In the container that is `/app/data`, the `site_data` volume in `docker-compose.site.yml`, so it survives rebuilds. Read it with `docker exec vexa-site cat /app/data/contact-submissions.jsonl`.

No environment variable is required. Nobody is notified by default. Optional:

| Variable | Purpose |
| --- | --- |
| `CONTACT_WEBHOOK_URL` | If set, each saved brief is also POSTed as JSON to this URL (for example an n8n webhook that emails partnerships@vexadigital.in). A failed webhook never fails the visitor. |
| `CONTACT_WEBHOOK_TOKEN` | Optional bearer token sent with the webhook. |

Add them under `environment:` for the `site` service. Target: a test brief reaches the inbox within one minute. Check: submit the form once after deploy and confirm the email arrives.

## Security

`next` upgraded from 14.2.18 to 14.2.35 (latest 14.2.x). `npm audit` still reports 5 findings (1 critical, 4 high) that only a major upgrade (Next 15 or 16) fixes: advisories in `next` itself, its bundled `postcss`, and `glob` via `eslint-config-next` (dev only). Mitigations in place: the image optimiser is off (`images.unoptimized`), which removes the AVIF remote code execution and image DoS advisories' surface; the server runs on Linux (the other critical is Windows only); the site has no middleware, rewrites or Server Actions. Plan a Next 15 upgrade as a separate task.
