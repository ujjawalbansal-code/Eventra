/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAFD",
        ink: {
          DEFAULT: "#1C1830",
          soft: "#4A4560",
          faint: "#8C87A3",
        },
        violet: {
          50: "#F1EFFE",
          100: "#E4E0FD",
          400: "#8B7CF6",
          500: "#6C56F0",
          600: "#5A42DE",
          700: "#4832B0",
        },
        coral: {
          50: "#FFF0EE",
          400: "#FF8A76",
          500: "#FF5A4E",
          600: "#E8412F",
        },
        sun: {
          400: "#FFD65C",
          500: "#FFC93C",
        },
        mint: {
          50: "#EAFBF3",
          400: "#3AD196",
          500: "#22B67F",
          600: "#149567",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 16px rgba(28, 24, 48, 0.06)",
        card: "0 4px 24px rgba(28, 24, 48, 0.08)",
        lift: "0 12px 32px rgba(108, 86, 240, 0.18)",
      },
    },
  },
  plugins: [],
};
