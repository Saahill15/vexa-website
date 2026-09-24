import type { Config } from "tailwindcss";

// Every colour here is defined in DESIGN.md section 4 and BRAND_COLOURS.md. Do not add others.
const config: Config = {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vx: {
          paper: "#F7F4EE",
          stone: "#EDE7DC",
          white: "#FFFFFF",
          ink: { DEFAULT: "#17140F", 2: "#3A342C" },
          muted: "#655D52",
          hair: "#D9D0C1",
          accent: { 500: "#FF681F", 600: "#F25A10", deep: "#B83C00" },
          peacock: { blue: "#0B4F6C", teal: "#0F7B6C", "teal-deep": "#0B6559" },
          feather: { gold: "#C9A227", "gold-deep": "#8A6A10" },
          error: "#B3261E",
        },
      },
      fontFamily: {
        // Plex sits second in the display stack so glyphs Bodoni lacks (the rupee sign) render in Plex.
        display: ["var(--font-display)", "var(--font-text)", "Georgia", "serif"],
        text: ["var(--font-text)", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.25rem, 1.4rem + 3.6vw, 4rem)", { lineHeight: "1.04", letterSpacing: "-0.01em" }],
        "display-l": ["clamp(1.75rem, 1.3rem + 1.9vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.005em" }],
        figure: ["clamp(2.75rem, 2rem + 3vw, 4.5rem)", { lineHeight: "1" }],
        quote: ["clamp(1.5rem, 1.2rem + 1.3vw, 2.125rem)", { lineHeight: "1.25" }],
        h3: ["clamp(1.1875rem, 1.1rem + 0.3vw, 1.3125rem)", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        lead: ["clamp(1.125rem, 1rem + 0.5vw, 1.3125rem)", { lineHeight: "1.55" }],
        body: ["1.0625rem", { lineHeight: "1.65" }],
        small: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.005em" }],
        label: ["0.75rem", { lineHeight: "1.3", letterSpacing: "0.08em" }],
      },
      maxWidth: { body: "38rem" },
      borderRadius: { DEFAULT: "2px", sm: "2px" },
      transitionDuration: { fast: "150ms", base: "250ms" },
      transitionTimingFunction: { "vx-out": "cubic-bezier(0.16, 1, 0.3, 1)" },
    },
  },
  plugins: [],
};
export default config;
