import { Fragment } from "react";

export type LegalBlock =
  | { t: "h2" | "h3" | "p"; text: string }
  | { t: "ul"; items: { text: string; counsel?: boolean }[] }
  | { t: "kv"; rows: [string, string][] };

const EMAIL = "partnerships@vexadigital.in";

const linkClass =
  "rounded-sm font-medium text-vx-accent-500 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500";

function Text({ text }: { text: string }): React.ReactElement {
  const parts = text.split(EMAIL);
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 ? (
            <a href={`mailto:${EMAIL}`} className={linkClass}>
              {EMAIL}
            </a>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}

export function LegalBlocks({ blocks }: { blocks: readonly LegalBlock[] }): React.ReactElement {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.t) {
          case "h2":
            return (
              <h2
                key={index}
                className="mt-8 font-display text-xl font-semibold tracking-tight text-vx-cream-50 first:mt-0"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={index} className="mt-5 font-display text-lg font-semibold tracking-tight text-vx-cream-50">
                {block.text}
              </h3>
            );
          case "p":
            return (
              <p key={index} className="mt-3">
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
              <dl key={index} className="space-y-4 rounded-lg border border-vx-charcoal-600 bg-vx-charcoal-800 p-6">
                {block.rows.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium uppercase tracking-[0.18em] text-vx-neutral-400">
                      {label}
                    </dt>
                    <dd className="mt-1 text-vx-cream-50">
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
