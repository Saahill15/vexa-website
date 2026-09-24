# VEXA website copy, rewritten in Soda's voice

Update, 24 September 2026, branch claude/copy-rewrite: the live pages now carry the
approved for preview copy rewrite (59 segments, NAV-01 to FOOTER-01) from the copy review
page. The page files under app/ and components/ are the source for current wording. The
text below records the 23 September pass and is kept for history.

Date: 23 September 2026. Applied to vexa-website and mirrored to vexa-website-v2.
Positioning locked for this pass: VEXA does two things. (1) Sponsorship and brand
partnership sales for gaming and youth rights holders, teams, events, creators, films,
fee plus commission, paid when the partner closes. (2) Measured pilot campaigns for
brands reaching gamers aged 16 to 28, with the KPI agreed before spend. Every page
ends on one clear next step: the contact form or partnerships@vexadigital.in.

Rules followed: clean English, no dashes as punctuation, no Advocates Act or enrolment
copy, no invented clients, numbers or testimonials, TP-Link not named, no tool or
method names revealed, KPI and benchmark language instead of pass or fail.

---

## Site metadata (app/layout.tsx, app/page.tsx)

BEFORE (description, used in metadata, openGraph and twitter blocks):
"VEXA Digital finds a brand's way into gaming, teams, creators, tournaments or
communities, and runs the partnership to a target agreed before any money moves."

AFTER:
"VEXA sells sponsorship for gaming and youth rights holders, and runs measured pilot
campaigns for brands reaching gamers aged 16 to 28."

---

## Home page

### Hero (components/home/Hero.tsx)

BEFORE (h1):
"Brands come to us to reach gamers. We find the right way in, and we run it to a
number you agreed before we started."

AFTER (h1):
"We sell sponsorship for gaming and youth rights holders. We run measured pilot
campaigns for brands who want their audience."

BEFORE (subtext):
"VEXA Digital is a brand partnerships company for gaming. Teams, creators,
tournaments, or communities, we design the campaign, pick the right partner, and
report against a target set before launch."

AFTER (subtext):
"If you run a team, an event, a creator business or a film, we sell your sponsorship
and take a fee plus a commission when a partner closes. If you are a brand chasing
gamers aged 16 to 28, we build a pilot with the KPI agreed before you spend."

BEFORE (aside):
"Target first. Cost last. Report against a number agreed before launch."

AFTER (aside):
"Commission only when you close. KPI agreed before a brand spends."

v2 only, bullet row under the buttons:
BEFORE: "Target agreed before launch" / "Cost opened, not defended" / "No vanity metrics"
AFTER: "Commission only when you close" / "KPI agreed before spend" / "No vanity metrics"

### WhyHard.tsx

BEFORE:
"Gaming looks big, confusing, and full of reach numbers that mean little on their own.
Most pitches you have seen lead with views, a community size, or massive reach. None
of that tells you what you actually bought, or whether it worked."

AFTER:
"Gaming looks big and confusing from outside, and most of what gets pitched, on
either side of a deal, leads with a reach number. Views, community size, follower
count. None of it says whether a KPI was met, or what a sponsorship was actually
worth."

### WhatWeDo.tsx (three blocks)

BEFORE:
01 "The business problem" / "We start from the brand's real business problem, not
from a gaming trend."
02 "Whether gaming belongs" / "We work out honestly whether gaming can move that
problem, and how."
03 "Run to a target" / "If it can, we design the campaign, choose the right partner,
whether that is a team, a creator, a tournament, or a community, and run the whole
thing to a target set jointly before launch. If gaming is not the right spend right
now, we say so."

AFTER:
01 "Sponsorship and brand partnership sales" / "For esports teams, events, creators
and films, we sell the sponsorship and brand partnerships. Fee plus commission, so we
earn when you close."
02 "Measured pilot campaigns" / "For brands reaching gamers aged 16 to 28, we build a
pilot with the KPI, the benchmark and the success criteria written down before you
spend."
03 "One discipline, both ways" / "Either way, the numbers get agreed before the work
starts, and we report against them when it ends. If gaming is not the right move for
you right now, we say so."

### HowPaid.tsx

BEFORE (single paragraph):
"Our fee covers strategy, campaign design, choosing partners, coordinating everyone
involved, and reporting on results. It stays the same whether you bring your own
creators or agency into the work or not. We open the full cost breakdown on the first
real call, line by line, because a number you can see built is a number you can
actually defend upward."

AFTER (two paragraphs):
"For a rights holder, a team, an event, a creator or a film, we work on a fee plus a
commission, and the commission only lands when your partner actually closes."
"For a brand, our fee covers strategy, campaign design, choosing partners and
reporting, agreed as one number before we start. Either way, we open the full
breakdown on the first real call, line by line, because a number you can see built is
a number you can defend upward."

### ClosingCta.tsx

BEFORE:
"Tell us the business problem. We will tell you honestly whether gaming is the
answer."

AFTER:
"Tell us what you are trying to do. We will tell you honestly whether gaming can do
it, and how we will count it."

---

## About page (app/about/page.tsx)

BEFORE (PageIntro body):
"VEXA is a brand partnerships company for gaming, founded and run by Kaustubh, who
goes by Soda."

AFTER:
"VEXA sells sponsorship for gaming and youth rights holders, and runs measured
campaigns for brands who want their audience. It is founded and run by Kaustubh, who
goes by Soda."

BEFORE ("Who is behind VEXA"):
"VEXA is founded and run by Kaustubh, who goes by Soda. He is a law graduate, and he
played competitive BGMI for three years, leading a team as an in game leader, a role
built on strategy and calling shots rather than raw mechanical skill. He brings both
instincts to VEXA: the habit of reading the actual rule as written and pricing what a
claim can survive, and a player's instinct for what a gaming audience actually
responds to."

AFTER:
"VEXA is founded and run by Kaustubh, who goes by Soda. He is a law graduate, and he
played competitive BGMI for three years, leading a team as an in game leader, a role
built on strategy and calling shots rather than raw mechanical skill. He brings both
instincts to VEXA: the discipline of reading a deal exactly as written before pricing
it, and a player's instinct for what a gaming audience actually responds to."

BEFORE ("Why the name"):
"Very easy is never awesome. That is the idea behind the name, and it is the standard
the business is actually held to: gaming sponsorship looks easy from outside, a logo
on a jersey, a shoutout in a stream, and most of what gets sold under that idea is
exactly that easy and exactly that forgettable. VEXA exists for the harder, better
version: a partnership designed around a real business problem, run to a number
agreed in advance."

AFTER:
"Very easy is never awesome. That is the idea behind the name, and it is the standard
the business is actually held to. Sponsorship in gaming looks easy from outside, a
logo on a jersey, a shoutout in a stream, and most of what gets sold under that idea
is exactly that easy and exactly that forgettable. VEXA exists for the harder, better
version: a sponsorship or a campaign designed around a real number, agreed before
anyone spends."

BEFORE (closing CTA): ButtonLink href="/how-we-work" "Read how we actually work"
AFTER (closing CTA): ButtonLink href="/contact" "Talk to us about your deal"

---

## How We Work page (app/how-we-work/page.tsx)

New section added right after the intro, before "The order we work in":

"Two ways we work"
"If you run a gaming or youth rights holder, a team, an event, a creator business or
a film, we sell your sponsorship and brand partnerships. We work on a fee plus a
commission, and the commission only lands when a partner actually closes."
"If you are a brand trying to reach gamers aged 16 to 28, we build a measured pilot
campaign. The KPI, the benchmark and the success criteria are agreed before you spend
anything."

BEFORE ("How a target gets set"):
"We do not wait for you to hand us a number. If you have a target, we test our plan
against it. If you do not, we tell you what we believe the minimum target should be
to hit the outcome you want, and we size the distribution spend to make that target
realistically reachable. Either way, a pass and fail mark exists before launch,
agreed jointly, so nothing gets judged later against a figure nobody agreed to."

AFTER, renamed "How the KPI gets set":
"We do not wait for you to hand us a number. If you already have a KPI, we test our
plan against it. If you do not, we tell you what benchmark we believe gets you the
outcome you want, and we size the spend to make it realistically reachable. Either
way, the success criteria exist before launch, agreed jointly, so nothing gets judged
later against a number nobody agreed to."

BEFORE ("What we will tell you no on"):
"We have told a brand their product was not ready to compete in the segment they
wanted and belonged somewhere else in the market instead. We have told a partner that
brands sponsor what already exists, not what is still being built. We would rather
lose a sale than sell you something we cannot defend later."

AFTER (unchanged in substance, "partner" tightened to "rights holder"):
"We have told a brand their product was not ready to compete in the segment they
wanted, and belonged somewhere else in the market instead. We have told a rights
holder that brands sponsor what already exists, not what is still being built. We
would rather lose the deal than sell you something we cannot defend later."

BEFORE ("What happens if a campaign is heading to miss its mark"):
"If we see a campaign is tracking to miss its pass mark, we tell you the day we know
it, recommend against going the full distance, and take two days to bring you a way
to fix it."

AFTER, renamed "What happens if a campaign is off benchmark":
"If we see a campaign tracking below the KPI we agreed, we tell you the day we know
it, recommend against pushing further spend, and take two days to bring you a fix."

---

## Proof page (app/proof/page.tsx)

BEFORE ("Live work being built"):
"The TP Link Skill Issue Test is a campaign currently in progress, built to end an
argument gamers already have with real data: ping, jitter, and packet loss shown on
screen instead of argued about."

AFTER (client not named, mechanism not detailed):
"We are in early discovery on a pilot with a gaming hardware brand. It is built to
settle an argument gamers already have with a number instead of an opinion. It is not
finished, so we are not naming it yet."

BEFORE ("What our vendor network has delivered"):
"We work through a network of gaming teams, creators, and organisers we have already
vetted. Proof, for now, runs through that network's collective track record rather
than a VEXA branded case study, and we will always tell you plainly which is which."

AFTER:
"We work through gaming teams, creators and organisers we already know and have
vetted. For now, proof sits with their track record, not a campaign VEXA has run and
reported on alone. We will always tell you which is which."

Founder record section: kept as is, facts already accurate and undisputed.

---

## Contact page (app/contact/page.tsx)

BEFORE (PageIntro, one paragraph):
"No pitch on the first call. We spend three to four days understanding your business
before we propose anything, because a proposal written faster than that is a
template, and it reads like one."

AFTER (second paragraph added):
"No pitch on the first call. We spend three to four days understanding your business
before we propose anything, because a proposal written faster than that is a
template, and it reads like one."
"Tell us if you run a gaming or youth rights holder looking to sell sponsorship, or a
brand looking to reach gamers. We work both sides, and we will tell you which one
you are."

---

## Footer (components/Footer.tsx)

BEFORE:
"Brand partnerships for gaming in India. Teams, creators, tournaments, communities."

AFTER:
"Sponsorship sales for gaming and youth rights holders. Measured pilot campaigns for
brands reaching gamers 16 to 28."

---

## Valuate page and ValuateStrip

Left unchanged. Valuate is a separate, already accurate free tool; its copy already
meets the clean English and no dashes standard, and it is not part of this
repositioning pass.

## Legal pages

Left unchanged, as instructed.
