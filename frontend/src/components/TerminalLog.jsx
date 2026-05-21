import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";

const STATUS_ICONS = {
  queued: <Loader2 size={14} className="animate-spin text-blue-400" />,
  running: <Loader2 size={14} className="animate-spin text-blue-400" />,
  completed: <CheckCircle2 size={14} className="text-green-400" />,
  failed: <XCircle size={14} className="text-red-400" />,
};

/**
 * Animated terminal-style scan log.
 * lines: array of strings to display sequentially.
 * status: 'queued' | 'running' | 'completed' | 'failed'
 */
export default function TerminalLog({ lines = [], status = "running", progress = 0 }) {
  const bottomRef = useRef(null);
  const [visibleLines, setVisibleLines] = useState([]);

  useEffect(() => {
    setVisibleLines([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setVisibleLines((prev) => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 280);
    return () => clearInterval(interval);
  }, [lines.join("|")]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleLines]);

  return (
    <div className="terminal-bg rounded-2xl overflow-hidden">
      {/* Terminal header bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-amber-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-2 text-xs text-slate-500 font-mono">bugshield — scan terminal</span>
        <div className="ml-auto flex items-center gap-1.5 text-xs">
          {STATUS_ICONS[status] || STATUS_ICONS.running}
          <span className="text-slate-400 capitalize">{status}</span>
        </div>
      </div>

      {/* Progress bar */}
      {(status === "running" || status === "queued") && (
        <div className="h-0.5 bg-slate-800 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 relative scan-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Log lines */}
      <div className="p-4 h-52 overflow-y-auto font-mono text-sm space-y-1.5">
        {visibleLines.map((line, i) => (
          <div
            key={i}
            className="animate-fade-in flex items-start gap-2"
          >
            <span className="text-blue-500 select-none shrink-0">›</span>
            <span
              className={
                line.startsWith("✓")
                  ? "text-green-400"
                  : line.startsWith("✗") || line.includes("Error")
                  ? "text-red-400"
                  : line.startsWith("⚠")
                  ? "text-amber-400"
                  : "text-slate-300"
              }
            >
              {line}
            </span>
          </div>
        ))}
        {(status === "running" || status === "queued") && visibleLines.length > 0 && (
          <div className="flex items-center gap-2 text-blue-400">
            <span className="text-blue-500">›</span>
            <span className="typing-cursor font-mono text-blue-400 text-sm"> </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
