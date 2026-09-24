import type { Metadata } from "next";
import { BriefLink } from "@/components/BriefLink";
import { ENTITY } from "@/components/entity";
import { PageIntro } from "@/components/PageIntro";
import { QuillRule } from "@/components/QuillRule";
import { bodyClass, h2Class, h3Class, Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "About the founder and the company",
  description:
    "VEXA Digital is an esports and brand partnerships consultancy for brands new to gaming and for gaming teams and creators. Meet the founder and read why the name.",
  alternates: { canonical: "/about" },
};

export default function AboutPage(): React.ReactElement {
  return (
    <>
      <PageIntro
        segment="ABOUT-01"
        label="Why VEXA"
        title="About VEXA"
        after={
          <div className="mt-12 max-w-body border-y border-vx-ink py-6">
            <p className="vx-label text-vx-muted">Who we are</p>
            <div className="mt-4 space-y-2 font-text text-small text-vx-ink-2">
              <p>VEXA Digital is run from Delhi.</p>
              <p data-counsel="true">{ENTITY.licence}</p>
              <p data-counsel="true">{ENTITY.registrations}</p>
            </div>
          </div>
        }
      >
        <p>VEXA Digital is an esports and brand partnerships consultancy. We work with two kinds of client.</p>
        <p>
          The first is a brand that does not yet understand gaming. We help it find where it fits, and we sell results it can
          measure, with the numbers agreed before it spends.
        </p>
        <p>
          The second is a gaming team, creator or organiser that wants brand partners. We look at where it stands today,
          connect it with brands that suit that stage, and show it how to start.
        </p>
      </PageIntro>

      <Section segment="ABOUT-02" index="01" label="The team" tone="stone">
        <h2 className={h2Class}>The founding team</h2>
        <div className="mt-10 border-t border-vx-ink pt-6">
          <h3 className={h3Class}>Soda (Kaustubh), founder</h3>
          <div className={`mt-4 vx-body ${bodyClass}`}>
            <p>Soda founded VEXA and runs it day to day, and you deal with him directly.</p>
            <p data-counsel="true">
              He is a law graduate, and he reads your deal exactly as written before he prices it. VEXA does not give legal
              advice.
            </p>
            <p>
              He played competitive BGMI for three years as his team&apos;s in game leader, the player who sets strategy and
              calls the shots. It taught him what gamers respond to, and he brings that to your campaign.
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-vx-ink pt-6">
          <h3 className={h3Class}>Pratham Kishorkumar Asknani, cofounder</h3>
          {/* COUNSEL TO CONFIRM: certificate spelling "Asknani"; the owner spells it "Asnani". */}
          <p className={`mt-4 ${bodyClass}`} data-counsel="true">
            Pratham is VEXA&apos;s cofounder and the proprietor of Blue Wings, the business that trades as VEXA Digital.
          </p>
        </div>
      </Section>

      {/* LEAD HOLD 22 Sep 2026: Advocates Act / enrolment / structure copy omitted from public
          render pending Soda review. SITE_PLAN.md open question 4. Do not publish that section
          until he clears it. */}

      <Section segment="ABOUT-03" index="02" label="The name">
        <h2 className={h2Class}>Why the name</h2>
        <p className={`mt-6 ${bodyClass}`}>VEXA comes from</p>
        <blockquote className="mt-4 max-w-[32ch] font-display text-quote italic text-vx-ink">
          &ldquo;Very easy is never awesome.&rdquo;
        </blockquote>
        <div className={`mt-8 vx-body ${bodyClass}`}>
          <p>
            Gaming sponsorship looks easy from outside. Put a logo on a jersey or buy a shoutout on a stream, and the deal is
            done. Most of those deals are quickly forgotten.
          </p>
          <p>We design each sponsorship around a number you agree before you spend.</p>
        </div>
      </Section>

      <section data-segment="ABOUT-04" className="border-t border-vx-hair">
        <div className="vx-container vx-grid py-16 md:py-24 lg:py-32">
          <div className="col-span-full lg:col-span-7 lg:col-start-4">
            <BriefLink>Send your brief to Soda</BriefLink>
          </div>
          <div className="col-span-full mt-16 lg:col-span-9 lg:col-start-4">
            <QuillRule />
          </div>
        </div>
      </section>
    </>
  );
}
