import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Clock, Shield, ChevronRight } from "lucide-react";
import VulnerabilityCard from "../components/VulnerabilityCard.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import SecurityMeter from "../components/SecurityMeter.jsx";
import { api } from "../api/client.js";

const FILTERS = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ScanHistory() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [vulns, setVulns] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    api("/scan-history").then(setHistory).catch(console.error);
  }, []);

  useEffect(() => {
    const scanId = searchParams.get("scanId");
    if (scanId && history.length > 0 && !selected) {
      const scan = history.find(s => String(s.id) === scanId);
      if (scan) {
        open(scan);
      }
    }
  }, [searchParams, history]);

  const open = async (scan) => {
    setSelected(scan);
    setFilter("ALL");
    setLoading(true);
    try {
      const result = await api(`/scan/${scan.id}`);
      setVulns(result.vulnerabilities || []);
    } catch {
      setVulns([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "ALL" ? vulns : vulns.filter((v) => v.severity === filter);

  const severityCounts = vulns.reduce((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Scan History</h1>
        <p className="text-sm text-slate-500 mt-0.5">Browse past scans and vulnerability findings</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        {/* Left: Scan list */}
        <section className="space-y-2">
          {history.length === 0 && (
            <p className="text-slate-600 text-sm p-4">No scans yet.</p>
          )}
          {history.map((scan) => {
            const scoreColor =
              scan.security_score >= 70 ? "text-green-400" :
              scan.security_score >= 40 ? "text-amber-400" : "text-red-400";
            const borderColor =
              scan.security_score >= 70 ? "border-l-green-500/50" :
              scan.security_score >= 40 ? "border-l-amber-500/50" : "border-l-red-500/50";
            const isActive = selected?.id === scan.id;

            return (
              <button
                key={scan.id}
                onClick={() => open(scan)}
                className={`w-full text-left rounded-2xl border border-white/8 border-l-4 ${borderColor} p-4 transition-all card-hover
                  ${isActive ? "bg-blue-500/8 border-blue-500/20" : "bg-shield-card/60 hover:bg-white/[0.04]"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{scan.project_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Scan #{scan.id} · <span className="capitalize">{scan.status}</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {timeAgo(scan.scan_date)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-lg font-black ${scoreColor}`}>{scan.security_score}</span>
                    <p className="text-[10px] text-slate-600">/100</p>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* Right: Vulnerability panel */}
        <section className="glass rounded-2xl overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-600">
              <Shield size={32} className="opacity-30" />
              <p className="text-sm">Select a scan to view vulnerabilities</p>
            </div>
          ) : (
            <>
              {/* Scan summary bar */}
              <div className="flex items-center gap-4 p-5 border-b border-white/8 flex-wrap gap-y-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-black text-white">{selected.project_name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Scan #{selected.id} · {timeAgo(selected.scan_date)}
                  </p>
                </div>
                <SecurityMeter score={selected.security_score} size={80} animate={false} />
              </div>

              {/* Severity counts */}
              <div className="grid grid-cols-4 border-b border-white/5">
                {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => (
                  <div key={s} className="py-3 px-4 text-center border-r border-white/5 last:border-r-0">
                    <p className="text-lg font-black text-white">{severityCounts[s] || 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s}</p>
                  </div>
                ))}
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 p-3 border-b border-white/5 flex-wrap">
                <Filter size={12} className="text-slate-600 mr-1" />
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      filter === f
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {f} {f !== "ALL" && severityCounts[f] ? `(${severityCounts[f]})` : ""}
                  </button>
                ))}
              </div>

              {/* Vulnerability cards */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)]">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 rounded-full border-2 border-blue-500/40 border-t-blue-500 animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-10 text-slate-600 text-sm">
                    {filter === "ALL" ? "No vulnerabilities found in this scan." : `No ${filter} severity issues found.`}
                  </div>
                ) : (
                  filtered.map((vuln) => (
                    <VulnerabilityCard key={vuln.id} vuln={vuln} />
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
