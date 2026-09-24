import { BriefLink } from "@/components/BriefLink";
import { QuillRule } from "@/components/QuillRule";

export function ClosingCta(): React.ReactElement {
  return (
    <section data-segment="HOME-09" className="border-t border-vx-hair">
      <div className="vx-container vx-grid py-16 md:py-24 lg:py-32">
        <div className="col-span-full lg:col-span-7 lg:col-start-4">
          <h2 className="max-w-[30ch] font-display text-display-l font-normal text-vx-ink">
            <span className="block">Tell us what you want gaming to do for your business.</span>{" "}
            <span className="block">We will tell you if it can, and how we will count it.</span>
          </h2>
          <div className="mt-10">
            <BriefLink>Send your brief</BriefLink>
          </div>
        </div>
        <div className="col-span-full mt-12 lg:col-span-7 lg:col-start-4">
          <QuillRule />
        </div>
      </div>
    </section>
  );
}
