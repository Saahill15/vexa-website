import localFont from "next/font/local";

// Fonts are self hosted from app/fonts so the build never fetches from Google.
// Files come from Fontsource (OFL, licences alongside). The Plex files merge the latin and
// latin-ext subsets so the rupee sign (U+20B9) is covered.
// Fallback stacks live in tailwind.config.ts fontFamily, so none are set here.

// Display face. Its Latin subset has no rupee glyph, so the display stack falls back to Plex
// for the rupee sign (see tailwind.config.ts fontFamily.display) and amounts use <Rupee />.
// Variable font with wght (400 to 900) and opsz axes.
export const display = localFont({
  src: [
    { path: "./fonts/bodoni-moda-latin-opsz-normal.woff2", weight: "400 900", style: "normal" },
    { path: "./fonts/bodoni-moda-latin-opsz-italic.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--font-display",
  adjustFontFallback: false,
  display: "swap",
});

export const text = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/ibm-plex-sans-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/ibm-plex-sans-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-sans-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-text",
  adjustFontFallback: "Arial",
  display: "swap",
});
