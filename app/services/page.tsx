import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Cta } from "@/components/Cta";
import { Reveal } from "@/components/Reveal";
import { Split } from "@/components/Split";

export const metadata: Metadata = {
  title: "Services",
  description: "Brand campaigns in gaming, and business advisory for esports teams and tournament organisers.",
};

type Item = { title: string; text: string };

function Mini({ items }: { items: Item[] }) {
  return (
    <ul className="mini">
      {items.map((item, i) => (
        <Reveal as="li" key={item.title} delay={i * 100}>
          <h3 className="h-md">{item.title}</h3>
          <p>{item.text}</p>
        </Reveal>
      ))}
    </ul>
  );
}

export default function ServicesPage() {
  return (
    <>
      <header className="phero">
        <div className="wrap">
          <Reveal as="p" className="tag">Services</Reveal>
          <Split as="h1" className="h-xl" style={{ fontSize: "clamp(2.3rem,6.6vw,6rem)" }}>What we do.</Split>
          <Reveal className="jump" delay={400}>
            <a href="#brands">For brands</a>
            <a href="#esports">For esports teams and organisers</a>
          </Reveal>
        </div>
      </header>

      <section className="sec--tight sec" style={{ paddingTop: 0, scrollMarginTop: 90 }} id="brands" aria-labelledby="b-h">
        <div className="wrap">
          <div className="sec-head">
            <Reveal as="p" className="tag">01 · For brands</Reveal>
            <Split as="h2" className="h-lg" id="b-h">A place in gaming.</Split>
            <Reveal as="p" className="lede" delay={200}>
              We develop a campaign around your goal, choose the right gaming partners and manage delivery.
            </Reveal>
          </div>
          <Mini
            items={[
              { title: "Creator campaigns", text: "Content made with gaming creators." },
              { title: "Team partnerships", text: "Campaigns built around a team’s players and content." },
              { title: "Tournament activations", text: "A role for your brand at a live event." },
            ]}
          />
          <Reveal className="row" style={{ marginTop: 36 }}>
            <Button href="/contact?as=brand">Discuss a campaign</Button>
          </Reveal>
        </div>
      </section>

      <section className="sec--tight sec" style={{ paddingTop: 0, scrollMarginTop: 90 }} id="esports" aria-labelledby="e-h">
        <div className="wrap">
          <div className="sec-head">
            <Reveal as="p" className="tag">02 · For esports teams and organisers</Reveal>
            <Split as="h2" className="h-lg" id="e-h">A business around the game.</Split>
            <Reveal as="p" className="lede" delay={200}>
              We help define what a brand can buy from you, and build the proposal behind it.
            </Reveal>
          </div>
          <Mini
            items={[
              { title: "Commercial offer", text: "Packages a brand can understand." },
              { title: "Content and audience", text: "Repeatable formats and clear evidence." },
              { title: "Organiser partnerships", text: "Event assets with a clear scope." },
            ]}
          />
          <Reveal className="row" style={{ marginTop: 36 }}>
            <Button href="/contact?as=organisation">Discuss esports advisory</Button>
          </Reveal>
        </div>
      </section>

      <Cta>Tell us your *goal.*</Cta>
    </>
  );
}
