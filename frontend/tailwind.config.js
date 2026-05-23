/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // FSAE-Sim palette: a calm dark dashboard. Race telemetry feel without
        // shouting at the user.
        canvas: "#0b1015",
        panel: "#141a22",
        panel2: "#1c242f",
        edge: "#2a3441",
        ink: {
          0: "#f5f7fa",
          1: "#c7d0db",
          2: "#8a96a6",
          3: "#5b6573",
        },
        accent: {
          DEFAULT: "#5ee0c4",     // teal — primary actions, chart lines
          warm: "#ffb86b",        // amber — secondary chart series
          alert: "#ff5d6c",       // red — high-side warnings
          positive: "#7eb6ff",    // blue — neutral info
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
