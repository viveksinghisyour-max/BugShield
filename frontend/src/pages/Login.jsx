import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login(emailTrimmed, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-shield-bg flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-[#080d1a] p-12">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 rounded-full bg-green-500/8 blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-16 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center glow-blue transition-transform group-hover:scale-105">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-white">BugShield</p>
              <p className="text-xs text-slate-500 font-medium tracking-wider">AI SECURITY SCANNER</p>
            </div>
          </Link>

          <h1 className="text-5xl font-black text-white leading-tight max-w-lg">
            Security scanning<br />
            <span className="gradient-text">built for modern</span><br />
            builders.
          </h1>
          <p className="mt-6 text-slate-400 max-w-sm leading-relaxed">
            Fast, secure JWT-authenticated access. Upload code repositories, detect OWASP vulnerabilities, get AI fixes, and export reports safely.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { label: "JWT-secured role-based access (RBAC)", color: "text-blue-400" },
              { label: "AI-powered vulnerability detection", color: "text-green-400" },
              { label: "Supports Python, JS, Java & more", color: "text-purple-400" },
              { label: "PDF, JSON & CSV report export", color: "text-cyan-400" },
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
              { t: "Authenticating JWT session…", c: "text-slate-400" },
              { t: "✓ Token signature verified", c: "text-green-400" },
              { t: "✓ User authorized for dashboard", c: "text-blue-400" },
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
      <div className="flex-none w-full lg:w-[480px] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to home
          </Link>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center glow-blue">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-black text-white">BugShield</span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Sign In</h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter your credentials to access your security dashboard.
            </p>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@company.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d1424] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0d1424] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-sm transition-all glow-blue disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
