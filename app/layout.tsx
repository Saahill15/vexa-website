import type { Metadata } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SkipToContent } from "@/components/SkipToContent";
import "./globals.css";

const generalSans = localFont({
  src: [
    { path: "../public/fonts/GeneralSans-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/GeneralSans-Semibold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/GeneralSans-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-general-sans",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "../public/fonts/Inter-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Inter-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Gaming and esports sponsorship in India | VEXA",
    template: "%s | VEXA",
  },
  description:
    "VEXA Digital is an esports and brand partnerships consultancy. We help brands find their fit in gaming, and help teams and creators find the right brand partners.",
  metadataBase: new URL("https://vexadigital.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vexadigital.in",
    siteName: "VEXA",
    title: "Gaming and esports sponsorship in India | VEXA",
    description:
      "VEXA Digital is an esports and brand partnerships consultancy. We help brands find their fit in gaming, and help teams and creators find the right brand partners.",
  },
  twitter: {
    card: "summary",
    title: "Gaming and esports sponsorship in India | VEXA",
    description:
      "VEXA Digital is an esports and brand partnerships consultancy. We help brands find their fit in gaming, and help teams and creators find the right brand partners.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" data-theme="light" className={`${generalSans.variable} ${inter.variable}`}>
      <body className="min-h-[100dvh] bg-vx-cream-50 font-body text-vx-ink-900 antialiased">
        <SkipToContent />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
