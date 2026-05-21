import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { api, setSession } from "../api/client.js";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "developer" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    if (!nameRegex.test(form.name.trim())) {
      setError("Name must be 2-50 characters and contain only letters.");
      return;
    }
    
    // Require at least one letter in local part
    const emailRegex = /^[a-zA-Z0-9._%+-]*[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid business or personal email address.");
      return;
    }

    setLoading(true);
    try {
      const result = await api("/register", { method: "POST", body: JSON.stringify(form) });
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
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/8 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center glow-blue">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-white">BugShield</p>
              <p className="text-xs text-slate-500 font-medium tracking-wider">AI SECURITY SCANNER</p>
            </div>
          </div>

          <h1 className="text-5xl font-black text-white leading-tight max-w-md">
            Join thousands of<br />
            <span className="gradient-text">secure developers.</span>
          </h1>
          <p className="mt-6 text-slate-400 max-w-sm leading-relaxed">
            Start detecting vulnerabilities in your code today. Free to use, no credit card required.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: "500+", label: "Scans Run" },
              { value: "10K+", label: "Bugs Found" },
              { value: "99%", label: "Accuracy" },
            ].map(({ value, label }) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <p className="text-2xl font-black gradient-text">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-none w-full lg:w-[460px] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-black text-white">BugShield</span>
          </div>

          <h2 className="text-3xl font-black text-white">Create account</h2>
          <p className="mt-2 text-sm text-slate-500">Start scanning code with BugShield AI</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="text" required value={form.name} placeholder="Jane Doe"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="email" required value={form.email} placeholder="you@example.com"
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
                  type={showPw ? "text" : "password"} required value={form.password} placeholder="••••••••"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-9 pr-10 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>


            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-fade-in">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm font-bold text-white transition-all glow-blue flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
              {loading ? "Creating account…" : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
