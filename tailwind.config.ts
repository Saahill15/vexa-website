import type { Config } from "tailwindcss";

// Presentation tokens for the reviewed website direction.
const config: Config = {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vx: {
          paper: "#F7F5EF",
          stone: "#EDE7DC",
          white: "#FFFFFF",
          ink: { DEFAULT: "#182522", 2: "#414841" },
          muted: "#62665D",
          hair: "#D9D0C1",
          accent: { 500: "#F56B30", 600: "#E05B23", deep: "#A83F18" },
          peacock: { blue: "#0B4F6C", teal: "#155E58", "teal-deep": "#104C47" },
          feather: { gold: "#C9A227", "gold-deep": "#8A6A10" },
          error: "#B3261E",
        },
      },
      fontFamily: {
        // Headings and body share self hosted Plex for coherent reading.
        display: ["var(--font-text)", "-apple-system", "Segoe UI", "sans-serif"],
        text: ["var(--font-text)", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.25rem, 1.4rem + 3.6vw, 4rem)", { lineHeight: "1.08", letterSpacing: "-0.035em" }],
        "display-l": ["clamp(1.75rem, 1.3rem + 1.9vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        figure: ["clamp(2.75rem, 2rem + 3vw, 4.5rem)", { lineHeight: "1" }],
        quote: ["clamp(1.5rem, 1.2rem + 1.3vw, 2.125rem)", { lineHeight: "1.25" }],
        h3: ["clamp(1.1875rem, 1.1rem + 0.3vw, 1.3125rem)", { lineHeight: "1.3", letterSpacing: "-0.025em" }],
        lead: ["clamp(1.125rem, 1rem + 0.5vw, 1.3125rem)", { lineHeight: "1.55" }],
        body: ["1.0625rem", { lineHeight: "1.65" }],
        small: ["1rem", { lineHeight: "1.5", letterSpacing: "0.005em" }],
        label: ["0.8125rem", { lineHeight: "1.3", letterSpacing: "0.08em" }],
      },
      maxWidth: { body: "38rem" },
      borderRadius: { DEFAULT: "12px", sm: "8px" },
      transitionDuration: { fast: "150ms", base: "250ms" },
      transitionTimingFunction: { "vx-out": "cubic-bezier(0.16, 1, 0.3, 1)" },
    },
  },
  plugins: [],
};
export default config;
