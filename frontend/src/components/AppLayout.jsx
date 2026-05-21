import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3, FileArchive, History, LogOut, Settings,
  Shield, Upload, ChevronRight, Zap, User, Menu, ArrowLeft, X, MoreVertical, Users
} from "lucide-react";
import { getUser } from "../api/client.js";
import NotificationBell from "./NotificationBell.jsx";
import { ChatProvider } from "../context/ChatContext.jsx";
import AIChatPanel from "./AIChatPanel.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/dashboard/upload", label: "Upload & Scan", icon: Upload },
  { to: "/dashboard/projects", label: "Projects", icon: FileArchive },
  { to: "/dashboard/history", label: "Scan History", icon: History },
  { to: "/dashboard/reports", label: "Reports", icon: Shield },
  { to: "/dashboard/users", label: "User Management", icon: Users, adminOnly: true },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "BS";

  return (
    <ChatProvider>
      <div className="min-h-screen bg-shield-bg text-shield-text">
        {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 w-64 flex flex-col border-r border-white/[0.06] bg-[#0d1424] z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Mobile close button */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-6 right-4 lg:hidden text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center glow-blue flex-shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[15px] font-black tracking-tight text-white">BugShield</p>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider">AI SECURITY SCANNER</p>
          </div>
        </Link>

        {/* Status indicator */}
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl bg-green-500/8 border border-green-500/15 px-3 py-2.5">
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.6)] flex-shrink-0" />
          <span className="text-xs text-green-400 font-semibold">System Operational</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end, adminOnly }) => {
            if (adminOnly && user?.role !== "admin") return null;
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group relative
                  ${isActive
                    ? "bg-blue-600/15 text-blue-400 nav-active"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`
                }
              >
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role || "developer"}</p>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="w-7 h-7 rounded-lg hover:bg-red-500/15 hover:text-red-400 flex items-center justify-center text-slate-500 transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0d1424]/90 backdrop-blur-xl px-5 py-3">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            {/* Mobile menu toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white mr-1"
            >
              <Menu size={18} />
            </button>
            
            {/* Back button (Hidden on root dashboard to prevent navigating back to login) */}
            {location.pathname !== "/dashboard" && (
              <button 
                onClick={() => navigate(-1)}
                className="text-slate-400 hover:text-white transition-colors mr-2"
                title="Go Back"
              >
                <ArrowLeft size={16} />
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2">
              <Shield size={14} className="text-blue-400" />
              <span>BugShield</span>
              <ChevronRight size={12} />
              <span className="text-slate-300 font-medium">Console</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Live scan indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 border border-white/8 rounded-lg px-3 py-1.5">
              <Zap size={11} className="text-blue-400" />
              <span>AI Scanner Active</span>
            </div>
            <NotificationBell />
            {/* User avatar dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-black text-white hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                title="Account Settings"
              >
                {initials}
              </button>
              
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0d1424] border border-white/10 shadow-2xl py-1 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-bold text-white truncate">{user?.name || "User"}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || "No email"}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
                        ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 
                          user?.role === 'developer' ? 'bg-blue-500/20 text-blue-400' : 
                          'bg-green-500/20 text-green-400'}`}>
                        {user?.role || "developer"}
                      </span>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={14} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-5 md:p-7">
          <Outlet />
        </div>
      </main>
      <AIChatPanel />
    </div>
    </ChatProvider>
  );
}
