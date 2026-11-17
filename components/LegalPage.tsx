import type { ReactNode } from "react";
import { headingId } from "@/content/articles";
import { JsonLd } from "./JsonLd";
import { LegalTabs } from "./LegalTabs";
import { breadcrumbs } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Section = { title: string; body: ReactNode };
type Props = { title: string; updated: string; summary: string; current: "privacy" | "terms"; sections: Section[] };

/** Shared layout for the legal pages: heading band, section list beside numbered sections. */
export function LegalPage({ title, updated, summary, current, sections }: Props) {
  return (
    <article className="legal">
      <JsonLd data={breadcrumbs([[title, `/${current}`]])} />
      <header className="art-hero">
        <div className="wrap art-hero-in">
          <LegalTabs current={current} />
          <h1 className="art-h1">{title}</h1>
          <p className="art-dek">{summary}</p>
          <div className="art-meta">
            <span>Last updated {updated}</span>
          </div>
        </div>
      </header>

      <div className="wrap legal-layout">
        <aside className="art-toc legal-toc" aria-label="On this page">
          <span className="art-toc-h">On this page</span>
          <ol>
            {sections.map((s) => (
              <li key={s.title}><a href={`#${headingId(s.title)}`}>{s.title}</a></li>
            ))}
          </ol>
        </aside>

        <div className="legal-main">
          {sections.map((s, i) => (
            <section key={s.title} className="legal-sec" id={headingId(s.title)} aria-labelledby={`${headingId(s.title)}-h`}>
              <span className="legal-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="prose-body">
                <h2 id={`${headingId(s.title)}-h`}>{s.title}</h2>
                {s.body}
              </div>
            </section>
          ))}

          <div className="legal-help">
            <div>
              <h2>Questions about this page?</h2>
              <p>Write to us and we will reply by email.</p>
            </div>
            <a className="btn" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </div>
        </div>
      </div>
    </article>
  );
}
