import sanitizeHtml from "sanitize-html";
import { headingId, type Block } from "@/content/articles";

/*
 * Rich text for articles, as written in the admin editor (same approach as the press council site's news editor):
 * the editor produces HTML, the server cleans it on save and again before showing it. Only the tags below survive.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "hr", "h2", "h3", "strong", "em", "u", "s", "ul", "ol", "li", "blockquote", "a"],
  allowedAttributes: { a: ["href", "title", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: {
    b: "strong",
    i: "em",
    h1: "h2",
    h4: "h3",
    a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" } }),
  },
};

export const sanitizeArticleHtml = (html: string): string => sanitizeHtml(html ?? "", OPTIONS);

const decode = (t: string) => t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const escape = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Plain text of some HTML. */
export const htmlText = (html: string): string => decode(sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })).replace(/\s+/g, " ").trim();

const VOID = new Set(["br", "hr"]);

/** The top-level blocks of sanitised HTML (a paragraph, a heading, a whole list…). The sign-in wall counts these. */
export function topLevel(html: string): string[] {
  const out: string[] = [];
  const tag = /<(\/?)([a-z0-9]+)\b[^>]*?(\/?)>/gi;
  let depth = 0;
  let start = -1;
  for (let m = tag.exec(html); m; m = tag.exec(html)) {
    const closing = m[1] === "/";
    const self = m[3] === "/" || VOID.has(m[2].toLowerCase());
    if (!closing) {
      if (depth === 0) start = m.index;
      if (self) {
        if (depth === 0) { out.push(m[0]); start = -1; }
      } else depth++;
    } else {
      depth--;
      if (depth === 0 && start >= 0) { out.push(html.slice(start, m.index + m[0].length)); start = -1; }
    }
  }
  return out;
}

/** Headings (h2/h3) with an anchor id, and which top-level block each sits in. */
export function headingsOf(pieces: string[]): { text: string; id: string; index: number }[] {
  return pieces.flatMap((p, index) => {
    const m = /^<h[23]>([\s\S]*?)<\/h[23]>$/.exec(p);
    return m ? [{ text: htmlText(m[1]), id: headingId(htmlText(m[1])), index }] : [];
  });
}

/** Adds the anchor ids the "In this article" list links to. */
export const withHeadingIds = (html: string): string =>
  html.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (_m, tag: string, inner: string) => `<${tag} id="${headingId(htmlText(inner))}">${inner}</${tag}>`);

/** The same content as simple blocks, for reading time and for older code that reads `blocks`. */
export function htmlToBlocks(html: string): Block[] {
  return topLevel(html).flatMap((p): Block[] => {
    const text = htmlText(p);
    if (/^<h[23]/.test(p)) return text ? [{ type: "h2", text }] : [];
    if (/^<blockquote/.test(p)) return text ? [{ type: "quote", text }] : [];
    if (/^<[uo]l/.test(p)) {
      const items = [...p.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => htmlText(m[1])).filter(Boolean);
      return items.length ? [{ type: "list", items }] : [];
    }
    if (/^<hr/.test(p)) return [];
    return text ? [{ type: "p", text }] : [];
  });
}

/** Older articles (stored as blocks) opened in the new editor. */
export function blocksToHtml(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (b.type === "h2") return `<h2>${escape(b.text)}</h2>`;
      if (b.type === "quote") return `<blockquote><p>${escape(b.text)}</p></blockquote>`;
      if (b.type === "list") return `<ul>${b.items.map((i) => `<li><p>${escape(i)}</p></li>`).join("")}</ul>`;
      return `<p>${escape(b.text)}</p>`;
    })
    .join("");
}
