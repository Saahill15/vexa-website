import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { WordReveal } from "@/components/motion/WordReveal";
import { APPROACH, SERVICES, serviceHref } from "@/lib/services";

type Params = { slug: string };

const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);

export function generateStaticParams(): Params[] {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return { title: service.title, description: service.body };
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const approach = APPROACH[service.audience];
  const group = SERVICES.filter((s) => s.audience === service.audience);
  const next = group[(group.indexOf(service) + 1) % group.length];
  const brief = `/contact?service=${service.slug}#form`;

  return (
    <>
      <header className="svc-hero">
        <div className="wrap">
          <Link className="tl back-link svc-back" href={`/services#${service.audience}`}>All services</Link>
        </div>
        <div className="wrap svc-hero-grid">
          <div className="svc-hero-copy">
            <Reveal><span className="label">{approach.label} · {service.number}</span></Reveal>
            <WordReveal as="h1" className="h1" lines={service.lines} />
            <Reveal delay={0.3}><p className="lede">{service.body}</p></Reveal>
            <Reveal delay={0.4} className="row">
              <Link href={brief} className="btn">Start your brief <span className="arr" aria-hidden="true">→</span></Link>
              <a href="#how" className="btn btn--line">How it works</a>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={28} className="svc-panel">
            <span className="svc-panel-num" aria-hidden="true">{service.number}</span>
            <div className="svc-panel-top">
              <span className="svc-panel-ico"><Icon name={service.icon} size={22} /></span>
              <span>{service.title}</span>
            </div>
            <div className="svc-panel-body">
              <h2>What you receive</h2>
              <ul>
                {service.deliverables.map((item) => (
                  <li key={item}><span className="svc-tick" aria-hidden="true">✓</span>{item}</li>
                ))}
              </ul>
              {service.note ? <p>{service.note}</p> : null}
            </div>
          </Reveal>
        </div>
      </header>

      <section className="sec" id="how" style={{ scrollMarginTop: 70 }} aria-labelledby="how-h">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><span className="label">How it works</span></Reveal>
            <WordReveal className="h2" id="how-h" lines={["Three steps,", "one written scope."]} />
          </div>
          <div className="svc-steps">
            {approach.steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08} className="card svc-step">
                <span className="svc-step-n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="h3">{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </div>

          {service.example ? (
            <Reveal className="svc-example">
              <span className="tag">For example</span>
              <p>{service.example}</p>
              <small>An illustrative scope, not delivered client work.</small>
            </Reveal>
          ) : null}
          <p className="svc-small">{approach.note}</p>
        </div>
      </section>

      <section className="sec svc-end-sec" aria-label="Next step">
        <div className="wrap">
          <div className="svc-end">
            <div className="svc-end-copy">
              <h2 className="h2">Bring us the brief.</h2>
              <p>A few sentences about your goal, audience and timing are enough. We reply by email with the next step.</p>
              <Link href={brief} className="btn btn--white">Start your brief <span className="arr" aria-hidden="true">→</span></Link>
            </div>
            <Link href={serviceHref(next)} className="svc-next">
              <small>Next in {approach.label.toLowerCase()}</small>
              <strong>{next.number} · {next.title}</strong>
              <span>{next.text}</span>
              <span className="svc-next-arr" aria-hidden="true"><Icon name="arrow" size={20} /></span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
