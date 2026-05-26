/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0f1a",
          secondary: "#0f1629",
          tertiary: "#141c33",
        },
        accent: {
          cyan: "#00d4ff",
          emerald: "#10b981",
          amber: "#f59e0b",
          red: "#ef4444",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderColor: {
        DEFAULT: "rgba(255, 255, 255, 0.07)",
      },
    },
  },
  plugins: [],
};
