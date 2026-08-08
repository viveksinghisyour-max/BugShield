import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CloudUpload, FileCode, X, CheckCircle2, AlertTriangle, Play } from "lucide-react";
import { api } from "../api/client.js";
import TerminalLog from "../components/TerminalLog.jsx";
import ScanProgressBar from "../components/ScanProgressBar.jsx";

const SCAN_LINES = [
  "Initializing BugShield AI scanner…",
  "Loading project files…",
  "Checking for SQL injection patterns…",
  "Scanning for hardcoded secrets & API keys…",
  "Analyzing dependency vulnerabilities…",
  "Detecting XSS & CSRF attack vectors…",
  "Checking authentication logic…",
  "Scanning cryptographic implementations…",
  "Running static code analysis…",
  "Generating security report…",
];

export default function UploadProject() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [file, setFile] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [stage, setStage] = useState("idle"); // idle | uploaded | scanning | done | error
  const [uploadedProjectId, setUploadedProjectId] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState([]);
  const [message, setMessage] = useState("");
  const pollRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    const form = new FormData();
    form.append("project_name", projectName);
    if (file) form.append("file", file);
    if (repoUrl) form.append("repo_url", repoUrl);
    try {
      const result = await api("/upload", { method: "POST", body: form });
      setStage("uploaded");
      setUploadedProjectId(result.id);
      setMessage(`Project "${result.project_name}" uploaded successfully.`);
      setScanId(null);
      setScanResult(null);
    } catch (err) {
      setStage("error");
      setMessage(err.message);
    }
  };

  const startScan = async () => {
    try {
      let projId = uploadedProjectId;
      if (!projId) {
        const projects = await api("/projects");
        const proj = projects.find((p) => p.project_name === projectName);
        if (proj) projId = proj.id;
      }
      if (!projId) return;

      await api("/scan", { method: "POST", body: JSON.stringify({ project_id: projId }) });
      navigate("/dashboard/projects");
    } catch (err) {
      setStage("error");
      setMessage(err.message);
    }
  };

  const pollScan = (id) => {
    let lineIdx = 1;
    const interval = setInterval(async () => {
      try {
        const prog = await api(`/scan/${id}/progress`);
        setProgress(prog.progress || 0);
        if (lineIdx < SCAN_LINES.length) {
          setTerminalLines((prev) => [...prev, SCAN_LINES[lineIdx]]);
          lineIdx++;
        }
        if (prog.status === "completed") {
          clearInterval(interval);
          setTerminalLines((prev) => [...prev, `✓ Scan complete! View results in Scan History.`]);
          setStage("done");
          setProgress(100);
        } else if (prog.status === "failed") {
          clearInterval(interval);
          setTerminalLines((prev) => [...prev, `✗ Scan failed: ${prog.error || "Unknown error"}`]);
          setStage("error");
        }
      } catch {
        clearInterval(interval);
      }
    }, 2000);
    pollRef.current = interval;
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const reset = () => {
    setProjectName(""); setFile(null); setRepoUrl("");
    setStage("idle"); setUploadedProjectId(null); setScanId(null); setScanResult(null);
    setProgress(0); setTerminalLines([]); setMessage("");
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Upload & Scan</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upload your project and run AI-powered vulnerability detection</p>
      </div>

      {/* Upload form */}
      {stage === "idle" && (
        <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-5">
          {/* Project name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Project Name
            </label>
            <input
              required
              value={projectName}
              placeholder="e.g. MyWebApp v2.0"
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Drag & Drop zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Project File
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                isDragOver
                  ? "border-blue-400 bg-blue-500/10"
                  : file
                  ? "border-green-500/40 bg-green-500/5"
                  : "border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".py,.js,.ts,.java,.env,.json,.txt,.zip"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 size={36} className="text-green-400" />
                  <p className="font-bold text-green-300">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-1 flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <CloudUpload size={42} className={`transition-colors ${isDragOver ? "text-blue-400" : "text-slate-600"}`} />
                  <div>
                    <p className="font-bold text-slate-300">
                      {isDragOver ? "Drop to upload" : "Drop your project here"}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">or click to browse files</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                    {[".py", ".js", ".ts", ".java", ".zip", ".env"].map((ext) => (
                      <span key={ext} className="text-[10px] font-mono bg-white/5 text-slate-500 px-2 py-0.5 rounded-md">{ext}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Repo URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Repository URL <span className="text-slate-600 normal-case font-normal">(optional)</span>
            </label>
            <input
              value={repoUrl}
              placeholder="https://github.com/org/repo"
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition-all glow-blue"
          >
            <CloudUpload size={15} />
            Upload Project
          </button>
        </form>
      )}

      {/* After upload — ready to scan */}
      {stage === "uploaded" && (
        <div className="glass rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/8 border border-green-500/20">
            <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-300">Upload Successful</p>
              <p className="text-xs text-slate-500 mt-0.5">{message}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={startScan}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white glow-blue"
            >
              <Play size={14} /> Start AI Scan
            </button>
            <button onClick={reset} className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.05] text-sm text-slate-400">
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* Scanning terminal */}
      {(stage === "scanning" || stage === "done") && (
        <div className="space-y-4 animate-fade-in">
          <ScanProgressBar progress={progress} status={stage === "done" ? "completed" : "running"} label="Scan Progress" />
          <TerminalLog lines={terminalLines} status={stage === "done" ? "completed" : "running"} progress={progress} />
          {stage === "done" && (
            <div className="flex gap-3">
              <Link to="/dashboard/history" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white glow-green">
                <CheckCircle2 size={14} /> View Results
              </Link>
              <button onClick={reset} className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.05] text-sm text-slate-400">
                Scan Another
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {stage === "error" && (
        <div className="animate-fade-in">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-300">Error</p>
              <p className="text-xs text-slate-400 mt-0.5">{message}</p>
            </div>
          </div>
          <button onClick={reset} className="mt-3 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.05] text-sm text-slate-400">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
