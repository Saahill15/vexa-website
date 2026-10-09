import localFont from "next/font/local";

// Fonts are self hosted from app/fonts so the build never fetches from Google.
// Files come from Fontsource (OFL, licences alongside). The Plex files merge the latin and
// latin-ext subsets so the rupee sign (U+20B9) is covered.
// Fallback stacks live in tailwind.config.ts fontFamily, so none are set here.

export const text = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-text",
  adjustFontFallback: "Arial",
  display: "swap",
});
