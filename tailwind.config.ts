import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vx: {
          ink: { 900: "#14110F", 700: "#2A2521", 500: "#55483D" },
          cream: { 50: "#FAF8F6", 100: "#F2EEEA" },
          neutral: {
            200: "#E4DDD5",
            400: "#A79C90",
            600: "#6E645A",
            800: "#332C26",
          },
          accent: { 600: "#C94A1C", 500: "#E45824", 100: "#FDE7DC" },
          band: {
            lowball: "#B3261E",
            lowballBg: "#FBEAE9",
            fair: "#1F7A4D",
            fairBg: "#E7F5EC",
            premium: "#9A5B00",
            premiumBg: "#FBF0DC",
          },
        },
      },
      fontFamily: {
        display: ["var(--font-general-sans)", "-apple-system", "Segoe UI", "sans-serif"],
        body: ["var(--font-inter)", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "20px",
        pill: "999px",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "400ms",
      },
      transitionTimingFunction: {
        "vx-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "vx-inout": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
