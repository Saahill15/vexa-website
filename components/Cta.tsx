import { SITE } from "@/lib/site";
import { Button } from "./Button";
import { Reveal } from "./Reveal";
import { Split } from "./Split";

export function Cta({ children }: { children: string }) {
  return (
    <section className="sec cta" aria-labelledby="cta-h">
      <div className="wrap">
        <Split as="h2" className="h-xl" id="cta-h">{children}</Split>
        <Reveal className="row" delay={200}>
          <Button href="/contact">Say hello</Button>
        </Reveal>
        <Reveal as="a" className="bigmail" href={`mailto:${SITE.email}`} delay={300}>{SITE.email}</Reveal>
      </div>
    </section>
  );
}
