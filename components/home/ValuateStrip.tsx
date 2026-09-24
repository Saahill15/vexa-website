import { ButtonLink } from "@/components/ButtonLink";
import { bodyClass, h2Class, Section } from "@/components/Section";

export function ValuateStrip(): React.ReactElement {
  return (
    <Section
      segment="HOME-07"
      label="Valuate"
      className="holders-first"
      index={
        <>
          <span className="idx-default">06</span>
          <span className="idx-holders">05</span>
        </>
      }
    >
      <h2 className={h2Class}>Check if a creator deal is fair before you sign</h2>
      <p className={`mt-6 ${bodyClass}`}>
        Valuate is a separate, free product from VEXA. Enter a creator&apos;s followers, typical views and the offer on the
        table, and it shows a fair price range and where the offer sits in it.
      </p>
      <ButtonLink href="/valuate" variant="text" className="mt-4">
        About Valuate
      </ButtonLink>
    </Section>
  );
}
