import { Link } from "react-router-dom";
import {
  Shield, Zap, Eye, FileText, GitBranch, BarChart3,
  ChevronRight, Star, Terminal, Lock, AlertTriangle, CheckCircle2, ArrowRight
} from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "Real-Time AI Scan", desc: "Instantly scan Python, JavaScript, Java, and more with our AI engine that detects 50+ vulnerability types.", color: "blue" },
  { icon: Eye, title: "Code Preview + Fix", desc: "See the exact vulnerable line highlighted and get a ready-to-use secure code replacement.", color: "purple" },
  { icon: BarChart3, title: "Dashboard Analytics", desc: "Track your security score over time with interactive charts and severity breakdowns.", color: "green" },
  { icon: GitBranch, title: "Dependency Scanner", desc: "Detect outdated or vulnerable packages in requirements.txt, package.json, and more.", color: "cyan" },
  { icon: FileText, title: "Professional Reports", desc: "Export PDF, JSON, or CSV reports — ready for audits, stakeholders, and CI/CD pipelines.", color: "amber" },
  { icon: Lock, title: "Secret Detection", desc: "Automatically find exposed API keys, tokens, passwords, and credentials in your codebase.", color: "red" },
];

const STEPS = [
  { step: "01", title: "Upload Your Code", desc: "Drag & drop a ZIP file, individual source files, or link a repository URL.", icon: "📁" },
  { step: "02", title: "AI Scans in Seconds", desc: "Our engine runs through 50+ vulnerability patterns and dependency checks instantly.", icon: "🔍" },
  { step: "03", title: "Fix & Export", desc: "Get AI-generated fix suggestions and download a professional security report.", icon: "✅" },
];

const TESTIMONIALS = [
  { name: "Rahul Sharma", role: "Full Stack Developer", quote: "BugShield caught a SQL injection in my backend that I had missed for months. The AI fix suggestion was spot-on.", avatar: "RS" },
  { name: "Priya Mehta", role: "Security Researcher", quote: "The dashboard is beautiful and the vulnerability cards with code preview make it so easy to understand each issue.", avatar: "PM" },
  { name: "Aditya Nair", role: "Team Lead", quote: "We integrated BugShield into our code review process. The PDF reports are professional enough to share with clients.", avatar: "AN" },
];

const COLOR_MAP = {
  blue:   { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", glow: "hover:shadow-glow-blue" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", glow: "" },
  green:  { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", glow: "hover:shadow-glow-green" },
  cyan:   { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", glow: "" },
  amber:  { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", glow: "" },
  red:    { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", glow: "hover:shadow-glow-red" },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-shield-bg text-shield-text overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#0b1020]/80 backdrop-blur-xl px-5 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center glow-blue">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-black text-white text-lg">BugShield</span>
            <span className="hidden sm:block text-[10px] font-semibold text-slate-600 tracking-widest mt-0.5">AI SECURITY</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white font-semibold transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition-all glow-blue">
              Get Started <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-5 text-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-green-500/6 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-purple-500/6 blur-3xl" />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-blue-500/20 text-xs text-blue-400 font-semibold mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Powered by AI · 50+ Vulnerability Types Detected
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight animate-fade-in stagger-1">
            AI-Powered<br />
            <span className="gradient-text">Vulnerability Detection</span><br />
            Platform
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in stagger-2">
            Scan your code for security vulnerabilities, exposed secrets, and dependency risks in seconds.
            Get AI-generated fix suggestions and professional security reports.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center animate-fade-in stagger-3">
            <Link
              to="/register"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-base transition-all glow-blue"
            >
              <Zap size={16} /> Start Free Scan
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl glass border border-white/10 hover:border-white/20 font-bold text-white text-base transition-all"
            >
              Sign In <ArrowRight size={15} />
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-in stagger-4">
            {[
              { value: "500+", label: "Scans Run" },
              { value: "10K+", label: "Bugs Found" },
              { value: "99%", label: "Accuracy" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black gradient-text">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Terminal preview ──────────────────── */}
      <section className="px-5 py-8">
        <div className="max-w-3xl mx-auto terminal-bg rounded-2xl overflow-hidden shadow-glow-blue">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-amber-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-slate-500 font-mono">bugshield — live scan demo</span>
          </div>
          <div className="p-6 font-mono text-sm space-y-2">
            {[
              { t: "> Initializing BugShield AI scanner…", c: "text-slate-400" },
              { t: "> Scanning app.py for vulnerabilities…", c: "text-slate-400" },
              { t: "⚠  SQL Injection detected at line 32 [CRITICAL]", c: "text-red-400" },
              { t: "⚠  Hardcoded API key found in config.py [HIGH]", c: "text-orange-400" },
              { t: "⚠  Missing input validation at line 87 [MEDIUM]", c: "text-amber-400" },
              { t: "> Generating AI fix suggestions…", c: "text-slate-400" },
              { t: "✓  3 vulnerabilities found · Security Score: 71/100", c: "text-green-400" },
              { t: "✓  Report ready for download", c: "text-green-400" },
            ].map((l, i) => (
              <div key={i} className="flex gap-3" style={{ animationDelay: `${i * 0.15}s` }}>
                <span className="text-blue-600 select-none">›</span>
                <span className={l.c}>{l.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────── */}
      <section className="px-5 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-3">Capabilities</p>
            <h2 className="text-4xl font-black text-white">Everything you need to ship secure code</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              BugShield combines static analysis, AI reasoning, and dependency scanning into one powerful platform.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => {
              const c = COLOR_MAP[color];
              return (
                <div key={title} className={`glass rounded-2xl p-6 border border-white/[0.06] hover:border-white/10 card-hover ${c.glow} transition-all`}>
                  <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-5`}>
                    <Icon size={20} className={c.text} />
                  </div>
                  <h3 className="font-bold text-white text-base">{title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────── */}
      <section className="px-5 py-20 bg-[#080d1a] border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl font-black text-white">How BugShield works</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map(({ step, title, desc, icon }, i) => (
              <div key={step} className="relative">
                <div className="glass rounded-2xl p-6 text-center card-hover border border-white/[0.06]">
                  <div className="text-4xl mb-4">{icon}</div>
                  <span className="text-xs font-black text-blue-400 tracking-widest">STEP {step}</span>
                  <h3 className="mt-2 text-lg font-black text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ChevronRight size={20} className="text-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────── */}
      <section className="px-5 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl font-black text-white">Trusted by developers</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map(({ name, role, quote, avatar }) => (
              <div key={name} className="glass rounded-2xl p-6 border border-white/[0.06] card-hover">
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">"{quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-black text-white">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="px-5 py-20">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-blue-500/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/5" />
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="relative">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-6 glow-blue">
              <Shield size={26} className="text-blue-400" />
            </div>
            <h2 className="text-4xl font-black text-white">Start securing your code today</h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">
              Join developers who use BugShield to ship safer, more secure code.
            </p>
            <div className="mt-8 flex gap-4 justify-center flex-wrap">
              <Link to="/register" className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-base transition-all glow-blue">
                <Zap size={16} /> Get Started Free
              </Link>
              <Link to="/login" className="flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-white/15 hover:border-white/25 font-bold text-white text-base">
                Sign In <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────── */}
      <footer className="px-5 py-8 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-400" />
            <span className="font-black text-white">BugShield</span>
            <span className="text-slate-600 text-sm">· AI Security Platform</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 BugShield. Built as a cybersecurity SaaS Web Application.</p>
        </div>
      </footer>
    </div>
  );
}
