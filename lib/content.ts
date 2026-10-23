type FaqItem = { q: string; a: string };
import { SITE } from "./site";

export const FAQ: FaqItem[] = [
  {
    q: "What does Vexa do?",
    a: "Vexa is an esports consultancy. We develop brand campaigns in gaming, and we help esports teams and tournament organisers turn their work into partnerships a brand can understand and buy.",
  },
  {
    q: "Do I need a finished brief to get in touch?",
    a: "No. A few sentences about what you are working on are enough to start. A finished brief and sensitive budget details are optional in the first conversation.",
  },
  {
    q: "How does an engagement work?",
    a: "We start by understanding the problem, audience and timing. We then share a proposal that explains the idea, the partners, the work and the costs. Once the scope is agreed in writing, we coordinate delivery.",
  },
  {
    q: "Do you guarantee sponsorships or income?",
    a: "No. We help define a clear offer and the plan behind it, but a sponsorship or income is never guaranteed.",
  },
  {
    q: "Who are agreements and invoices with?",
    a: "Vexa Digital is a trade name of Blue Wings. Agreements for our services are made with Blue Wings, and invoices are issued by Blue Wings.",
  },
  {
    q: "Where are you based?",
    a: `Our operating office is in New Delhi: ${SITE.address}.`,
  },
];

export const WHY = [
  { title: "Built by a player", text: "Founded by a former competitive player and in-game leader, so the thinking starts from how gaming actually works.", icon: "player", tone: "teal" },
  { title: "Clear proposals", text: "What gets made, where it appears, who does the work and what it costs, before anything is signed.", icon: "doc", tone: "plain" },
  { title: "Scope in writing", text: "Deliverables, approvals, permissions and rights agreed up front.", icon: "check", tone: "plain" },
  { title: "Coordinated delivery", text: "We manage partner coordination and approvals, and keep a record of what was delivered.", icon: "flow", tone: "plain" },
] as const;

export const TEAM = [
  {
    chip: "01 — Founder",
    name: ["Kaustubh", "Srivastava"],
    role: "Founder and strategist",
    photo: "/img/team/ks.svg",
    bio: "Known as Soda. A former competitive player and in-game leader in PUBG Mobile and BGMI, he leads campaign thinking and commercial decisions at Vexa.",
    link: { label: "LinkedIn", href: SITE.founderLinkedin, external: true },
  },
  {
    chip: "02 — Research",
    name: ["Pratham", "Asknani"],
    role: "Research and business administration",
    photo: "/img/team/pa.svg",
    bio: "Researches brands and their activity in gaming to prepare informed campaign conversations, and handles invoicing and vendor registration for each engagement.",
    link: { label: "Get in touch", href: "/contact", external: false },
  },
  {
    chip: "03 — Design",
    name: ["Bhaskar"],
    role: "Design and video editing",
    photo: "/img/team/b.svg",
    bio: "Builds Vexa’s presentation decks, brand assets and the short videos made from Kaustubh’s teaching, keeping every idea clear across channels.",
    link: { label: "Get in touch", href: "/contact", external: false },
  },
] as const;
