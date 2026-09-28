import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chinux: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        navy: {
          800: "#1e293b",
          900: "#0f172a",
          950: "#090d16",
        },
        cream: {
          50: "#FDFBF7",
          100: "#F8F4EC",
          200: "#EFE8DC",
          300: "#E5DAC8",
          400: "#D3C2A9",
          500: "#BC9F7C",
          border: "#E9E2D5",
          card: "#FFFFFF",
          surface: "#F6F1E8",
          text: "#1C1917",
          muted: "#78716C",
        },
        sunlight: {
          bg: "#ffffff",
          text: "#000000",
          border: "#111827",
          accent: "#047857",
        }
      },
    },
  },
  plugins: [],
};
export default config;
