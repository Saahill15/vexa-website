import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Pointer } from "@/components/Pointer";
import "./globals.css";

const display = localFont({
  src: "./fonts/unbounded-latin.woff2",
  weight: "500 700",
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: "./fonts/manrope-latin.woff2",
  weight: "400 700",
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "VEXA Digital | Esports consultancy", template: "%s | VEXA Digital" },
  description:
    "VEXA is an esports consultancy. We help brands succeed in gaming and help esports teams build partnerships brands can buy.",
  openGraph: { type: "website", siteName: "VEXA Digital" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js")' }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Pointer />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
