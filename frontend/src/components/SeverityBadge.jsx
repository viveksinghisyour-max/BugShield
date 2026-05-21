const STYLES = {
  CRITICAL: "bg-red-500/15 text-red-300 ring-red-400/40 shadow-[0_0_8px_rgba(239,68,68,0.3)]",
  HIGH:     "bg-orange-500/15 text-orange-300 ring-orange-400/35 shadow-[0_0_8px_rgba(249,115,22,0.25)]",
  MEDIUM:   "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  LOW:      "bg-green-500/15 text-green-300 ring-green-400/25",
};

const DOTS = {
  CRITICAL: "bg-red-400",
  HIGH:     "bg-orange-400",
  MEDIUM:   "bg-amber-400",
  LOW:      "bg-green-400",
};

export default function SeverityBadge({ severity }) {
  const sev = (severity || "LOW").toUpperCase();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ring-1 ${STYLES[sev] || STYLES.LOW}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOTS[sev] || DOTS.LOW}`} />
      {sev}
    </span>
  );
}
