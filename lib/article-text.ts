import type { Block } from "@/content/articles";

/*
 * The plain-text way of writing an article in the admin editor, shared by the editor and the server:
 *   a blank line starts a new paragraph        ## Heading        > A pull quote        - list item (one per line)
 */

export function textToBlocks(text: string): Block[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): Block => {
      if (chunk.startsWith("## ")) return { type: "h2", text: chunk.slice(3).replace(/\s*\n\s*/g, " ").trim() };
      if (chunk.startsWith("> ")) return { type: "quote", text: chunk.replace(/^>\s?/gm, "").replace(/\s*\n\s*/g, " ").trim() };
      const lines = chunk.split("\n").map((l) => l.trim());
      if (lines.every((l) => l.startsWith("- "))) return { type: "list", items: lines.map((l) => l.slice(2).trim()).filter(Boolean) };
      return { type: "p", text: chunk.replace(/\s*\n\s*/g, " ") };
    })
    .filter((b) => (b.type === "list" ? b.items.length > 0 : b.text.length > 0));
}

export function blocksToText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (b.type === "h2") return `## ${b.text}`;
      if (b.type === "quote") return `> ${b.text}`;
      if (b.type === "list") return b.items.map((i) => `- ${i}`).join("\n");
      return b.text;
    })
    .join("\n\n");
}
