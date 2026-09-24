import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "About the founder and the company",
  description:
    "VEXA designs gaming and esports sponsorship campaigns for brands and sells sponsorship for esports teams, events and creators. Meet the founder and read why the name.",
};

const h2 = "font-display text-2xl font-semibold tracking-tight text-vx-ink-900";
const body = "mt-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg";

export default function AboutPage(): React.ReactElement {
  return (
    <div className="pb-20">
      <PageIntro segment="ABOUT-01" title="About VEXA">
        <p>
          VEXA designs gaming and esports sponsorship campaigns for brands reaching India&apos;s 16
          to 28 audience, and sells sponsorship for esports teams, events and creators.
        </p>
        <p>
          VEXA is based in Delhi and is a trading name of Blue Wings Esports [Soda to confirm: legal
          form and proprietor line, as counsel and the accountant advise].
        </p>
      </PageIntro>

      <div className="mx-auto max-w-3xl space-y-14 px-5 md:px-8">
        <section data-segment="ABOUT-02">
          <h2 className={h2}>Who you work with</h2>
          <p className={body}>
            VEXA is founded and run by Kaustubh Srivastava, known as Soda, and you deal with him
            directly. [Soda to confirm: photo, use of the full name on this page, and one profile
            link]
          </p>
          <p className={body} data-counsel="true">
            He is a law graduate, and he reads your deal exactly as written before he prices it.
            VEXA does not give legal advice.
          </p>
          <p className={body}>
            He played competitive BGMI for three years as his team&apos;s in game leader, the player
            who sets strategy and calls the shots. It taught him what gamers respond to, and he
            brings that to your campaign.
          </p>
          <p className={body}>[Soda to confirm: a short dated timeline, such as the year VEXA started]</p>
        </section>

        {/* LEAD HOLD 22 Sep 2026: Advocates Act / enrolment / structure copy omitted from public
            render pending Soda review. SITE_PLAN.md open question 4. Do not publish that section
            until he clears it. */}

        {/* CONFIRM WITH SODA: see SITE_PLAN.md open question 5 */}
        <section data-segment="ABOUT-03">
          <h2 className={h2}>Why the name</h2>
          <p className={body}>
            VEXA comes from &quot;Very easy is never awesome&quot;. [Soda to confirm: how the letters
            V, E, X and A map to the words]
          </p>
          <p className={body}>
            Gaming sponsorship looks easy from outside. Put a logo on a jersey or buy a shoutout on a
            stream, and the deal is done. Most of those deals are quickly forgotten.
          </p>
          <p className={body}>We design each sponsorship around a number you agree before you spend.</p>
        </section>

        <div data-segment="ABOUT-04">
          <ButtonLink href="/contact">Send your brief to Soda</ButtonLink>
          <p className="mt-4 text-sm text-vx-neutral-600">
            We reply within [Soda to confirm: reply time in working days].
          </p>
        </div>
      </div>
    </div>
  );
}
