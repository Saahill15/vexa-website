export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO date
  /** How many blocks anonymous visitors can read before the sign-in wall. */
  previewBlocks: number;
  blocks: Block[];
};

// Placeholder editorial content. Replace with real articles when they are ready.
export const ARTICLES: Article[] = [
  {
    slug: "what-a-brand-buys-in-an-esports-partnership",
    title: "What a brand actually buys in an esports partnership",
    excerpt: "“Exposure” hides everything that matters. A useful partnership is a list of specific things, each with an owner.",
    category: "Brands",
    date: "2026-10-12",
    previewBlocks: 4,
    blocks: [
      { type: "p", text: "When a brand signs a partnership with an esports team, it is easy to say it is buying “exposure”. That word hides almost everything that matters. A useful partnership is a list of specific things: what gets made, where it appears, who does the work and what the brand is allowed to do with it." },
      { type: "p", text: "The brands that are happiest a year later are usually the ones that could describe their deal in a few plain sentences on day one. The ones that are disappointed usually bought a feeling, and found out later that nobody had agreed what the feeling was made of." },
      { type: "h2", text: "Start with the deliverable, not the audience" },
      { type: "p", text: "Audience size is the first number everyone asks for and the least useful one on its own. It tells you who might see something, not what you will receive. Begin instead with the work: a video, a series, a placement during a broadcast, an appearance at an event. Each of those can be described, scheduled and checked." },
      { type: "h2", text: "Be clear about what the team controls" },
      { type: "p", text: "A team can only sell what it actually controls. That usually falls into a few groups:" },
      { type: "list", items: ["Content its players or creators make and publish on their own channels.", "Placements on assets the team owns, such as jerseys, streams or social posts.", "Appearances or activities involving players, scheduled in advance.", "Rights to reuse the content, and for how long."] },
      { type: "h2", text: "Separate the team from the tournament" },
      { type: "p", text: "A common source of confusion is mixing what a team offers with what a tournament organiser offers. Broadcast placements, on-site branding and event activations belong to the organiser. If a campaign depends on them, the organiser needs to be part of the conversation, with its own responsibilities written down." },
      { type: "quote", text: "A partnership a brand can understand is one where every line says what happens, where, and by whom." },
      { type: "h2", text: "Write the scope down" },
      { type: "p", text: "Before money moves, put the scope in writing: the deliverables, the dates, the approvals, the rights and who is responsible for each piece. It is not paperwork for its own sake. It is the only version of the deal that both sides will remember the same way." },
      { type: "p", text: "If you can read the scope aloud to a colleague who was not in the meeting and they understand exactly what the brand is getting, you have a partnership worth signing." },
    ],
  },
  {
    slug: "pricing-a-gaming-creator-deal",
    title: "Pricing a gaming creator deal: where to start",
    excerpt: "There is no single rate card for a creator. Here is a way to think about what a deal contains before you put a number on it.",
    category: "Creators",
    date: "2026-10-05",
    previewBlocks: 4,
    blocks: [
      { type: "p", text: "“What should I charge?” is the question creators ask most, and the honest answer is that it depends on what is being asked of you. A single mention and a month-long integration are different jobs, even if they share a hashtag." },
      { type: "p", text: "A good price starts from a clear description of the work. Before you think about a number, write down exactly what the brand will receive. Most of the pricing conversation is really a scope conversation in disguise." },
      { type: "h2", text: "Describe the work first" },
      { type: "p", text: "Break the deal into parts you can name: the format (a dedicated video, a segment inside a stream, a short clip), the number of pieces, the channels they will appear on and the timeline. If you cannot say it in a sentence, the brief is not ready." },
      { type: "h2", text: "Think about effort and rights" },
      { type: "p", text: "Two things change a price more than almost anything else. The first is effort: scripting, filming, editing and revisions all take time that is not spent on your regular content. The second is rights: if the brand wants to reuse your video in its own advertising, or keep it exclusive to a category, you are giving up something that has value." },
      { type: "list", items: ["Production time, including revisions the brand asks for.", "How long the content must stay live.", "Whether the brand can reuse or promote it.", "Whether you are agreeing not to work with competitors."] },
      { type: "h2", text: "Use your own history" },
      { type: "p", text: "Your past work is the most honest evidence you have. Look at how similar content performed for you, not for someone else, and be ready to share what you can. A brand that sees consistent results can make a decision with confidence." },
      { type: "quote", text: "The number matters less than the clarity of what it covers." },
      { type: "h2", text: "Leave room to talk" },
      { type: "p", text: "Start from a reasoned figure and be open about what is included. If the brand needs more, the conversation is about adding scope, not simply lowering the price." },
    ],
  },
  {
    slug: "building-a-business-around-an-esports-team",
    title: "Building a business around an esports team",
    excerpt: "Winning matches and building a business are different skills. Start with what you can reliably deliver to someone who pays.",
    category: "Esports",
    date: "2026-09-28",
    previewBlocks: 4,
    blocks: [
      { type: "p", text: "Most esports teams begin with a simple goal: play well. The business around the team tends to arrive later and a little by accident, usually as a sponsorship conversation that starts before anyone has decided what the team can actually offer." },
      { type: "p", text: "It helps to turn the question around. Instead of asking who might sponsor you, ask what you could deliver, week after week, that someone would reasonably pay for. The answer is the beginning of a commercial offer." },
      { type: "h2", text: "Find the things you can repeat" },
      { type: "p", text: "A one-off idea is exciting but hard to sell. A repeatable format is easier to plan, easier to price and easier for a brand to trust. Think about the content your team already makes, and the parts of it that could happen on a regular schedule." },
      { type: "h2", text: "Show evidence, not just reach" },
      { type: "p", text: "Brands want to know what happened the last time. Keep a simple record of what you published, when, and how it did. A short note with dated results is more convincing than a large number with no context." },
      { type: "list", items: ["What you made and when you published it.", "Where it appeared and how people responded.", "Who on the team is responsible for delivering it.", "How often you can realistically repeat it."] },
      { type: "h2", text: "Package it so it is easy to say yes to" },
      { type: "p", text: "A buyer should be able to understand your offer in a few minutes: what they receive, what it costs and who delivers it. A short, clear proposal beats a long deck every time." },
      { type: "quote", text: "Make it easy for someone to explain your offer to their boss." },
      { type: "h2", text: "Do not promise what you do not control" },
      { type: "p", text: "Be honest about the limits. Tournament placements, broadcast time and results are not entirely in a team’s hands. Offer what you can deliver, and be careful with anything that depends on other people." },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function readingMinutes(article: Article): number {
  const words = article.blocks
    .map((b) => (b.type === "list" ? b.items.join(" ") : b.text))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
