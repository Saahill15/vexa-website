export const SITE = {
  name: "Vexa Digital",
  email: "contact@vexadigital.in",
  /** The Grievance Officer named in the Privacy Policy. */
  grievanceEmail: "kaustubh@vexadigital.in",
  /** Full street address: used only in the Privacy Policy and Terms. */
  address: "77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070",
  /** What the rest of the site shows. */
  city: "New Delhi, India",
  instagram: "https://www.instagram.com/vexadigital.in/",
  linkedin: "https://www.linkedin.com/company/vexa-digital-in/",
  founderLinkedin: "https://www.linkedin.com/in/kaustubhsrivastava26/",
} as const;

/** The public address used in metadata (social cards, structured data). Falls back to the production domain so the build never fails without it. */
export const PUBLIC_URL = (process.env.SITE_URL?.trim().replace(/\/+$/, "") || "https://vexadigital.in");

/** The legal entity behind the Vexa Digital trade name (also named in the footer and the FAQ). */
export const LEGAL_ENTITY = "Blue Wings";
export const REGISTERED_ADDRESS = "13 Vrundavan, Nava Wadaj, Ahmedabad 380013";

export const NAV = [
  { href: "/services", label: "Services" },
  { href: "/valuate", label: "Valuate" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
