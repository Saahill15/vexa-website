import { ButtonLink } from "@/components/ButtonLink";
import { ProofLedger } from "@/components/ProofLedger";
import { h2Class, Section } from "@/components/Section";

export function WhereWeStand(): React.ReactElement {
  return (
    <Section index="03" label="Proof" wide>
      <h2 className={h2Class}>Our track record so far</h2>
      <div className="mt-10">
        <ProofLedger compact />
      </div>
      <ButtonLink href="/proof" variant="text" className="mt-6">
        See the full record
      </ButtonLink>
    </Section>
  );
}
