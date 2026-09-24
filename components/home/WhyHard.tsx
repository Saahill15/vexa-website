import { bodyClass, h2Class, Section } from "@/components/Section";

export function WhyHard(): React.ReactElement {
  return (
    <Section segment="HOME-04" index="01" label="The problem">
      <h2 className={h2Class}>Your logo on a jersey is not a campaign</h2>
      <div className={`mt-6 vx-body ${bodyClass}`}>
        <p>
          Most gaming pitches lead with reach, meaning views, followers and community size. None of those numbers tells you
          whether people signed up, bought or even noticed your brand.
        </p>
        <p>
          We help you choose the part of the gaming audience that fits your product, and agree how results will be counted
          before you spend.
        </p>
      </div>
    </Section>
  );
}
