import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { SiteShell } from "@/components/SiteShell";
import { PUBLIC_URL } from "@/lib/site";
import "lenis/dist/lenis.css";
import "./globals.css";

// DM Sans for headings, Inter for body text. next/font downloads both at build time and serves them from the site.
const display = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const DESCRIPTION =
  "Vexa is an esports consultancy. We develop brand campaigns in gaming and help esports teams and tournament organisers build partnerships brands can buy.";

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_URL),
  title: { default: "Vexa Digital | Esports consultancy for brands and teams", template: "%s | Vexa Digital" },
  description: DESCRIPTION,
  applicationName: "Vexa Digital",
  authors: [{ name: "Vexa Digital" }],
  keywords: ["esports consultancy", "gaming brand campaigns", "esports sponsorship", "creator campaigns", "tournament activations", "India"],
  alternates: { canonical: "./", languages: { "en-IN": "./" }, types: { "application/rss+xml": "/feed.xml" } },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { type: "website", siteName: "Vexa Digital", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#064B4A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <SiteShell footer={<Footer />} analyticsToken={process.env.CF_ANALYTICS_TOKEN || undefined}>{children}</SiteShell>
      </body>
    </html>
  );
}
