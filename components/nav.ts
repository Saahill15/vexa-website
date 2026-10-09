export const NAV = [
  { href: "/services", label: "Services", group: "services" },
  { href: "/learn", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/valuate", label: "Valuate" },
  { href: "/contact", label: "Contact" },
] as const;
export const AUDIENCE_LINKS = {
  services: { label: "Services", intro: "Choose the service for your business.", href: "/services", links: [
    { href: "/brands", label: "Brand campaigns", description: "From your business problem to a campaign in gaming." },
    { href: "/organisations", label: "Esports advisory", description: "Help teams and organisers build partnerships brands can buy." },
  ] },
} as const;
export const FOOTER_GROUPS = [
  { title: "VEXA", links: [{ href: "/brands", label: "Brand campaigns" }, { href: "/organisations", label: "Esports advisory" }, { href: "/about", label: "About" }] },
  { title: "Explore", links: [{ href: "/learn", label: "Articles" }, { href: "/valuate", label: "Valuate" }, { href: "/account", label: "Your account" }] },
] as const;
