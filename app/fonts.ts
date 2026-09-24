import { Bodoni_Moda, IBM_Plex_Sans } from "next/font/google";

// Display face. Its Latin subset has no rupee glyph, so the display stack falls back to Plex
// for the rupee sign (see tailwind.config.ts fontFamily.display) and amounts use <Rupee />.
export const display = Bodoni_Moda({
  subsets: ["latin"],
  axes: ["opsz"],
  weight: "variable",
  style: ["normal", "italic"],
  variable: "--font-display",
  adjustFontFallback: false,
  display: "swap",
});

export const text = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-text",
  display: "swap",
});
