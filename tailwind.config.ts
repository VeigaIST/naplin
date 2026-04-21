import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e8f0ff",
          100: "#d5e4ff",
          200: "#b3c9ff",
          300: "#85a3ff",
          400: "#5c7dff",
          500: "#3c5ef5",
          600: "#2d4ae8",
          700: "#2438c7",
          800: "#1f2f9e",
          900: "#1c2b7d",
        },
        night: {
          50: "#e9eef8",
          100: "#d0dae9",
          200: "#a3b3cc",
          300: "#7586a8",
          400: "#4f5f82",
          500: "#3a4763",
          600: "#2d384d",
          700: "#232b3d",
          800: "#161d2e",
          900: "#0f1422",
          950: "#080b14",
        },
        ink: {
          50: "#f4f6fa",
          100: "#e8ecf4",
          200: "#d0d7e5",
          300: "#a8b4c9",
          400: "#7d8cab",
          500: "#5c6b88",
          600: "#47556e",
          700: "#384456",
          800: "#252e3d",
          900: "#151b26",
        },
        coral: {
          400: "#ff8f8a",
          500: "#ff6b6b",
          600: "#e85555",
        },
      },
      fontFamily: {
        sans: ["var(--font-naplin)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.05), 0 12px 32px rgb(0 0 0 / 0.12)",
        glow: "0 0 0 1px rgb(255 255 255 / 0.06), 0 18px 50px -12px rgb(60 94 245 / 0.35)",
        "glow-coral": "0 0 0 1px rgb(255 107 107 / 0.25), 0 12px 40px -8px rgb(255 107 107 / 0.35)",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "22px",
        "3xl": "28px",
      },
      backgroundImage: {
        "night-radial":
          "radial-gradient(120% 80% at 50% -10%, rgb(45 74 232 / 0.18), transparent 55%)",
        "night-mesh":
          "radial-gradient(ellipse 80% 50% at 50% 100%, rgb(15 20 34 / 0.9), rgb(8 11 20))",
      },
    },
  },
  plugins: [],
};

export default config;
