import type { FolderTone } from "@/components/cards/FolderCard";
import type { IconName } from "@/components/Icon";

export type Audience = "brands" | "esports";

export type Service = {
  slug: string;
  number: string;
  title: string;
  text: string;
  audience: Audience;
  tone: FolderTone;
  /** Detail page: headline (two lines), body, deliverables and an optional illustrative example. */
  lines: [string, string];
  body: string;
  delivery: string;
  /** The delivery line split into the items a client receives. */
  deliverables: string[];
  /** Optional line on what stays with the client. */
  note?: string;
  icon: IconName;
  example?: string;
};

export const SERVICES: Service[] = [
  {
    slug: "creator-campaigns", number: "01", title: "Creator campaigns", audience: "brands", tone: "teal",
    text: "Content made with gaming creators, built around your product.",
    lines: ["An idea made", "for the format."],
    body: "Give your product a relevant role in content people already choose to watch. We develop the creative idea with suitable gaming creators and define what each will make, where it will appear and how the brand is involved.",
    delivery: "A creative brief, creator shortlist, publishing deliverables and the agreed production schedule.",
    deliverables: ["A creative brief", "A creator shortlist", "Publishing deliverables", "The agreed production schedule"],
    icon: "video",
    example: "A product demonstration within an existing creator format. The proposal names the video, the product’s role and the publishing channel.",
  },
  {
    slug: "team-partnerships", number: "02", title: "Team partnerships", audience: "brands", tone: "ink",
    text: "Campaigns around a team’s players, content and community.",
    lines: ["Work with the people", "fans follow."],
    body: "Build a campaign around a team’s players, original content and community. We assess what the team controls and can deliver, then describe the activity the brand is buying.",
    delivery: "A partnership concept with specific team content, placements, permissions and responsibilities.",
    deliverables: ["A partnership concept", "Specific team content", "Placements and permissions", "Agreed responsibilities"],
    icon: "users",
    example: "A recurring player-led content series. The proposal defines the episodes and brand presence, separately from any tournament broadcast or organiser assets.",
  },
  {
    slug: "tournament-activations", number: "03", title: "Tournament activations", audience: "brands", tone: "mint",
    text: "A clear role for your brand at a live gaming event.",
    lines: ["Give the brand a role", "in the moment."],
    body: "Develop an activation around a competition or live gaming event. We work with the organiser on available assets, production needs and a role that serves the campaign objective.",
    delivery: "An activation plan, organiser responsibilities, required permissions and the agreed event schedule.",
    deliverables: ["An activation plan", "Organiser responsibilities", "Required permissions", "The agreed event schedule"],
    icon: "trophy",
    example: "A product experience during an event. The proposal describes where it happens, how people participate and who is responsible for delivery.",
  },
  {
    slug: "commercial-offer", number: "01", title: "Commercial offer", audience: "esports", tone: "teal",
    text: "Packages a brand can understand, price and buy.",
    lines: ["Make the partnership", "easy to assess."],
    body: "A buyer needs to understand what you can make or provide, why it is relevant and what the commitment involves. We help define the content, placements, timing and rights a brand can buy.",
    delivery: "A proposal that tells a brand what it receives, what it costs and who delivers it, supported by a media kit.",
    deliverables: ["A proposal: what a brand receives", "What it costs and who delivers it", "A supporting media kit"],
    icon: "coin",
    example: "For a team, a player-led video series with agreed brand placements. For an organiser, an event activation using assets you control.",
  },
  {
    slug: "content-and-audience", number: "02", title: "Content and audience", audience: "esports", tone: "ink",
    text: "Repeatable formats and dated evidence a buyer can inspect.",
    lines: ["Build something you", "can keep delivering."],
    body: "Choose repeatable formats around your people and activity. We help develop the content plan and organise audience evidence around the offer, using completed work and dated data.",
    delivery: "A realistic production schedule, named owners and an evidence note a buyer can inspect. Your team continues to record, publish and deliver its commitments.",
    deliverables: ["A realistic production schedule", "Named owners", "An evidence note a buyer can inspect"],
    icon: "chart",
    note: "Your team continues to record, publish and deliver its commitments.",
  },
  {
    slug: "organiser-partnerships", number: "03", title: "Organiser partnerships", audience: "esports", tone: "mint",
    text: "Event assets described with a clear commercial scope.",
    lines: ["An event with a clear", "commercial scope."],
    body: "For tournament organisers, the opportunity starts with the assets and experiences you control. We help describe what each package includes and how production, approvals and reporting would work.",
    delivery: "An event asset inventory and partnership proposal with responsibilities, permissions and timing identified.",
    deliverables: ["An event asset inventory", "A partnership proposal", "Responsibilities, permissions and timing"],
    icon: "calendar",
  },
];

/** How each type of engagement runs, and what it does not include (from the original Brands and Organisations pages). */
export const APPROACH: Record<Audience, { label: string; steps: { title: string; text: string }[]; note: string; cta: string }> = {
  brands: {
    label: "Brand campaigns",
    steps: [
      { title: "Understand the problem", text: "Discuss your product, audience, objective, timing and constraints before choosing a format." },
      { title: "Develop the campaign", text: "A proposal explains the idea, why it fits, the work, partner roles and costs for you to assess." },
      { title: "Coordinate delivery", text: "Once the scope is agreed, we manage partner coordination, approvals and the delivery record." },
    ],
    note: "This is one of the formats a campaign can use. The brief determines which fit.",
    cta: "Discuss a campaign",
  },
  esports: {
    label: "Esports advisory",
    steps: [
      { title: "Bring what you have", text: "What you already publish, the audience evidence you hold and what you have offered brands so far." },
      { title: "Agree a written scope", text: "We discuss the first priorities and who can own the work between reviews. The scope names deliverables, reviews and fee." },
      { title: "Work through the offer", text: "We develop the parts that make the offer clearer, reviewing progress on the agreed schedule." },
    ],
    note: "Sponsor introductions, production and other additional services need their own scope. A sponsorship or income is never guaranteed.",
    cta: "Discuss advisory",
  },
};

export const serviceHref = (s: Service) => `/services/${s.slug}`;
