import { PUBLIC_URL } from "./site";

export const abs = (path: string) => `${PUBLIC_URL}${path}`;

/** A description that fits a search result: cut at a word, with an ellipsis. */
export function snippet(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[.,;:]$/, "") + "…";
}

/** Breadcrumb trail (Home first) for search results. */
export function breadcrumbs(items: [name: string, path: string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [["Home", "/"], ...items].map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
  };
}

export const ORG_ID = `${PUBLIC_URL}/#organization`;
