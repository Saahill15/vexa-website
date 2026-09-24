import { ButtonLink } from "@/components/ButtonLink";
import { h2Class, Section } from "@/components/Section";
import { STEPS } from "@/lib/process";

export function ProcessPreview(): React.ReactElement {
  return (
    <Section index="04" label="Method">
      <h2 className={h2Class}>What happens, step by step</h2>
      <ol className="mt-8 border-b border-vx-hair">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex items-baseline gap-6 border-t border-vx-hair py-4">
            <span className="figure-nums w-8 shrink-0 font-display text-h3 font-medium text-vx-peacock-blue">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-text text-body font-semibold text-vx-ink">{step.title}</span>
          </li>
        ))}
      </ol>
      <ButtonLink href="/how-we-work" variant="text" className="mt-6">
        How it works in full
      </ButtonLink>
    </Section>
  );
}
