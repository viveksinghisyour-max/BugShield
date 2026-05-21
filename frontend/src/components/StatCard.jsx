import { useEffect, useRef, useState } from "react";

/**
 * Premium stat card with icon, animated count-up value, glow border for critical.
 */
export default function StatCard({ label, value, tone = "blue", icon: Icon, suffix = "", trend = null }) {
  const [displayed, setDisplayed] = useState(0);
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const hasAnimation = !isNaN(numericValue) && numericValue > 0;

  useEffect(() => {
    if (!hasAnimation) { setDisplayed(numericValue); return; }
    const duration = 800;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * numericValue));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [numericValue]);

  const tones = {
    blue: {
      gradient: "from-blue-600/20 to-cyan-500/5",
      border: "border-blue-500/20",
      icon: "bg-blue-500/15 text-blue-400",
      text: "text-blue-400",
      glow: "",
    },
    green: {
      gradient: "from-green-600/20 to-emerald-500/5",
      border: "border-green-500/20",
      icon: "bg-green-500/15 text-green-400",
      text: "text-green-400",
      glow: "",
    },
    red: {
      gradient: "from-red-600/20 to-orange-500/5",
      border: "border-red-500/30",
      icon: "bg-red-500/15 text-red-400",
      text: "text-red-400",
      glow: numericValue > 0 ? "glow-critical animate-pulse-glow" : "",
    },
    amber: {
      gradient: "from-amber-500/20 to-yellow-500/5",
      border: "border-amber-500/20",
      icon: "bg-amber-500/15 text-amber-400",
      text: "text-amber-400",
      glow: "",
    },
  };

  const t = tones[tone] || tones.blue;
  const displayValue = typeof value === "string" && value.includes("/")
    ? value.replace(/^\d+/, displayed.toString())
    : displayed.toString() + suffix;

  return (
    <div
      className={`rounded-2xl border ${t.border} bg-gradient-to-br ${t.gradient} p-5 card-hover relative overflow-hidden ${t.glow}`}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className={`mt-3 text-3xl font-black tracking-tight text-white`}>
            {hasAnimation ? displayValue : value}
          </p>
          {trend !== null && (
            <p className={`mt-1.5 text-xs font-semibold ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.icon}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
