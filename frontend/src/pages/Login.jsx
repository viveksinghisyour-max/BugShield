import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Mail, RefreshCw, Shield, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, user } = useAuth();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Resend timer countdown
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setInfo("");

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(email.trim());
      setStep(2);
      setCooldown(60);
      setInfo(res.message || `Verification code sent to ${email}`);
      // Focus first OTP input
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch (err) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Digit Change Handler
  const handleOtpChange = (index, value) => {
    // Keep only numbers
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (!cleanValue && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue.slice(-1); // Take last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Keyboard navigation for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste handler for full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const digits = pasted.split("");
      const newOtp = ["", "", "", "", "", ""];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");

    const fullCode = otp.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email.trim(), fullCode, name.trim());
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await sendOtp(email.trim());
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      setInfo("A new 6-digit code has been sent!");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Failed to resend verification code.");
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
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center glow-blue">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-white">BugShield</p>
              <p className="text-xs text-slate-500 font-medium tracking-wider">AI SECURITY SCANNER</p>
            </div>
          </div>

          <h1 className="text-5xl font-black text-white leading-tight max-w-lg">
            Security scanning<br />
            <span className="gradient-text">built for modern</span><br />
            builders.
          </h1>
          <p className="mt-6 text-slate-400 max-w-sm leading-relaxed">
            Instant passwordless Email OTP sign in. Upload code, detect vulnerabilities, get AI fixes, and export reports safely.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { label: "Passwordless 6-digit Email OTP Auth", color: "text-blue-400" },
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
              { t: "Authenticating via Email OTP…", c: "text-slate-400" },
              { t: "✓ Code verified successfully", c: "text-green-400" },
              { t: "✓ User session active", c: "text-blue-400" },
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

          {step === 1 ? (
            /* STEP 1: ENTER EMAIL */
            <div>
              <h2 className="text-3xl font-black text-white">Sign In</h2>
              <p className="mt-2 text-sm text-slate-500">Enter your email to receive a 6-digit OTP</p>

              <form onSubmit={handleSendOtp} className="mt-8 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      type="email"
                      required
                      value={email}
                      placeholder="you@example.com"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-fade-in">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm font-bold text-white transition-all glow-blue flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  {loading ? "Sending Code…" : "Send Verification Code"}
                </button>

                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-400">
                  <KeyRound size={13} className="text-green-400" />
                  <span>🔒 Passwordless & secure (6-digit OTP)</span>
                </div>

                <p className="text-center text-sm text-slate-500 pt-4">
                  New to BugShield?{" "}
                  <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                    Create account
                  </Link>
                </p>
              </form>
            </div>
          ) : (
            /* STEP 2: VERIFY OTP */
            <div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                  setInfo("");
                }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft size={14} />
                Change email
              </button>

              <h2 className="text-3xl font-black text-white">Verify Code</h2>
              <p className="mt-2 text-sm text-slate-400">
                We sent a 6-digit verification code to <br />
                <span className="font-semibold text-blue-400">{email}</span>
              </p>

              {info && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 flex-none" />
                  <span>{info}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Enter 6-Digit Code
                    </label>
                    <span className="text-[11px] text-amber-400/90 font-mono">Max 3 attempts</span>
                  </div>

                  {/* 6 Digit Inputs */}
                  <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-12 h-13 text-center text-xl font-bold font-mono rounded-xl border border-white/10 bg-white/[0.04] text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-fade-in">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm font-bold text-white transition-all glow-blue flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  {loading ? "Verifying…" : "Verify Code"}
                </button>

                {/* Resend OTP Footer */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                  <span>Didn't receive the code?</span>
                  {cooldown > 0 ? (
                    <span className="font-mono text-slate-500">Resend in {cooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                      Resend Code
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
