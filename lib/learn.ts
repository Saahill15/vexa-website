import { teamOrTournament } from "@/content/learn/team-or-tournament";
import { moneyMap } from "@/content/learn/money-map";
import { pageCheck } from "@/content/learn/page-check";

import { esportsBusinessModel } from "@/content/learn/esports-business-model";

export type SeriesKey = "money-math" | "brands-eye" | "when-a-brand-says" | "industry";

export const SERIES: Record<SeriesKey, { label: string; blurb: string }> = {
  "industry": { label: "Industry and business", blurb: "Ownership, revenue and the business around competition." },
  "money-math": { label: "Running a team", blurb: "Income, costs and the work a team can sustain." },
  "brands-eye": { label: "Partnerships", blurb: "What a brand receives and how to make the offer clear." },
  "when-a-brand-says": { label: "Audience & content", blurb: "What your content and its evidence can tell a partner." },
};

export type Step = {
  title: string;
  body: string[];
  /** One action the reader can do today. */
  doThisNow?: string;
};

export type Article = {
  slug: string;
  series: SeriesKey;
  /** The question the viewer asked. It is the page title. */
  question: string;
  /** The answer in one or two sentences. */
  answer: string;
  /** ISO date. Newest first in the library. */
  published: string;
  /** YouTube or Instagram embed URL. Left empty until the video exists; nothing renders without it. */
  videoUrl?: string;
  /** Read by everyone, search engines included. */
  free: Step[];
  /** The substantial continuation, read after signing in. */
  full: Step[];
  /** Primary sources supporting numbered citations within the article. */
  sources?: { title: string; url: string; note?: string }[];
  /** Said plainly at the bottom of every article. */
  honestLine: string;
  /** A relevant next article or service, described plainly. */
  next: { label: string; href: string; text: string };
};

export const ARTICLES: Article[] = [esportsBusinessModel, teamOrTournament, pageCheck, moneyMap].sort((a, b) => b.published.localeCompare(a.published));

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function articleReadTime(article: Article): number {
  const words = [...article.free, ...article.full].flatMap(section => [section.title, ...section.body, section.doThisNow || ""]).join(" ").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 170));
}

export function articleDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));
}
