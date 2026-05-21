import { useState, useEffect } from "react";
import { getUser } from "../api/client.js";
import SecurityMeter from "../components/SecurityMeter.jsx";
import { Mail, Shield, User, Calendar, Scan, Bell } from "lucide-react";

export default function Settings() {
  const user = getUser();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "BS";

  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem("bugshield_prefs");
      return saved ? JSON.parse(saved) : { criticalAlerts: true, scanNotifications: false };
    } catch {
      return { criticalAlerts: true, scanNotifications: false };
    }
  });

  useEffect(() => {
    localStorage.setItem("bugshield_prefs", JSON.stringify(prefs));
  }, [prefs]);

  const togglePref = (key) => {
    if (key === "darkMode") return; // Locked
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const PREFERENCES = [
    { id: "criticalAlerts", label: "Critical Vulnerability Alerts", desc: "Notified when critical issues are found", icon: Bell, active: prefs.criticalAlerts },
    { id: "scanNotifications", label: "Scan Completion Notifications", desc: "Get notified when a scan finishes", icon: Scan, active: prefs.scanNotifications },
  ];

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile card */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-black text-white glow-blue">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-[#0d1424] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-900" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 w-full text-center sm:text-left flex flex-col items-center sm:items-start">
            <h2 className="text-xl font-black text-white truncate w-full">{user?.name || "User"}</h2>
            <p className="text-sm text-slate-500 mt-0.5 truncate w-full" title={user?.email}>{user?.email}</p>
            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 w-full">
               <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold capitalize border border-blue-500/20">
                {user?.role || "developer"}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/15">
                Active
              </span>
            </div>
          </div>

          {/* Security score */}
          <SecurityMeter score={82} size={100} animate />
        </div>
      </div>

      {/* Account details */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Account Details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Full Name", value: user?.name || "-", icon: User },
            { label: "Email Address", value: user?.email || "-", icon: Mail },
            { label: "Role", value: user?.role || "developer", icon: Shield },
            { label: "Member Since", value: "May 2025", icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-white mt-0.5 capitalize">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Preferences</h3>
        <div className="space-y-3">
          {PREFERENCES.map(({ id, label, desc, icon: Icon, active, locked }) => (
            <button
              key={id}
              onClick={() => togglePref(id)}
              disabled={locked}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left
                ${locked ? "bg-white/[0.02] border-transparent cursor-default opacity-80" : "bg-white/[0.03] border-white/5 hover:bg-white/[0.05]"}`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <div className={`w-10 h-5.5 rounded-full relative transition-colors ${active ? "bg-blue-600" : "bg-white/10"}`}
                style={{ height: "22px" }}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
