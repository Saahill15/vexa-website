import { ButtonLink } from "@/components/ButtonLink";
import { bodyClass, h2Class, h3Class, Section } from "@/components/Section";

/** The two audience doors (DESIGN.md section 6). The chosen audience's door moves first and wider. */
export function WhatWeDo(): React.ReactElement {
  return (
    <Section segment="HOME-05" id="what-we-do" index="02" label="The work" wide>
      <h2 className={h2Class}>What we do</h2>
      <div className="doors mt-10 md:mt-12">
        <article id="for-brands" className="door-brands scroll-mt-24 border-t-2 border-vx-peacock-blue pt-6">
          <h3 className={h3Class}>For brands</h3>
          <p className={`mt-4 ${bodyClass}`}>
            For brands that want to reach gamers but do not yet know the space. We find where your brand fits, choose the
            teams, events or creators, and report against the KPI you agreed. Example KPI: app installs.
          </p>
          <ButtonLink href="/how-we-work#two-ways" variant="text" className="mt-4">
            How a pilot works
          </ButtonLink>
        </article>
        <article id="for-teams-and-creators" className="door-holders scroll-mt-24 border-t-2 border-vx-peacock-teal pt-6">
          <h3 className={h3Class}>For gaming teams and creators</h3>
          <p className={`mt-4 ${bodyClass}`}>
            For esports teams, creators and organisers who want brand partners. We look at where you are now, connect you with
            brands that suit that stage and show you how to start. When you are ready, we sell your sponsorship and negotiate
            the deal. You pay a fee, plus a commission when the deal closes.
          </p>
          <ButtonLink href="/how-we-work#two-ways" variant="text" className="mt-4">
            How we sell for you
          </ButtonLink>
        </article>
      </div>
      <p className="mt-12 max-w-[56ch] border-t border-vx-hair pt-6 font-text text-lead text-vx-ink">
        Either way, you agree the numbers before work starts, and we report against them when it ends. If gaming is the wrong
        move for you, we will say so.
      </p>
    </Section>
  );
}
