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
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        muted: "var(--muted)",
        line: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        // Primary brand ramp - warm orange ("ember")
        ember: {
          50: "#fff6ee",
          100: "#fde8d6",
          200: "#facba6",
          300: "#f6a76c",
          400: "#f07e38",
          500: "#e2590b",
          600: "#c4450a",
          700: "#a03709",
          800: "#7e2d0b",
          900: "#66260c",
        },
        // Warm neutrals ("ink") - replaces the previous cool slate greys
        ink: {
          50: "#faf6f2",
          100: "#f3ebe3",
          200: "#e7d9cb",
          300: "#d3bfae",
          400: "#a98d77",
          500: "#7e6553",
          600: "#5f4b3e",
          700: "#47372e",
          800: "#2e2119",
          900: "#1d1512",
          950: "#140e0b",
        },
        // Gold undertone accent
        gold: {
          100: "#fdf1d6",
          300: "#f8ce72",
          400: "#f5b942",
          500: "#f2a81d",
          700: "#a87408",
        },
        // Reserved semantic success colour
        palm: {
          50: "#e9f5ef",
          100: "#cde9dc",
          500: "#177d5b",
          700: "#0c4c38",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(60, 32, 16, 0.04), 0 10px 26px -14px rgba(60, 32, 16, 0.20)",
        lift: "0 2px 6px rgba(40, 20, 10, 0.10), 0 24px 50px -22px rgba(40, 20, 10, 0.42)",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
