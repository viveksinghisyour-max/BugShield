import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { api, setSession } from "../api/client.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Standard baseline regex for login (legacy compatibility)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address format.");
      return;
    }

    setLoading(true);
    try {
      const result = await api("/login", { method: "POST", body: JSON.stringify(form) });
      setSession(result.token, result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-shield-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-[#080d1a] p-12">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-60" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 rounded-full bg-green-500/8 blur-3xl" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center glow-blue">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-white">BugShield</p>
              <p className="text-xs text-slate-500 font-medium tracking-wider">AI SECURITY SCANNER</p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-black text-white leading-tight max-w-lg">
            Security scanning<br />
            <span className="gradient-text">built for modern</span><br />
            builders.
          </h1>
          <p className="mt-6 text-slate-400 max-w-sm leading-relaxed">
            Upload code, detect vulnerabilities, get AI-powered fix suggestions, and generate professional security reports — all from one dashboard.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-3">
            {[
              { label: "AI-powered vulnerability detection", color: "text-blue-400" },
              { label: "Supports Python, JS, Java & more", color: "text-green-400" },
              { label: "PDF, JSON & CSV report export", color: "text-purple-400" },
              { label: "Real-time scan progress tracking", color: "text-cyan-400" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <div className={`w-1.5 h-1.5 rounded-full bg-current ${color}`} />
                <span className="text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating terminal card */}
        <div className="relative z-10 mt-auto terminal-bg rounded-2xl p-4 max-w-sm">
          <div className="flex gap-1.5 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="font-mono text-xs space-y-1">
            {[
              { t: "Scanning app.py…", c: "text-slate-400" },
              { t: "⚠ SQL injection detected at line 32", c: "text-amber-400" },
              { t: "✓ Fix suggestion generated", c: "text-green-400" },
              { t: "Security score: 82/100", c: "text-blue-400" },
            ].map((l, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-blue-600">›</span>
                <span className={l.c}>{l.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex-none w-full lg:w-[460px] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-black text-white">BugShield</span>
          </div>

          <h2 className="text-3xl font-black text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to your security dashboard</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="email"
                  required
                  value={form.email}
                  placeholder="you@example.com"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  placeholder="••••••••"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-9 pr-10 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm font-bold text-white transition-all glow-blue flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <p className="text-center text-sm text-slate-500">
              New to BugShield?{" "}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// Keep AuthShell and Input exports for Register.jsx compatibility
export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-shield-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md glass rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center glow-blue">
            <Shield size={18} className="text-white" />
          </div>
          <span className="font-black text-white text-lg">BugShield</span>
        </div>
        <h2 className="text-3xl font-black text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-500 mb-8">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</span>
      <div className="relative">
        <input
          type={isPassword && showPw ? "text" : type}
          value={value}
          placeholder={placeholder || (type === "email" ? "you@example.com" : "••••••••")}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </label>
  );
}
