import type { Metadata } from "next";
import { WaitlistForm } from "@/components/learn/WaitlistForm";
import { PageIntro } from "@/components/PageIntro";
import { bodyClass, h2Class, Section } from "@/components/Section";
import { withShare } from "@/lib/meta";

// Proposed learning offer only. Keep it unpromoted and out of search until delivery and terms are ready.
const ROOM_OPEN = false;

export const metadata: Metadata = {
  ...withShare({
    title: "The weekly room for players, creators and small teams",
    description: "A proposed live learning room for players, creators and small teams. The room is not open; delivery and terms remain to be confirmed.",
    alternates: { canonical: "/room" },
  }),
  robots: { index: ROOM_OPEN, follow: ROOM_OPEN },
};

const WEEK = [
  { time: "20 minutes", text: "One lesson, with a worked example on a real page." },
  { time: "30 minutes", text: "Hot seat. Kaustubh opens two or three members' pages or pitches and fixes them live." },
  { time: "10 minutes", text: "Questions. Then everyone leaves with one action and a deadline." },
] as const;

export default function RoomPage(): React.ReactElement {
  return (
    <>
      <PageIntro segment="ROOM-01" label="The room" title="A place to work through the business of gaming.">
        <p>The room is a proposed live learning offer for players, creators and small teams, with teaching and discussion of your own work.</p>
        <p>The room is not open. The format, delivery schedule, seller and terms need to be confirmed before anyone can join.</p>
      </PageIntro>

      <Section segment="ROOM-02" index="01" label="A proposed format" tone="stone">
        <h2 className={h2Class}>What a session could include.</h2>
        <ul className="mt-8 space-y-5">
          {WEEK.map((part) => (
            <li key={part.time} className="border-t border-vx-ink pt-4">
              <p className="vx-label figure-nums text-vx-peacock-blue">{part.time}</p>
              <p className={`mt-2 ${bodyClass}`}>{part.text}</p>
            </li>
          ))}
        </ul>
        <p className={`mt-8 ${bodyClass}`}>Recording access, materials and any support between sessions would be stated in the offer before joining.</p>
      </Section>

      <Section segment="ROOM-03" index="02" label="Fit">
        <h2 className={h2Class}>Who it is for, and who it is not.</h2>
        <div className={`mt-6 vx-body ${bodyClass}`}>
          <p>For players, creators and small teams who want to understand and improve the commercial side of their work.</p>
          <p>Not for anyone hoping to be promised a sponsor. Nobody can promise that, and we will not.</p>
          <p>If you are under 18, a parent or guardian joins the payment.</p>
          <p>Any price and payment route would be shown with the confirmed offer.</p>
        </div>
      </Section>

      <Section segment="ROOM-04" index="03" label="Waitlist" tone="stone">
        <h2 className={h2Class}>{ROOM_OPEN ? "Join the room." : "Hear when there is an update."}</h2>
        <div className="mt-8 max-w-body">
          <WaitlistForm slug="room-waitlist" button="Put me on the list" />
        </div>
      </Section>
    </>
  );
}
