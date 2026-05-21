import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { api, getUser } from "../api/client.js";
import { 
  ArrowLeft, Shield, User, Calendar, Activity, 
  Folder, Zap, Bell, Loader2, AlertTriangle, 
  CheckCircle2, Info
} from "lucide-react";

export default function UserActivity() {
  const { id } = useParams();
  const currentUser = getUser();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ensure only admins can access this page
  if (currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchActivity();
  }, [id]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const res = await api(`/users/${id}/activity`);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load user activity");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
        <p className="font-medium">Loading user activity profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/dashboard/users" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Users
          </Link>
        </div>
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-red-200">Activity Profile Not Found</h3>
            <p className="text-sm mt-1 opacity-80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { user, projects, notifications, stats } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header & Navigation */}
      <div>
        <Link to="/dashboard/users" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft size={16} /> Back to User Management
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 p-6 rounded-2xl bg-[#0d1424] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-blue-900/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User size={14} /> {user.email}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar size={14} /> Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
                  ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 
                    user.role === 'developer' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-green-500/20 text-green-400'}`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5 flex items-center gap-4 border border-blue-500/10">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Folder size={24} />
          </div>
          <div>
            <p className="text-3xl font-black text-white">{stats.total_projects}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects Uploaded</p>
          </div>
        </div>
        
        <div className="glass rounded-xl p-5 flex items-center gap-4 border border-purple-500/10">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-3xl font-black text-white">{stats.total_scans}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Scans Run</p>
          </div>
        </div>

        <div className="glass rounded-xl p-5 flex items-center gap-4 border border-emerald-500/10">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-3xl font-black text-white">{notifications.length}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Events</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Table */}
        <div className="bg-[#0d1424] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Folder size={18} className="text-blue-400" />
              Uploaded Projects
            </h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/[0.02] border-b border-white/10 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3">Project Name</th>
                  <th className="px-5 py-3 text-center">Scans</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-slate-500">
                      No projects uploaded yet.
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 font-medium text-white">{p.project_name}</td>
                      <td className="px-5 py-3 text-center text-slate-400 font-medium bg-white/[0.01]">
                        {p.total_scans}
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {new Date(p.upload_date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md
                          ${p.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                            p.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' : 
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Notifications / Activity Log */}
        <div className="bg-[#0d1424] border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[500px]">
          <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell size={18} className="text-purple-400" />
              Activity Log (Notifications)
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                <Bell size={32} className="opacity-20 mb-3" />
                <p>No recent activity logs found for this user.</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {notifications.map((notif) => (
                  <li key={notif.id} className="p-4 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.05]">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 shrink-0 ${
                        notif.level === 'success' ? 'text-green-400' :
                        notif.level === 'warning' ? 'text-amber-400' :
                        notif.level === 'error' ? 'text-red-400' :
                        'text-blue-400'
                      }`}>
                        {notif.level === 'success' ? <CheckCircle2 size={16} /> :
                         notif.level === 'warning' ? <AlertTriangle size={16} /> :
                         notif.level === 'error' ? <AlertTriangle size={16} /> :
                         <Info size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200">{notif.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-2">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
