# VEXA buyer signals: what the people who pay for gaming and esports sponsorship search for, ask and fear

Compiled: 24 September 2026. Scope: buyer behaviour only. VEXA's own site and competitors are covered in other files.
Who "buyers" means here, because VEXA has two sides:
* Brand side: marketers, agencies and founders who want to reach gamers and ask what it costs and whether it works.
* Rights holder side: esports teams, tournament organisers, creators and players who need sponsors and ask how to get and keep them.
Every quote is under 20 words and is attributed by evidence ID and URL. Quotes are copied as written by the poster, including spelling. Nothing here is a claim about VEXA itself.

# 0. Access log: what worked, what failed

Order of attempts followed the brief.

| Step | Route | Result |
|---|---|---|
| 1 | WebSearch with site:reddit.com | Failed. Returned no Reddit pages, only unrelated sites. |
| 2 | Apify Reddit scraper (harshmaur/reddit-scraper) | Worked. About 670 posts from search terms and community searches, plus comment crawls on chosen threads. About 3.5 to 4 USD of the 5 USD budget used. Some runs were cut by the per run cost cap, so results are partial. |
| 3 | agent reach skill | Gave install steps only. Cloned it. Its Jina Reader route worked for public LinkedIn posts, returned gated content for Quora, and failed for Reddit (403) and YouTube (401). |
| 4 | old.reddit.com and www.reddit.com .json via WebFetch | Blocked (SITE_BLOCKED). |
| 5 | Claude in Chrome | Not attempted for buyer research. Deferred because Reddit was already reached through Apify and the browser tab was in use by another researcher. |
| 6 | Apify Google search scraper, country India | Worked. 10 queries. Gave People Also Ask, related searches, AI overviews and top results. About 0.1 USD. |
| 7 | Google autocomplete via curl (suggestqueries.google.com, gl=in) | Worked. |
| 8 | WebFetch on LinkedIn and Quora | Blocked by robots rules. LinkedIn read through Jina Reader instead. Quora bodies stayed gated. |
| 9 | yt-dlp for YouTube | Search worked (titles and view counts). Comments failed with 429 and a sign in bot check. |
| 10 | X, Discord, forums | Not reached. No route worked without a login. |

Reddit URL note: where the full slug was not kept, the link uses the short form https://www.reddit.com/comments/ID/ which Reddit redirects to the thread.

# 1. Evidence register (73 items with URLs, plus 2 flagged as VEXA related and not counted)

Kind key: T = thread with comments read, TT = thread title and score only, G = Google surface, L = LinkedIn, Y = YouTube title and view count, I = Instagram, Q = Quora, A = article.

| ID | Platform and date | Kind | URL | What it shows |
|---|---|---|---|---|
| E01 | Reddit r/esports, Nov 2025 | T | https://www.reddit.com/r/esports/comments/1ooty81/how_do_new_esports_teams_get_their_first_sponsors/ | New teams asking how to land a first sponsor. Replies say no audience, no money. |
| E02 | Reddit r/esports | T | https://www.reddit.com/r/esports/comments/1657c1u/why_do_esports_orgs_get_sponsorships/ | Effective sponsor versus "bubble sponsor". Affiliate links tie to purchases. |
| E03 | Reddit r/esports | T | https://www.reddit.com/r/esports/comments/1kxbcbr/why_do_brands_dont_buy_teams_like_f1/ | Why brands stay away. Jersey only logos are easy to ignore. |
| E04 | Reddit r/esports, 2022 | T | https://www.reddit.com/r/esports/comments/tk3jp7/large_to_small_esports_teams_to_sponsor/ | Brand side startup with a seven figure budget asks for team lists and reach data. |
| E05 | Reddit r/esports, 2020 | TT | https://www.reddit.com/comments/fx6glv/ | Ad agency person for a car maker asks what is new and hot in esports. |
| E06 | Reddit r/esports, 2023 | T | https://www.reddit.com/comments/114ko2e/ | Deal sizes in lower tier esports. Data and measurement decide money. |
| E07 | Reddit r/esports, 2025 | T | https://www.reddit.com/comments/1in1ow4/ | Marketer says $1M plus is hard to justify to CMOs without a 1:1 link to sales. |
| E08 | Reddit r/esports, 2016 | T | https://www.reddit.com/r/esports/comments/5j64h4/sponsorship_in_name_only/ | Advice to avoid no money deals and use tracked affiliate codes. Shady gambling sponsor. |
| E09 | Reddit r/esports | T | https://www.reddit.com/r/esports/comments/140ldti/esportswinter_why_esports_organizations_struggle_financially/ | Orgs rarely profitable. Publisher IP rules hold events back. |
| E10 | Reddit r/esports, 2018 | T | https://www.reddit.com/r/esports/comments/9rhk6e/how_do_esports_organization_make_a_profit/ | How orgs make money. Most are not aiming at profit. |
| E11 | Reddit r/esports, Mar 2026 | T | https://www.reddit.com/comments/1rrm9xs/ | BGMI tournament organisers take entry money and vanish. Fix offered: a live sheet tracking every rupee. |
| E12 | Reddit r/influencermarketing | T | https://www.reddit.com/r/influencermarketing/comments/1mczk1o/why_do_gaming_streamers_get_the_best_brand_deals/ | Brands pick gaming for engagement. Gamers seen as thrifty. "Gamers" treated as Gen Z. |
| E13 | Reddit r/influencermarketing | T | https://www.reddit.com/r/influencermarketing/comments/1b0yu34/honest_answers_has_anyone_seen_a_positive_roi_at/ | Brand side ROI stories. Pick many mid creators, not a few big ones. |
| E14 | Reddit r/influencermarketing | T | https://www.reddit.com/r/influencermarketing/comments/1mcolgr/how_to_find_out_roi_before_working_with_influencer/ | Buyers ask for ROI before paying. Told to ask for past campaign analytics. |
| E15 | Reddit r/influencermarketing | T | https://www.reddit.com/r/influencermarketing/comments/1rx4m30/how_are_you_measuring_real_roi_from_instagram/ | Measurement is manual and painful. Bot engagement cost clients money. |
| E16 | Reddit r/influencermarketing | T | https://www.reddit.com/r/influencermarketing/comments/1anr2v0/im_looking_to_work_with_gaming_influencers_where_can_i_find_them/ | Brand asks where to find gaming creators. Rate talk around 20 to 25 dollars per 1,000 views for mobile games. |
| E17 | Reddit r/influencermarketing, Jun 2025 | TT | https://www.reddit.com/r/influencermarketing/comments/1ljbocg/looking_for_vendors_with_bulk_techgaming/ | Agency needs bulk nano and micro tech and gaming creators for a phone campaign. |
| E18 | Reddit r/influencermarketing, Mar 2026 | T | https://www.reddit.com/r/influencermarketing/comments/1s7gro2/ | Seller side pitch for an Indian gaming talent agency. Shows what buyers are being promised. |
| E19 | Reddit r/influencermarketing, Jun 2026 | T | https://www.reddit.com/r/influencermarketing/comments/1ua6m6a/we_are_pitching_saas_brands_for_youtube_sponsorships_and_getting_ignored/ | Why sponsorship pitches get ignored. Lead with fit and risk. Most deals come inbound. |
| E20 | Reddit r/influencermarketing | T | https://www.reddit.com/r/influencermarketing/comments/1nrtsog/ | Brand view of a 400k creator. Pricing per post or 3 to 12 month ambassador. |
| E21 | Reddit r/youtubeindia, Mar 2025 | T | https://www.reddit.com/r/youtubeindia/comments/1j6saz1/cost_of_influencer_marketing_in_india_what_do_mega_influencers_charge/ | Indian brand budgeting a tech launch. Real quotes from creators. |
| E22 | Reddit r/StartupIdeasIndia, May 2026 | T | https://www.reddit.com/r/StartupIdeasIndia/comments/1t7gbyh/looking_for_influencer_marketing_agency/ | Brand seeks an agency with top Indian streamers. Replies judge the agency on creator relationships. |
| E23 | Reddit r/indianstartups, Jun 2025 | T | https://www.reddit.com/r/indianstartups/comments/1l39cei/has_anyone_here_got_approved_by_a_payment_gateway_for_a_tech_startup_in_esports_or_gaming_domain/ | Razorpay, Cashfree and PayU reject gaming and esports firms on manual review. |
| E24 | Reddit r/indianstartups, May 2026 | T | https://www.reddit.com/r/indianstartups/comments/1tq4g2m/need_guidance_for_building_a_new_age_brand_for_gen_z_in_india/ | Gen Z brand founder learns cheap claims read as knockoff. |
| E25 | Reddit r/marketing | T | https://www.reddit.com/r/marketing/comments/1alox6a/ | Maersk esports sponsorship judged a poor placement with near zero sales value. |
| E26 | Reddit r/marketing, May 2026 | T | https://www.reddit.com/r/marketing/comments/1tmvqvt/awareness_with_gen_z_is_target_kpi_is_it_ok_to_have_no_segmentation/ | Brands treat Gen Z as one target and ask if that is fine. |
| E27 | Reddit r/BGMI | T | https://www.reddit.com/r/BGMI/comments/1egvzwo/need_a_sponsor_for_our_team/ | Player asks for a sponsor. Reply says no proof, no sponsor. |
| E28 | Reddit r/BGMI | T | https://www.reddit.com/r/BGMI/comments/1mybqfj/is_this_a_scam_why_is_it_from_the_official_iqoo_insta_page/ | Fake iQOO esports page with botted followers and a scam link. Brand impersonation. |
| E29 | Reddit r/IndianGaming, Oct 2024 | T | https://www.reddit.com/r/IndianGaming/comments/1gfgugv/exposing_kreo_a_lying_fraud_company_from_their_core/ | 2317 score. Fake reviews, deleted bad reviews, paid scripted YouTube collabs. |
| E30 | Reddit r/IndianGaming, Aug 2025 | T | https://www.reddit.com/r/IndianGaming/comments/1mve6ed/indias_new_online_gaming_bill_2025_complete_ban_on_money_games_boost_for_esports_and_social_gaming/ | 818 score. Money game ads and celebrity endorsements banned. Esports recognised. |
| E31 | Reddit r/IndianGaming, 2022 | T | https://www.reddit.com/r/IndianGaming/comments/snm7t4/gigabyte_is_sponsoring_ipl_teams_now/ | 926 score. Mockery of sponsor stickers and unknown PC brands on IPL kits. |
| E32 | Reddit r/IndianGaming, 2024 | T | https://www.reddit.com/r/IndianGaming/comments/1c0ndw0/pm_met_with_a_bunch_of_indian_gaming_youtubers_and_influencers/ | Gamers distrust the top creators brands often pick. |
| E33 | Reddit r/IndianGaming | TT | https://www.reddit.com/comments/1uz8h5r/ | GameSir giveaway with about 3,600 comments. Giveaways pull huge engagement. |
| E34 | Reddit r/marketing | TT | https://www.reddit.com/comments/1c1hdz3/ | Gen Z uses social media as a search engine (228 score). |
| E35 | Reddit r/influencermarketing | TT | https://www.reddit.com/comments/1sl8fkw/ | Title: GameInfluencer accused of scamming creators. Creator side trust warning. |
| E36 | Reddit r/influencermarketing, Apr 2026 | T | https://www.reddit.com/comments/1smvpe9/ | Comment that Tier 2 and 3 Hinglish creators are underrepresented. |
| E37 | Reddit r/IndianFootball, Jun 2025 | T | https://www.reddit.com/r/IndianFootball/comments/1l1u6tv/need_help_with_getting_sponsorship_for_a_local_football_club_in_india/ | Adjacent, not gaming. Club needs 5 to 10 lakh and asks what to offer brands. Same rights holder questions. |
| E38 | Google PAA, India | G | https://www.google.com/search?q=how+to+sponsor+an+esports+team&gl=in | Cost and how to get sponsors questions (see section 2). |
| E39 | Google PAA, India | G | https://www.google.com/search?q=brands+sponsoring+esports+India&gl=in | Which brands and companies sponsor esports in India. |
| E40 | Google PAA, India | G | https://www.google.com/search?q=gaming+influencer+marketing+India+cost&gl=in | Influencer cost, average ROI, micro influencer definition. |
| E41 | Google PAA, India | G | https://www.google.com/search?q=gaming+creator+agency+India&gl=in | Top agencies, agency charges, biggest gaming creator. |
| E42 | Google PAA, India | G | https://www.google.com/search?q=BGMI+sponsorship&gl=in | How to apply for BGMI partner. Whether BGMI pays. |
| E43 | Google PAA and related, India | G | https://www.google.com/search?q=esports+marketing+ROI&gl=in | What is a good ROI. Esports marketing ROI strategy. |
| E44 | Google related searches, India | G | https://www.google.com/search?q=esports+sponsorship+contract&gl=in | Contract template, pdf, free, professional gamer agreement. |
| E45 | Google autocomplete, India | G | https://suggestqueries.google.com/complete/search?client=firefox&gl=in&q=esports+sponsorship | Sponsorship deck, proposal, application, list, deals. |
| E46 | Google autocomplete, India | G | https://suggestqueries.google.com/complete/search?client=firefox&gl=in&q=asci+influencer | ASCI influencer guidelines 2025 and variants. |
| E47 | Google autocomplete, India | G | https://suggestqueries.google.com/complete/search?client=firefox&gl=in&q=influencer+marketing+cost | Cost, price list, charges, budget. |
| E48 | Google autocomplete, India | G | https://suggestqueries.google.com/complete/search?client=firefox&gl=in&q=gaming+creator+agency | Gaming creator agency, content creator agency, salary. |
| E49 | Google AI overview, India (AI generated, unverified) | G | https://www.google.com/search?q=gaming+influencer+marketing+India+cost&gl=in | INR cost bands by creator tier and sponsor examples. Treat figures as claims. |
| E50 | Search result snippet (Jigsawkraft, via Google) | G | https://www.google.com/search?q=gaming+influencer+marketing+India+cost&gl=in | Snippet says price per 1,000 followers ranges 10x between sellers. |
| E51 | Google top result | A | https://goatagency.com/gaming-influencer-marketing-agency/ | Top result for "gaming creator agency India". Shows what buyers land on first. |
| E52 | Google top result | A | https://joinbrands.com/blog/gaming-influencer-agency/ | "9 Best Gaming Influencer Agencies in 2026" listicle in the same results. |
| E53 | Google top result | A | https://aogindia.com/ | 200 plus creators. Also has a for brands page with seeding from 50,000 rupees. |
| E54 | Google top result | A | https://influverse.co/agencies/gaming-influencer-marketing-agency | Says pricing tied to ROAS, CPL or pipeline KPIs. Buyers are being told to expect KPI pricing. |
| E55 | Quora | Q | https://www.quora.com/What-are-the-benefits-of-sponsoring-an-esports-team | Buyer question, 30 plus answers. Bodies gated, title only. |
| E56 | Instagram, team_modern_gaming | I | https://www.instagram.com/p/C9reSi1ybTp/ | Team launching sponsorships for BGMI teams. Seller side offer. |
| E57 | Instagram, esportsapp.in | I | https://www.instagram.com/p/DdhU9fmzZqx/ | Tournament sponsorship offer citing 280 plus inquiries. |
| E58 | LinkedIn, Anirudh Purohit, Aug 2026 | L | https://www.linkedin.com/posts/anirudhpurohit7_sportsbusiness-esportsindia-activity-7496178896762195968-fCNo | 102 reactions. Asks which Indian nonendemic brand moves first. |
| E59 | YouTube, Samar Playz | Y | https://www.youtube.com/watch?v=MNyPsNsZAcM | "How to Get Sponsorship in BGMI Competitive", 104K views. |
| E60 | YouTube, TalkEsport | Y | https://www.youtube.com/watch?v=ynHw-_jhYCw | "This New Rule Could Change Indian Esports Forever", 43K views. |
| E61 | YouTube, FFM Esports Hub | Y | https://www.youtube.com/watch?v=ICn0yW0dVO4 | Benefits a team gets from iQOO sponsorship and player pay, 29K views. |
| E62 | YouTube, Business Hub | Y | https://www.youtube.com/watch?v=rKAG5gokD6Y | "How Esports Teams Make Money?", 68K views. |
| E63 | YouTube, CG Talks | Y | https://www.youtube.com/watch?v=LfrcaXPDuA0 | How orgs earn and pay players, 51K views. |
| E64 | YouTube, IndiaGDC | Y | https://www.youtube.com/watch?v=euxPmU387XE | Panel on esports sponsorship in India, 13 minutes. |
| E65 | YouTube, Active Krishna | Y | https://www.youtube.com/watch?v=d8jUXVLdTIE | "I Started My Own Influencer Marketing Agency", 517K views. |
| E66 | YouTube, Manoj Dey | Y | https://www.youtube.com/watch?v=Z-e9bJe0Eu8 | Sponsorship rate for a 1,000 subscriber channel, 1.13M views. |
| E67 | ASCI guidance summary (identitykit.in) | A | https://identitykit.in | Disclosure rules and joint liability. Exact page path not retained. |
| E68 | Gadhia Associates contract checklist | A | https://www.google.com/search?q=influencer+contract+checklist+India+Gadhia+Associates | 12 point checklist. Exact page path not retained, found through Google. |
| E69 | Storyboard18 on BGMI's return | A | https://www.storyboard18.com | iQOO and Rooter numbers, probation worry. Exact page path not retained. |
| E70 | afaqs guest article on nonendemic brands | A | https://www.afaqs.com | 12 million plus viewership, mostly Tier II and III, ages 18 to 25. Exact page path not retained. |
| E71 | Reddit r/MaliciousCompliance, 2026 | TT | https://www.reddit.com/comments/1vde7gr/ | Title on paying influencers in "exposure". Weak signal. |
| E72 | Reddit r/indianstartups | TT | https://www.reddit.com/comments/1utu8bw/ | 127 score. Gaming PC cabinet called a marked up import. Distrust of Indian gaming brand claims. |
| E73 | Reddit r/esports | TT | https://www.reddit.com/comments/1g6rdg/ | Title: an org takes 100 percent of winnings. Player side fear of orgs. ID recovered from a title list and may be truncated, so verify before citing. |

Flagged as VEXA related, not counted above:
* X1: LinkedIn post by vexa digital in on Indian esports orgs' sponsorship dependence, 9 reactions. https://www.linkedin.com/posts/vexa-digital-in_most-indian-esports-orgs-dont-shut-down-activity-7420087903818698752-6IkS
* X2: YouTube "Your Esports Org Will Never Get Sponsored (Here's the Real Reason)" by KausticSoda, https://www.youtube.com/watch?v=12fzAzwfQg4. The channel name looks like the founder's. Not used as buyer evidence.

# 2. Search terms grouped by intent

Source for each term is the Google surface named in brackets (People Also Ask, autocomplete, related searches, or top result title). India, English. All are phrases people typed or were offered.

## 2.1 Learning (what is this and how do I start)

Rights holder side:
* how to get sponsors for an esports team [autocomplete E45]
* how to get sponsorship for esports team [PAA E38]
* how can I get gaming sponsorship [PAA E38]
* how to apply for BGMI partner [PAA E42]
* how to get a gaming sponsor [autocomplete E45]
* what brands sponsor esports [autocomplete E45]
* esports sponsorship application, deck, proposal, proposal pdf [autocomplete E45]
* how to get sponsorship for an event in India [PAA E39]
* how to get sponsorships for gaming [PAA E42]

Brand side:
* who sponsors esports teams [PAA E38]
* which brands sponsor esports [PAA E39]
* what does an influencer marketing agency do [autocomplete E47]
* how to find influencers for an influencer marketing agency [PAA E41]
* does Gen Z like gaming [PAA E40]
* why do Gen Z like influencers [PAA E40]
* Gen Z gaming statistics [related E43]
* gaming conference in India, esports events in India [autocomplete E45]
* esports market size in India [autocomplete E45]

## 2.2 Comparing (who is best, which is better)

* top 5 esports organizations in India [PAA E39]
* top 10 esports companies in India [PAA E39]
* top brands sponsoring esports India [related E39]
* fashion brands sponsoring esports India [related E39]
* who is India's biggest gaming creator [PAA E41]
* which is the biggest influencer agency in India [PAA E41]
* top 5 influencer marketing agencies in India [PAA E41]
* best influencer marketing agency in Delhi [related E41]
* gaming creator agency India reviews, best, reddit [related E41]
* gaming influencer marketing agency India reviews [related E41]
* who are the biggest sponsors in esports [PAA E38]
* micro gaming influencers India, top gaming influencers India [autocomplete E48]
* result titles such as "9 Best Gaming Influencer Agencies in 2026" [E52]

## 2.3 Hiring (I want someone to do this for me)

* gaming creator agency, gaming content creator agency [autocomplete E48]
* gaming marketing agency India, gaming digital marketing agency [autocomplete E48]
* gaming influencer marketing agency [autocomplete E48]
* influencer management agency India [autocomplete E47]
* creator management agency in India [related E41]
* top gaming influencer marketing agency India [related E41]
* digital marketing agency India reddit [autocomplete E47]
* mobile game influencer marketing [autocomplete E48]
* Reddit ask in E22: a brand wants an agency with top Indian live streamers.

## 2.4 Pricing (how much)

* how much does it cost to sponsor an esports team [PAA E38, autocomplete E45]
* how much do sponsors pay streamers, sponsored stream rates [autocomplete E45]
* how much do gaming sponsors pay [autocomplete E45]
* bgmi sponsorship amount, bgmi sponsorship list [related E42]
* how much does influencer marketing cost in India [PAA E40]
* influencer marketing cost India, influencer price list, influencer marketing charges [autocomplete E47]
* how much do influencer agencies charge in India [PAA E41]
* how much do influencers earn in India [autocomplete E47]
* what is a good ROI for marketing, average ROI for influencer marketing [PAA E40, E43]
* esports marketing ROI strategy [related E43]
* do players get paid for 1 day contracts [PAA E42]

## 2.5 Trust (will this work, is it real)

* risks of influencer marketing [autocomplete E47]
* is BGMI giving money [PAA E42]
* small esports sponsors [related E38]
* gaming creator agency India reviews [related E41]
* how to sponsor an esports team reddit [related E38]. People go to Reddit to check claims.
* The Reddit trust queries behind these are in section 5.

## 2.6 Legal and contract

* esports sponsorship contract template, pdf, free [related E44]
* professional gamer agreement pubg mobile [related E44]
* ASCI influencer guidelines, 2025, (2021), advertising guidelines [autocomplete E46]
* result set for "esports sponsorship contract": Contractbook, Jacobs Counsel, Juro, Foot Anstey, KJK, Scribd. All law firm or template pages [E44].

Pattern to note: on the rights holder side people search for how to get a deal. On the brand side they search for cost, agencies and ROI. Nobody in the autocomplete data searches for "sponsorship sales" or "commercial architecture". Buyers use the words sponsor, sponsorship, agency, influencer, cost, ROI, contract.

# 3. What appeals to buyers and what they mock

## 3.1 What appeals (rewarded in the evidence)

1. Outcomes that can be tied to sales. Promo codes and affiliate links are the repeated fix. E02: an ex contract writer says links "can tie nearly to spikes in purchases within 14 days". E08 says a tracked code deal beats a no money deal. E15 wants unique codes and link clicks.
2. A track record on deliverables. E01: "Usually having some sort of track record of being able to fulfill on deliverables would do you good". E20 brand view: "would want to know if you have ever sold anything."
3. Numbers agreed before the money moves. E03: "Sponsoring is easy, you just tell them the metrics they have to achieve to get your money." E06: "No data, no measurement, which means no money."
4. A steady, real audience, not a spike. E01: "50 viewers just isn't worth anything to a corporate sponsor. You need to add a few zeroes".
5. Real creator relationships and fast replies. E22 reply: "the agency matters less than whether they have real creator relationships". Reply also lists fast answers, negotiation and live stream handling.
6. Realistic mid size creators over big names. E13: "The big influencers honestly aren't worth their cost." Advice there is to spread across many.
7. Regional reach. E36 says Tier 2 and 3 Hinglish creators are underrepresented. E70 says esports viewership is mostly Tier II and III cities, ages 18 to 25.
8. A clear first mover story for mainstream brands. E58 lists Visa, BMW, Amex, Adidas and others at a world cup event and asks "makes that call first" for India.
9. Legal clarity after the money game ban. E30: "This is a big W, now they can finally not associate gambling with gaming."
10. Pitches that fit the brand's own business. E19 advice: lead with workflow fit and risk reduction, add a view and click range, personalise. Most deals there came inbound.
11. Money visibly tracked. E11: a live Google Sheet showing every rupee is the answer to a tourney scam.
12. Hardware, giveaways and controllers. E33 pulled about 3,600 comments. E12 lists chairs, headsets, keyboards and energy drinks as gaming's classic brand deals.

## 3.2 What they mock or ignore

1. Logo on a jersey and nothing else. E03: one commenter says "I don't even realize that Honda was sponsoring liquid". E25 on a shipping brand: "near close to 0 benefit from a sales point of view."
2. Sponsor clutter and brands nobody knows. E31: "Gonna be fun explaining it to Indian parents when they ask what's Gigabyte".
3. "Bubble sponsors" with no activation. E02 draws the line between a sponsor that sells through the audience and one that only pays for presence.
4. Reach numbers without a result. E07 and E14: buyers say ROI cannot be known upfront ("You can never find out an ROI before investing.") so they ask for past analytics.
5. Fake or scripted marketing. E29: "Kreo reviews sounded fake as hell, so I bought trusty old Razer". Top comment: "biggest red flag for me was they were promoting themself as indian gaming brand".
6. Big name gaming creators as the face of a brand. E32 shows the core gamer community mocking them.
7. Treating all Gen Z as one audience. E26 asks if no segmentation is fine. E12 notes marketers use "gamers" as another word for Gen Z.
8. Cheap positioning. E24: "'same quality, cheaper' doesn't say premium. It says knockoff."
9. Paying in "exposure". E71 title only, weak signal.
10. Pitches that lead with numbers alone. E19 says raw numbers get ignored.

Audience note: r/IndianGaming is mostly gamers, not brand buyers. E29, E31, E32 and E72 matter because brand buyers inherit that audience's contempt when the campaign looks fake or forced.

# 4. Visuals and interface styles buyers praise or share

Honest finding: direct praise of a sponsorship website, a deck layout, a loading animation or a colour palette was not found in any source reached. Buyers talk about proof and numbers, not design. Nothing below is a design preference stated by a buyer. These are formats buyers reward or share, and formats they mock.

Formats that get shared or rewarded:
1. A live tracking sheet of money and results. E11.
2. Tracked promo codes, unique links and dashboards as the proof of a sale. E02, E08, E15.
3. Price band tables in INR by creator tier. Google puts these at the top of the page for cost searches, so buyers are learning to expect them (E49, flagged as AI generated). Sellers use the same shape: E53 says seeding from 50,000 rupees and mid tier BGMI campaigns at 2 to 5 lakh.
4. Sponsorship deck, proposal, application and template documents. The autocomplete for "esports sponsorship" ends in deck, proposal, proposal pdf, application (E45). A Gamma hosted sponsorship doc also ranked in the Google results for "esports sponsorship India".
5. Outcome headlines on agency pages, for example "Move SKUs, Not Reach" (Neogen Media, on the cost results page of E40) and "pricing tied to ROAS, CPL or pipeline KPIs" (E54).
6. Giveaway posts with named hardware. E33.
7. Named brand logo lists in a LinkedIn post, then one question. E58 got 102 reactions.
8. Short screenshots of numbers in social offers, for example "280+ inquiries" (E57).
9. YouTube explainer titles phrased as a cost or salary reveal, for example "TG per player monthly salary" (E61) and "How Esports Teams Make Money?" (E62).

Formats that get mocked:
1. Logo only jersey placement. E03, E31.
2. Fake review screenshots and deleted bad reviews. E29.
3. Fake brand pages with botted followers. E28.
4. Scripted YouTube collabs. E29.
5. Sponsor sticker clutter. E31.

Gap: no source showed loading, motion or colour preferences. Treat any design decision on those as untested.

# 5. Trust and legal concerns

| Concern | What buyers said or the source says | IDs |
|---|---|---|
| Taking money and vanishing | BGMI tournament organisers collected entry money against a "₹20k guaranteed pot" then vanished. Thread called it a "Classic Indian tourney scam". Live sheet suggested as the fix. | E11 |
| Fake followers and bot engagement | Bot engagement was making clients lose money. Fake KPIs. Botted followers on a fake brand page. | E14, E15, E28 |
| Fake reviews | Fake ChatGPT reviews and deleted negative reviews at a gaming brand. | E29 |
| Brand impersonation | A fake iQOO esports page ran a scam link. | E28 |
| No proof, no sponsor | Player side: "Bina proofs ke achievements... koi sponsor ni karega". | E27 |
| Gambling adjacent sponsors | A "shady gambling sponsor" in a no money deal. Betting sponsors leaving esports appeared as a thread title only (not registered). | E08 |
| Legal status of money games | Aug 2025 bill bans money game ads and celebrity endorsements. Esports recognised. Buyers now ask whether a sponsor is a money game. | E30 |
| Disclosure and ASCI | Put #Ad, #Sponsored or #PaidPartnership in the first two lines. Verbal disclosure in the first 10 seconds plus text overlay. Covers cash, gifted product, affiliate commission, equity. Brand and influencer are jointly liable. April 2025 addendum covers finance and health qualifications. | E46, E67 |
| Contract terms | 12 point checklist: deliverables, revision cap of 2 rounds, approval window about 5 working days, tight exclusivity, usage rights 3 to 12 months, whitelisting priced separately, split payment, disclosure duty, capped indemnity. | E44, E68 |
| Payment terms and tax | GST, TDS under 194C or 194J, barter under 194R. MSMED Act 45 day payment rule for micro and small firms. Split payment as advance plus balance on go live. | E68 |
| Non payment and disputes | Creators taking legal action for non payment and the "how do influencers get paid" question are covered in search results (Lumanu, Gigapay). Titles only, no page read, so no evidence ID. | none |
| Payment gateway rejection | Razorpay, Cashfree and PayU rejecting gaming and esports firms on manual review. A real friction for anyone taking money online. | E23 |
| Consumer law penalty | Up to 10 lakh rupees under the Consumer Protection Act for violations. | E68 |
| Platform and publisher risk | Publisher IP rules restrict events. BGMI's three month probation was called a concern. | E09, E69 |
| Data privacy | No buyer thread about data privacy or DPDP was found. Do not assume it is a buyer worry. | none |
| Cheque and payment disputes | No thread found specifically about cheques. Payment terms concerns show up only in contract advice (E68). | none |
| Player and creator side fear of orgs | An org taking all winnings (title only). GameInfluencer accused of scamming creators. | E35, E73 |

Note on the ASCI penalty: a 10 to 50 lakh figure in E67 applies to AI virtual influencers, not to ordinary sponsorships.

# 6. What to build from this

## 6.1 Ranked top 15 questions for the VEXA website

Ranking method: number of distinct evidence IDs from different platforms that raise the question, then whether it appears in Google demand data, then whether it blocks a purchase. Rank 1 is asked most. Side: B = brand, R = rights holder.

| Rank | Question in buyer language | Side | Evidence IDs |
|---|---|---|---|
| 1 | How much does it cost to sponsor an esports team or gaming creator? | B | E38, E40, E45, E47, E49, E50, E21, E16, E13 |
| 2 | How will I know it worked? What do I get back? | B | E02, E07, E13, E14, E15, E25, E43, E54 |
| 3 | How do I get a sponsor for my team, event or channel? | R | E01, E08, E27, E38, E42, E45, E56, E57, E59, E66 |
| 4 | Have you actually done this before? Show me a track record. | B and R | E01, E14, E20, E27 |
| 5 | Who else is real, and how do I avoid fake followers, bots and scams? | B and R | E11, E14, E15, E28, E29 |
| 6 | What happens to my money, and when do I pay? (split payments, refunds, non delivery) | B and R | E11, E68, E23 |
| 7 | What should be in the contract? Do you have a template? | B and R | E44, E68 |
| 8 | Does ASCI apply to my campaign and who is liable? | B | E46, E67 |
| 9 | Is this a money game or gambling sponsor, and does the 2025 law change my deal? | B and R | E08, E30 |
| 10 | Why would a brand pay a team with only a few hundred viewers? | R | E01, E04, E06 |
| 11 | Is gaming the right move for my brand, or should I skip it? | B | E03, E25, E26, E58 |
| 12 | How do I reach Gen Z and Tier 2 and 3 gamers without looking fake? | B | E12, E24, E26, E29, E34, E36, E70 |
| 13 | Big creator, many small ones, or an event: which fits my budget? | B | E13, E16, E20, E21, E17 |
| 14 | Are you an agency, a broker or a creator manager? What do you charge? | B and R | E22, E41, E48, E65 |
| 15 | How does a pilot work, and how small can it start? | B | E13, E19, E40 |

Caution for the website: rank 4 is the hardest for VEXA because the founder's own site says no independently branded campaign has closed yet. The evidence says buyers penalise vague claims (E29, E24), so an honest answer is safer than an implied track record.

## 6.2 Ten headline directions in buyer language

Each uses a phrase buyers used. None claims a result VEXA cannot back.

1. "Know the number before you spend." Basis: E07, E14, E43. Buyers say ROI cannot be known upfront.
2. "Your logo on a jersey is not a campaign." Basis: E03, E25, E31.
3. "A sponsor pays for people who show up, not a follower count." Basis: E01, E15.
4. "How much does it really cost to sponsor an esports team in India?" Basis: E38, E45, E49.
5. "Get your team, event or channel its first sponsor." Basis: E01, E27, E42, E59.
6. "Every rupee tracked, every result reported." Basis: E11, E15.
7. "Reach gamers in Tier 2 and 3 cities without looking like an ad." Basis: E29, E36, E70.
8. "Sponsorship contracts, payment terms and ASCI disclosure, done properly." Basis: E44, E46, E68.
9. "We will tell you when gaming is the wrong move." Basis: E25, E26, E58.
10. "A small pilot before a big cheque." Basis: E13, E19, E20.

# 7. Gaps and caveats

* X, Discord and forums were not reached. No buyer voice from those places is in this file.
* Quora question pages loaded only as titles. No answer text was read.
* YouTube comments were blocked (429 and bot check). Only titles and view counts were used, so the YouTube items show topics people watch, not what they said.
* Claude in Chrome was not used for buyer research.
* Reddit coverage is partial because of the Apify cost cap. Several threads (marked TT) were read as titles and scores only.
* Google AI overview figures in E49 (creator cost bands, esports team costs, sponsor examples) are AI generated. Do not quote them as facts.
* E67 to E70 record the source name but not the exact page path, because the paths were not kept after collection. Re fetch before citing.
* Buyers who hold the budget rarely post in public. The strongest brand voices are in r/influencermarketing, r/esports and r/marketing, and a few are startups and agencies, not big brand marketers. The gamer audience threads (E29, E31, E32) show the audience's reaction, not the buyer's.
* Two seller side items (E18, E57) are pitches, so they show what buyers are told, not what buyers asked.
* No item found on data privacy, DPDP or cheque disputes as buyer worries. Both are logged in section 5 as not found.
