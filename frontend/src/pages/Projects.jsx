import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Play, Trash2, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { api } from "../api/client.js";

const STATUS_CONFIG = {
  scanning:  { label: "Scanning", dot: "bg-blue-400 animate-pulse", text: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  completed: { label: "Completed", dot: "bg-green-400", text: "text-green-400", bg: "bg-green-500/8 border-green-500/15" },
  failed:    { label: "Failed", dot: "bg-red-400", text: "text-red-400", bg: "bg-red-500/8 border-red-500/15" },
  pending:   { label: "Pending", dot: "bg-slate-400", text: "text-slate-400", bg: "bg-white/[0.04] border-white/8" },
  uploaded:  { label: "Ready", dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/15" },
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(null);

  const load = () => api("/projects").then(setProjects).catch(console.error);
  useEffect(() => { load(); }, []);

  const scan = async (project) => {
    setScanning(project.id);
    setMessage("");
    try {
      const result = await api("/scan", { method: "POST", body: JSON.stringify({ project_id: project.id }) });
      setMessage(`Scan #${result.scan_id} started for "${project.project_name}"`);
      load();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setScanning(null);
    }
  };

  const remove = async (projectId) => {
    if (!window.confirm("Delete this project and all its scan data?")) return;
    await api(`/projects/${projectId}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""} in your workspace</p>
        </div>
        <Link to="/dashboard/upload" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition-all glow-blue">
          + New Project
        </Link>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300 flex items-center gap-2 animate-fade-in">
          <ShieldCheck size={14} className="flex-shrink-0" />
          {message}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="glass rounded-2xl p-16 flex flex-col items-center gap-4 text-slate-600">
          <FolderOpen size={40} className="opacity-30" />
          <p className="text-sm">No projects yet.</p>
          <Link to="/dashboard/upload" className="text-sm text-blue-400 hover:text-blue-300 font-semibold">
            Upload your first project →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const sc = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending;
            const scoreColor =
              project.security_score >= 70 ? "bg-green-500" :
              project.security_score >= 40 ? "bg-amber-500" : "bg-red-500";
            const scoreText =
              project.security_score >= 70 ? "text-green-400" :
              project.security_score >= 40 ? "text-amber-400" : "text-red-400";

            return (
              <div
                key={project.id}
                className="glass rounded-2xl p-5 card-hover space-y-4 border border-white/[0.06] hover:border-white/10"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <FolderOpen size={16} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{project.project_name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} flex-shrink-0`} />
                      <span className={`text-xs font-semibold ${sc.text}`}>{sc.label}</span>
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Security Score</span>
                    <span className={`font-black ${scoreText}`}>{project.security_score || 0}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${scoreColor} transition-all duration-700`}
                      style={{ width: `${project.security_score || 0}%` }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Clock size={10} />
                  <span>{new Date(project.upload_date).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => scan(project)}
                    disabled={scanning === project.id || project.status === "scanning"}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-xs font-bold text-white disabled:opacity-50 transition-all"
                  >
                    {scanning === project.id ? (
                      <div className="w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin" />
                    ) : (
                      <Play size={11} />
                    )}
                    {scanning === project.id ? "Starting…" : "Scan"}
                  </button>
                  <button
                    onClick={() => remove(project.id)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
