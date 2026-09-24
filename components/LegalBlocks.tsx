import { Fragment } from "react";
import { SITE } from "@/lib/site";

export type LegalBlock =
  | { t: "h2" | "h3"; text: string }
  | { t: "p"; text: string; counsel?: boolean }
  | { t: "ul"; items: { text: string; counsel?: boolean }[] }
  | { t: "kv"; rows: [string, string][] };

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Text({ text }: { text: string }): React.ReactElement {
  const parts = text.split(SITE.email);
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 ? (
            <a href={`mailto:${SITE.email}`} className="vx-link font-medium text-vx-ink">
              {SITE.email}
            </a>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}

/** Plain legal typography: H2 in Plex 600 22px, numbered, body at 17px with a 68ch measure. */
export function LegalBlocks({ blocks, numbers, intro = false }: { blocks: readonly LegalBlock[]; numbers?: Map<string, number>; intro?: boolean }): React.ReactElement {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.t) {
          case "h2": {
            const number = numbers?.get(block.text);
            return (
              <h2 key={index} id={slugify(block.text)} className="mt-12 scroll-mt-24 font-text text-[22px] font-semibold leading-snug text-vx-ink first:mt-0">
                {number ? <span className="figure-nums mr-3 text-vx-peacock-blue">{number}</span> : null}
                {block.text}
              </h2>
            );
          }
          case "h3":
            if (intro) {
              return (
                <h2 key={index} className="mt-6 font-text text-body font-semibold text-vx-ink">
                  {block.text}
                </h2>
              );
            }
            return (
              <h3 key={index} className="mt-6 font-text text-body font-semibold text-vx-ink">
                {block.text}
              </h3>
            );
          case "p":
            return (
              <p key={index} className="mt-3" data-counsel={block.counsel ? "true" : undefined}>
                <Text text={block.text} />
              </p>
            );
          case "ul":
            return (
              <ul key={index} className="mt-3 list-disc space-y-2 pl-6">
                {block.items.map((item) => (
                  <li key={item.text} data-counsel={item.counsel ? "true" : undefined}>
                    <Text text={item.text} />
                  </li>
                ))}
              </ul>
            );
          case "kv":
            return (
              <dl key={index} className="mt-3 divide-y divide-vx-hair border border-vx-ink" data-counsel="true">
                {block.rows.map(([label, value]) => (
                  <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <dt className="vx-label pt-1 text-vx-muted">{label}</dt>
                    <dd className="text-vx-ink">
                      <Text text={value} />
                    </dd>
                  </div>
                ))}
              </dl>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
