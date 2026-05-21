import { useEffect, useState } from "react";
import { FileText, Code2, FileSpreadsheet, Download, CheckCircle2 } from "lucide-react";
import { api } from "../api/client.js";

const FORMAT_CARDS = [
  {
    type: "pdf",
    icon: FileText,
    label: "PDF Report",
    desc: "Human-readable report with vulnerability details, risk scores, and fix recommendations.",
    color: "red",
    gradient: "from-red-600/15 to-transparent",
    border: "border-red-500/20",
    iconBg: "bg-red-500/15 text-red-400",
  },
  {
    type: "json",
    icon: Code2,
    label: "JSON Export",
    desc: "Machine-readable structured data for integration with CI/CD pipelines and tooling.",
    color: "blue",
    gradient: "from-blue-600/15 to-transparent",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/15 text-blue-400",
  },
  {
    type: "csv",
    icon: FileSpreadsheet,
    label: "CSV Spreadsheet",
    desc: "Tabular export for Excel, Google Sheets, or data analysis workflows.",
    color: "green",
    gradient: "from-green-600/15 to-transparent",
    border: "border-green-500/20",
    iconBg: "bg-green-500/15 text-green-400",
  },
];

export default function Reports() {
  const [history, setHistory] = useState([]);
  const [scanId, setScanId] = useState("");
  const [type, setType] = useState("pdf");
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    api("/scan-history").then(setHistory).catch(console.error);
  }, []);

  const selectedScan = history.find((s) => String(s.id) === String(scanId));

  const download = async () => {
    if (!scanId) return;
    setDownloading(true);
    setDownloaded(false);
    try {
      const blob = await api(`/report?scan_id=${scanId}&report_type=${type}`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bugshield-scan-${scanId}.${type}`;
      link.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Export security reports for any completed scan</p>
      </div>

      {/* Format selection */}
      <div className="grid gap-4 sm:grid-cols-3">
        {FORMAT_CARDS.map(({ type: t, icon: Icon, label, desc, gradient, border, iconBg }) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`text-left rounded-2xl border p-5 transition-all card-hover bg-gradient-to-br ${gradient}
              ${type === t ? `${border} ring-1 ring-inset ring-white/10` : "border-white/[0.06] hover:border-white/10"}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
              <Icon size={18} />
            </div>
            <p className="font-bold text-white text-sm">{label}</p>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{desc}</p>
            {type === t && (
              <div className="mt-3 flex items-center gap-1 text-xs text-blue-400 font-semibold">
                <CheckCircle2 size={11} /> Selected
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Scan selector */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Scan
          </label>
          <select
            value={scanId}
            onChange={(e) => setScanId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer"
          >
            <option value="" className="bg-[#0d1424] text-white">Choose a scan…</option>
            {history.map((scan) => (
              <option key={scan.id} value={scan.id} className="bg-[#0d1424] text-white py-2">
                #{scan.id} — {scan.project_name} (Score: {scan.security_score}/100)
              </option>
            ))}
          </select>
        </div>

        {/* Selected scan preview */}
        {selectedScan && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8 text-sm animate-fade-in">
            <div className={`w-2 h-8 rounded-full flex-shrink-0 ${selectedScan.security_score >= 70 ? "bg-green-500/60" : selectedScan.security_score >= 40 ? "bg-amber-500/60" : "bg-red-500/60"}`} />
            <div>
              <p className="font-semibold text-white">{selectedScan.project_name}</p>
              <p className="text-xs text-slate-500">
                {new Date(selectedScan.scan_date).toLocaleDateString()} · Score: {selectedScan.security_score}/100
              </p>
            </div>
          </div>
        )}

        <button
          onClick={download}
          disabled={!scanId || downloading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
            ${!scanId ? "bg-white/5 text-slate-600 cursor-not-allowed" :
              downloaded ? "bg-green-600 hover:bg-green-500 text-white glow-green" :
              "bg-blue-600 hover:bg-blue-500 text-white glow-blue"}`}
        >
          {downloading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : downloaded ? (
            <CheckCircle2 size={14} />
          ) : (
            <Download size={14} />
          )}
          {downloading ? "Generating…" : downloaded ? "Downloaded!" : `Download ${type.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}
