import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        opus: {
          bg: "#09090B",
          surface: "#121216",
          card: "#18181D",
          border: "#27272F",
          lime: "#04F827",
          yellow: "#FFFD03",
          purple: "#8B5CF6",
          violet: "#6D28D9",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      }
    },
  },
  plugins: [],
};

export default config;
