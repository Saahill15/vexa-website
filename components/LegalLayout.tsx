import { LegalBlocks, slugify, type LegalBlock } from "@/components/LegalBlocks";

type Props = {
  title: string;
  segment: string;
  intro: readonly LegalBlock[];
  sections: readonly { id: string; blocks: readonly LegalBlock[] }[];
};

/**
 * Legal page layout (DESIGN.md section 6): a sticky table of contents in the rail on large
 * screens, a collapsible "On this page" on phones, and the document in the text span.
 */
export function LegalLayout({ title, segment, intro, sections }: Props): React.ReactElement {
  const headings = sections.flatMap((section) => section.blocks.filter((block) => block.t === "h2").map((block) => (block as { text: string }).text));
  const numbers = new Map(headings.map((text, index) => [text, index + 1]));

  const toc = (
    <ol className="space-y-1 font-text text-small">
      {headings.map((text, index) => (
        <li key={text}>
          <a href={`#${slugify(text)}`} className="flex min-h-[36px] items-baseline gap-2 rounded-sm py-1 text-vx-ink-2 hover:text-vx-ink hover:underline">
            <span className="figure-nums w-5 shrink-0 text-vx-peacock-blue">{index + 1}</span>
            <span>{text}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="vx-container vx-grid pb-24 pt-12 md:pt-20 lg:pb-32 lg:pt-28">
      <aside className="col-span-full lg:col-span-3" aria-label="On this page">
        {headings.length > 0 ? (
          <>
            <details className="border-y border-vx-hair lg:hidden">
              <summary className="flex min-h-[48px] cursor-pointer items-center font-text text-small font-semibold">On this page</summary>
              <div className="pb-4">{toc}</div>
            </details>
            <div className="hidden lg:sticky lg:top-24 lg:block">
              <p className="vx-label mb-4 text-vx-muted">On this page</p>
              {toc}
            </div>
          </>
        ) : null}
      </aside>
      <article className="col-span-full mt-10 lg:col-span-7 lg:col-start-4 lg:mt-0">
        <header data-segment={segment}>
          <h1 className="font-display text-display-xl font-normal text-vx-ink">{title}</h1>
          <div className="mt-8 max-w-[68ch] font-text text-body text-vx-ink-2">
            <LegalBlocks blocks={intro} intro />
          </div>
          <p className="mt-8 max-w-[68ch] border-l-2 border-vx-peacock-blue py-1 pl-4 font-text text-small text-vx-ink-2">
            Drafted as points for counsel to confirm.
          </p>
        </header>
        <div className="mt-12 max-w-[68ch] space-y-10 font-text text-body text-vx-ink-2">
          {sections.map((section) => (
            <section key={section.id} data-segment={section.id}>
              <LegalBlocks blocks={section.blocks} numbers={numbers} />
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
