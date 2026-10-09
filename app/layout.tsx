import type { Metadata, Viewport } from "next";
import { text } from "@/app/fonts";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SkipToContent } from "@/components/SkipToContent";
import { SITE } from "@/lib/site";
import "./globals.css";

const DESCRIPTION =
  "VEXA develops brand campaigns with gaming creators, esports teams and tournaments, and helps esports organisations build their commercial offer.";
const TITLE = "Gaming campaigns and esports business advisory | VEXA";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: TITLE, template: "%s | VEXA" },
  description: DESCRIPTION,
  applicationName: "VEXA Digital",
  icons: { icon: "/brand/open-feather-favicon.svg" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: "VEXA Digital",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "VEXA, gaming campaigns and esports business advisory" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/opengraph-image"] },
  robots: { index: process.env.VEXA_PREVIEW !== "1", follow: process.env.VEXA_PREVIEW !== "1" },
};

export const viewport: Viewport = { themeColor: "#F7F5EF" };

// COUNSEL TO CONFIRM: legal name and address follow components/entity.ts.
const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VEXA Digital",
  alternateName: "VEXA",
  legalName: "Blue Wings",
  url: SITE.url,
  logo: `${SITE.url}/brand/open-feather-lockup-primary.svg`,
  email: SITE.email,
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
    <html lang="en-IN" className={text.variable} suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }} />
      </head>
      <body className="min-h-[100dvh] bg-vx-paper font-text text-body text-vx-ink">
        <SkipToContent />
        {process.env.VEXA_PREVIEW === "1" ? <div className="preview-notice">Website preview for review. Test submissions stay on this Mac.</div> : null}
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
