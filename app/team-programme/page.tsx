import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { Section, h2Class, bodyClass } from "@/components/Section";
import { TeamProgrammeForm } from "@/components/TeamProgrammeForm";
import { withShare } from "@/lib/meta";

export const dynamic = "force-dynamic";
export const metadata: Metadata = withShare({title: "The team programme", description: "A six month working programme for five esports teams to develop a repeatable content offer and the evidence behind it.", alternates: {canonical: "/team-programme"}, robots: {index: false, follow: false}});

export default function TeamProgramme(): React.ReactElement {
  const preview = process.env.VEXA_PREVIEW === "1";
  const open = process.env.TEAM_PROGRAMME_OPEN === "1";
  return <>
    <PageIntro segment="TEAM-01" label="The team programme" title="Build something your team can keep delivering.">
      <p>Five esports teams. Six months of guided work on a regular content format, audience evidence and an offer a brand can assess. There is no programme fee.</p>
      <p>{preview ? "This is the proposed application page. The programme has not opened; preview submissions stay on this Mac." : open ? "Applications are open. We will agree the schedule with selected teams before the programme begins." : "Applications have not opened yet. The programme remains a proposed offer."}</p>
    </PageIntro>
    <Section segment="TEAM-02" label="The work" index="01">
      <h2 className={h2Class}>A small, specific commitment on both sides.</h2>
      <div className="offer-grid mt-8">
        <div><h3>What VEXA provides</h3><p>One shared 90 minute review each month, plus one written review of an agreed submission from each team that month. We begin with a plan for your first month and use the work you publish to guide the next one.</p></div>
        <div><h3>What your team provides</h3><p>One person responsible for the work, a format you can publish each week and a monthly record of what you made and how people responded. You produce the content and bring the evidence to each review.</p></div>
      </div>
      <p className={`mt-8 ${bodyClass}`}>The programme is advisory. Content production, individual coaching and sponsor introductions are outside its scope. A sponsor or income is never guaranteed.</p>
    </Section>
    <Section segment="TEAM-03" label="Selection" index="02">
      <h2 className={h2Class}>Show us the work you can sustain.</h2>
      <p className={`mt-6 ${bodyClass}`}>We assess your recent activity, who owns delivery and whether the proposed weekly format is realistic. There is no minimum follower count. Five teams will be selected after the application window closes.</p>
      <p className={`mt-4 ${bodyClass}`}>The window will run for 14 days from the public announcement. Applying does not reserve a place. Each selected team receives the schedule and participation terms before accepting. Sharing your results publicly requires separate permission.</p>
    </Section>
    <Section segment="TEAM-04" label="Apply" index="03">
      {preview || open ? <><h2 className={h2Class}>Tell us about your team.</h2><TeamProgrammeForm /></> : <p className={bodyClass}>You can start with the <Link href="/learn" className="vx-link">articles</Link> while applications are closed.</p>}
    </Section>
  </>;
}
