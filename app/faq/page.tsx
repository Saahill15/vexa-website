import type { Metadata } from "next";
import Link from "next/link";
import { FAQ } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Vexa Digital, our services, how an engagement works and what we do not promise.",
};

export default function FaqPage() {
  // structured data so search engines can show these questions directly
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="xl-head">
        <div className="wrap">
          <span className="label">FAQ</span>
          <h1 className="xl-title">Questions, <span className="tt-2">answered.</span></h1>
          <p className="lede">The common questions about our services, how we work and what to expect. Something missing? Ask us directly.</p>
        </div>
      </header>

      <section className="xl-sec" aria-label="Questions and answers">
        <div className="wrap">
          <div className="faq-page-list">
            {FAQ.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>

          <div className="legal-help faq-cta-card">
            <div>
              <h2>Still have a question?</h2>
              <p>Tell us what you are working on and we will reply by email.</p>
            </div>
            <Link className="btn" href="/contact">Start a conversation <span className="arr" aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
