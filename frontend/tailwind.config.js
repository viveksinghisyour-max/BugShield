export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        shield: {
          bg: "#0B1020",
          card: "#111827",
          panel: "#0F172A",
          blue: "#3B82F6",
          navy: "#1E3A5F",
          green: "#22C55E",
          amber: "#F59E0B",
          orange: "#F97316",
          red: "#EF4444",
          text: "#E5E7EB",
          muted: "#6B7280",
          border: "rgba(255,255,255,0.08)",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(59,130,246,0.15), 0 4px 24px rgba(0,0,0,0.4)",
        "glow-blue": "0 0 20px rgba(59,130,246,0.35), 0 0 60px rgba(59,130,246,0.1)",
        "glow-green": "0 0 20px rgba(34,197,94,0.3), 0 0 60px rgba(34,197,94,0.08)",
        "glow-red": "0 0 20px rgba(239,68,68,0.35), 0 0 60px rgba(239,68,68,0.1)",
        "glow-amber": "0 0 20px rgba(245,158,11,0.3), 0 0 60px rgba(245,158,11,0.08)",
        "glow-orange": "0 0 20px rgba(249,115,22,0.3)",
        card: "0 1px 3px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
        "hero-gradient":
          "radial-gradient(ellipse at top left, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(34,197,94,0.08) 0%, transparent 50%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "scan-line": "scanLine 1.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-left": "slideInLeft 0.4s ease-out",
        "count-up": "countUp 0.6s ease-out",
        "spin-slow": "spin 3s linear infinite",
        "border-glow": "borderGlow 2s ease-in-out infinite",
        typing: "typing 3s steps(30) infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(239,68,68,0.4)" },
          "50%": { opacity: "0.7", boxShadow: "0 0 40px rgba(239,68,68,0.7)" },
        },
        scanLine: {
          "0%": { transform: "translateY(0%)", opacity: "1" },
          "50%": { opacity: "0.5" },
          "100%": { transform: "translateY(100%)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(239,68,68,0.4)" },
          "50%": { borderColor: "rgba(239,68,68,0.8)" },
        },
        typing: {
          "0%": { width: "0" },
          "60%": { width: "100%" },
          "80%": { width: "100%" },
          "100%": { width: "0" },
        },
      },
    },
  },
  plugins: [],
};
