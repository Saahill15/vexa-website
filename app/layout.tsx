import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { SiteShell } from "@/components/SiteShell";
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

export const metadata: Metadata = {
  title: { default: "Vexa Digital | Esports consultancy", template: "%s | Vexa Digital" },
  description:
    "Vexa is an esports consultancy. We develop brand campaigns in gaming and help esports teams build partnerships brands can buy.",
  openGraph: { type: "website", siteName: "Vexa Digital" },
};

export const viewport: Viewport = { themeColor: "#F5FAFA" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <SiteShell footer={<Footer />}>{children}</SiteShell>
      </body>
    </html>
  );
}
