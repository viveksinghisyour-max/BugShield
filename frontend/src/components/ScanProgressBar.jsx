/**
 * Animated gradient progress bar for scan operations.
 * progress: 0–100
 * status: 'queued' | 'running' | 'completed' | 'failed'
 */
export default function ScanProgressBar({ progress = 0, status = "running", label = "" }) {
  const isComplete = status === "completed";
  const isFailed = status === "failed";

  const barColor = isFailed
    ? "from-red-600 to-red-400"
    : isComplete
    ? "from-green-600 to-emerald-400"
    : "from-blue-600 via-cyan-500 to-blue-600";

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{label}</span>
          <span
            className={
              isComplete
                ? "text-green-400 font-semibold"
                : isFailed
                ? "text-red-400 font-semibold"
                : "text-blue-400"
            }
          >
            {isComplete ? "Complete" : isFailed ? "Failed" : `${progress}%`}
          </span>
        </div>
      )}
      <div className="h-2 rounded-full bg-white/5 overflow-hidden relative">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500 relative overflow-hidden ${
            !isComplete && !isFailed ? "scan-bar" : ""
          }`}
          style={{
            width: `${isComplete || isFailed ? 100 : progress}%`,
            backgroundSize: "200% 100%",
            animation:
              !isComplete && !isFailed && progress > 0 && progress < 100
                ? "shimmer 2s linear infinite"
                : undefined,
          }}
        />
      </div>
    </div>
  );
}
