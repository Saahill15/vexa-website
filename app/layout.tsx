import type { Metadata, Viewport } from "next";
import { display, text } from "@/app/fonts";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SkipToContent } from "@/components/SkipToContent";
import { AUDIENCE_BOOT_SCRIPT } from "@/lib/audience";
import { SITE } from "@/lib/site";
import "./globals.css";

const DESCRIPTION =
  "VEXA Digital is an esports and brand partnerships consultancy. We help brands find their fit in gaming, and help teams and creators find the right brand partners.";
const TITLE = "Gaming and esports sponsorship in India | VEXA";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: TITLE, template: "%s | VEXA" },
  description: DESCRIPTION,
  applicationName: "VEXA Digital",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: "VEXA Digital",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "VEXA Digital, esports and brand partnerships consultancy" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#F7F4EE" };

// COUNSEL TO CONFIRM: legal name and address follow components/entity.ts.
const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VEXA Digital",
  alternateName: "VEXA",
  legalName: "Blue Wings",
  url: SITE.url,
  logo: `${SITE.url}/brand/vexa-logo.png`,
  email: SITE.email,
  telephone: "+919958895505",
  description: DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    streetAddress: "77A, LGF, Bhawani Kunj, Sector D-2",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    postalCode: "110070",
    addressCountry: "IN",
  },
  areaServed: "IN",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="en-IN" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: AUDIENCE_BOOT_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }} />
      </head>
      <body className="min-h-[100dvh] bg-vx-paper font-text text-body text-vx-ink">
        <SkipToContent />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
