import { useEffect, useRef, useState } from "react";

/**
 * Circular SVG security score gauge with animated fill and color zones.
 * Score 0-100. Colors: <40 red, <70 amber, >=70 green.
 */
export default function SecurityMeter({ score = 0, size = 160, animate = true }) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, displayed)) / 100;
  const offset = circumference * (1 - pct);

  // Color based on score
  const color =
    displayed >= 70 ? "#22C55E" : displayed >= 40 ? "#F59E0B" : "#EF4444";
  const glowColor =
    displayed >= 70
      ? "rgba(34,197,94,0.4)"
      : displayed >= 40
      ? "rgba(245,158,11,0.4)"
      : "rgba(239,68,68,0.4)";
  const label =
    displayed >= 70 ? "SECURE" : displayed >= 40 ? "AT RISK" : "CRITICAL";

  // Animate counter
  useEffect(() => {
    if (!animate) { setDisplayed(score); return; }
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score, animate]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={10}
          />
          {/* Score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.05s linear, stroke 0.3s ease" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute flex flex-col items-center">
          <span
            className="text-4xl font-black leading-none"
            style={{ color, textShadow: `0 0 20px ${glowColor}` }}
          >
            {displayed}
          </span>
          <span className="text-[10px] font-bold text-slate-500 tracking-widest mt-1">
            / 100
          </span>
        </div>
      </div>
      <span
        className="text-xs font-black tracking-widest px-3 py-1 rounded-full"
        style={{
          color,
          background: `${color}18`,
          border: `1px solid ${color}40`,
        }}
      >
        {label}
      </span>
    </div>
  );
}
