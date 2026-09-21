/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0B1020",
          secondary: "#111827",
          elevated: "#172033",
          card: "#151C2E",
        },
        border: {
          DEFAULT: "#263248",
          subtle: "#1E293B",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#A7B0C0",
          muted: "#6B7280",
        },
        accent: {
          DEFAULT: "#38BDF8",
          primary: "#38BDF8",
          secondary: "#22C55E",
        },
        severity: {
          critical: "#EF4444",
          high: "#F97316",
          medium: "#F59E0B",
          low: "#38BDF8",
          informational: "#6B7280",
        },
      },
    },
  },
  plugins: [],
}
