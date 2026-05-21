import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS,
  Legend, LinearScale, LineElement, PointElement, Tooltip, Filler
} from "chart.js";
import {
  FolderOpen, Scan, AlertTriangle, ShieldAlert, Activity,
  Clock, ArrowRight, Zap
} from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import SecurityMeter from "../components/SecurityMeter.jsx";
import { api } from "../api/client.js";

ChartJS.register(
  ArcElement, BarElement, CategoryScale, LinearScale,
  LineElement, PointElement, Tooltip, Legend, Filler
);

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#111827",
      borderColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      titleColor: "#e5e7eb",
      bodyColor: "#9ca3af",
      padding: 10,
      cornerRadius: 10,
    },
  },
  scales: {
    x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#6b7280", font: { size: 11 } } },
    y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#6b7280", font: { size: 11 } } },
  },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api("/dashboard").then(setData).catch(console.error);
    api("/scan-history").then((h) => setHistory(h.slice(0, 5))).catch(() => setHistory([]));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500/40 border-t-blue-500 animate-spin" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  const cards = data.cards;
  const severityLabels = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const severityColors = ["#EF4444", "#F97316", "#F59E0B", "#22C55E"];
  const typeLabels = Object.keys(data.vulnerability_types).slice(0, 7);

  const doughnutData = {
    labels: severityLabels,
    datasets: [{
      data: severityLabels.map((k) => data.severity_distribution[k] || 0),
      backgroundColor: severityColors.map((c) => c + "CC"),
      borderColor: severityColors,
      borderWidth: 1.5,
      hoverOffset: 6,
    }],
  };

  const barData = {
    labels: typeLabels.map((l) => l.length > 20 ? l.slice(0, 18) + "…" : l),
    datasets: [{
      label: "Findings",
      data: typeLabels.map((k) => data.vulnerability_types[k]),
      backgroundColor: "rgba(59,130,246,0.5)",
      borderColor: "#3B82F6",
      borderWidth: 1.5,
      borderRadius: 6,
    }],
  };

  const lineData = {
    labels: data.security_trend.map((item) =>
      new Date(item.scan_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [{
      label: "Security Score",
      data: data.security_trend.map((item) => item.security_score),
      borderColor: "#22C55E",
      backgroundColor: "rgba(34,197,94,0.08)",
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: "#22C55E",
      tension: 0.4,
      fill: true,
    }],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Security Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time overview of your codebase health</p>
        </div>
        <Link
          to="/dashboard/upload"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition-all glow-blue"
        >
          <Zap size={14} />
          New Scan
        </Link>
      </div>

      {/* Stats + Score */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="xl:col-span-1 glass rounded-2xl p-5 flex flex-col items-center justify-center border border-white/8">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Security Score</p>
          <SecurityMeter score={cards.security_score} size={140} />
        </div>
        <div className="xl:col-span-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Projects" value={cards.total_projects} tone="blue" icon={FolderOpen} />
          <StatCard label="Total Scans" value={cards.total_scans} tone="green" icon={Scan} />
          <StatCard label="Vulnerabilities" value={cards.total_vulnerabilities} tone="amber" icon={AlertTriangle} />
          <StatCard label="Critical Issues" value={cards.critical_issues} tone="red" icon={ShieldAlert} />
        </div>
      </section>

      {/* Charts */}
      <section className="grid gap-5 xl:grid-cols-3">
        <Panel title="Severity Distribution" subtitle="Breakdown by risk level">
          <div className="h-52 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <Doughnut
                data={doughnutData}
                options={{ ...CHART_DEFAULTS, scales: undefined, plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } }, cutout: "70%" }}
              />
            </div>
          </div>
          {/* Legend */}
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {severityLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: severityColors[i] }} />
                <span>{label}</span>
                <span className="ml-auto font-bold text-white">{data.severity_distribution[label] || 0}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Vulnerability Types" subtitle="Top issue categories">
          <div className="h-52">
            <Bar data={barData} options={{ ...CHART_DEFAULTS, indexAxis: "y", scales: { x: CHART_DEFAULTS.scales.x, y: { ...CHART_DEFAULTS.scales.y, ticks: { color: "#6b7280", font: { size: 10 } } } } }} />
          </div>
        </Panel>

        <Panel title="Security Trend" subtitle="Score over recent scans">
          <div className="h-52">
            {data.security_trend.length > 0 ? (
              <Line data={lineData} options={CHART_DEFAULTS} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                No scan history yet
              </div>
            )}
          </div>
        </Panel>
      </section>

      {/* Activity Timeline */}
      <section className="grid gap-5 xl:grid-cols-2">
        <Panel title="Recent Activity" subtitle="Latest scan events">
          {history.length === 0 ? (
            <p className="text-slate-600 text-sm py-4">No scans yet. Upload a project to get started.</p>
          ) : (
            <div className="space-y-0">
              {history.map((scan, i) => {
                const scoreColor = scan.security_score >= 70 ? "text-green-400" : scan.security_score >= 40 ? "text-amber-400" : "text-red-400";
                return (
                  <div key={scan.id} className={`flex items-start gap-4 py-3 ${i < history.length - 1 ? "border-b border-white/5" : ""}`}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${scan.status === "completed" ? "bg-green-400" : scan.status === "failed" ? "bg-red-400" : "bg-blue-400 animate-pulse"}`} />
                      {i < history.length - 1 && <div className="w-px h-6 bg-white/5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{scan.project_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Scan #{scan.id} · <span className="capitalize">{scan.status}</span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm font-black ${scoreColor}`}>{scan.security_score}</span>
                      <p className="text-[10px] text-slate-600">/100</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title="Quick Actions" subtitle="Get started fast">
          <div className="space-y-3">
            {[
              { label: "Upload & Scan New Project", desc: "Drop a ZIP or source file", href: "/dashboard/upload", color: "blue" },
              { label: "View Scan History", desc: "Browse past vulnerability reports", href: "/dashboard/history", color: "purple" },
              { label: "Download Reports", desc: "Export PDF, JSON or CSV", href: "/dashboard/reports", color: "green" },
            ].map(({ label, desc, href, color }) => (
              <Link
                key={href}
                to={href}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 transition-all group"
              >
                <div className={`w-2 h-8 rounded-full bg-${color}-500/60 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="glass rounded-2xl p-5 card-hover">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
