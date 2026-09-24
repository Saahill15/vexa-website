// Five primary items (DESIGN.md section 6, Header). Costs and Valuate live in the footer.
export const NAV = [
  { href: "/#for-brands", label: "For brands" },
  { href: "/#for-teams-and-creators", label: "For teams and creators" },
  { href: "/how-we-work", label: "How it works" },
  { href: "/proof", label: "Proof" },
  { href: "/about", label: "About" },
] as const;

export const FOOTER_GROUPS = [
  {
    title: "Work with us",
    links: [
      { href: "/#for-brands", label: "For brands" },
      { href: "/#for-teams-and-creators", label: "For teams and creators" },
      { href: "/#costs", label: "Costs" },
      { href: "/valuate", label: "Valuate" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/how-we-work", label: "How it works" },
      { href: "/proof", label: "Proof" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
] as const;
