import { AudienceSwitch } from "@/components/AudienceSwitch";
import { ButtonLink } from "@/components/ButtonLink";
import { BriefLink } from "@/components/BriefLink";
import { FeatherEye } from "@/components/FeatherEye";
import { leadClass } from "@/components/Section";

export function Hero(): React.ReactElement {
  return (
    <section data-segment="HOME-01" className="vx-container vx-grid pb-16 pt-8 md:pb-24 md:pt-16 lg:pb-28 lg:pt-24">
      <div className="col-span-full mb-5 lg:col-span-3 lg:mb-0">
        <p className="vx-label pt-1 text-vx-muted lg:pt-4">Brand partnerships for gaming</p>
      </div>
      <div className="col-span-full lg:col-span-7 lg:col-start-4">
        <h1 className="max-w-[24ch] font-display text-display-xl font-normal text-vx-ink">
          Brands and gaming, matched for results you can measure.
        </h1>
        <p className={`mt-6 md:mt-8 ${leadClass}`}>
          VEXA Digital is an esports and brand partnerships consultancy. We help brands that are new to gaming find where
          they fit, and we help teams, creators and organisers find the brand partners that suit where they are today.
        </p>
        <div data-segment="HOME-02" className="mt-8 md:mt-10">
          <AudienceSwitch />
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <BriefLink>Send your brief</BriefLink>
            <ButtonLink href="/how-we-work" variant="text">
              See how we work
            </ButtonLink>
          </div>
        </div>
      </div>
      <aside
        aria-label="How we work"
        className="col-span-full mt-14 border-t border-vx-hair pt-6 lg:col-span-2 lg:col-start-11 lg:mt-2 lg:border-t-0 lg:pt-0"
      >
        <FeatherEye className="hero-eye hidden w-10 lg:block" />
        <p className="vx-label text-vx-muted lg:mt-6">How we work</p>
        <p data-segment="HOME-03" className="mt-3 border-t border-vx-hair pt-3 font-text text-small font-medium text-vx-ink lg:max-w-[16ch]">
          We promise only what we can count, and we agree the count with you before you spend.
        </p>
      </aside>
    </section>
  );
}
