/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // FSAE-Sim — light palette. Clean, slate-based, with teal as the
        // primary action color so the dark→light swap reuses existing
        // utility classes (text-accent, bg-accent, etc.) unchanged.
        canvas: "#f8fafc", // page background — slate-50
        panel: "#ffffff", // primary surface — pure white
        panel2: "#f1f5f9", // secondary surface — slate-100
        edge: "#e2e8f0", // borders, dividers — slate-200
        ink: {
          0: "#0f172a", // primary text — slate-900
          1: "#334155", // secondary text — slate-700
          2: "#64748b", // tertiary text — slate-500
          3: "#94a3b8", // softest text / hints — slate-400
        },
        accent: {
          DEFAULT: "#0d9488", // teal-600 — primary actions, chart lines
          warm: "#d97706", // amber-600 — secondary chart series
          alert: "#dc2626", // red-600 — true alerts
          positive: "#2563eb", // blue-600 — info / neutral series
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel:
          "0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)",
      },
    },
  },
  plugins: [],
};
